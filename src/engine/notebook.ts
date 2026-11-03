import {
    create,
    all,
    type MathNode,
    type EvalFunction,
    type FunctionAssignmentNode,
    type AssignmentNode,
    type SymbolNode
} from 'mathjs';
import { formatValue } from './format';

export const math = create(all);

export type LineKind =
    'blank' | 'comment' | 'expression' | 'dynamic' | 'snapshot' | 'function';

export interface LineResult {
    kind: LineKind;
    /** Variable or function this line defines */
    name?: string;
    value?: unknown;
    /** Formatted value for display */
    display?: string;
    error?: string;
    /** Lines this line reads from directly */
    directUses: number[];
    /** Every line this line's result depends on */
    uses: number[];
    /** Every line whose result depends on this line */
    usedBy: number[];
}

type Definition =
    | { kind: 'dynamic'; line: number; code: EvalFunction }
    | { kind: 'snapshot'; line: number; value: unknown; uses: Set<number> }
    | {
          kind: 'function';
          line: number;
          params: string[];
          code: EvalFunction;
      };

const SNAPSHOT = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:=(.*)$/;

class CycleError extends Error {}

/**
 * Evaluates notebook lines top to bottom.
 *
 * `name = expr` is dynamic: it stores the formula, and every use re-runs it
 * against the variables as they are at that point in the notebook.
 * `name := expr` is a snapshot: the value is computed once, where it's written.
 */
export const evaluateNotebook = (lines: string[]): LineResult[] => {
    const definitions = new Map<string, Definition>();
    let previous: { line: number; value: unknown; uses: Set<number> } | null =
        null;

    // Dependency tracking for the line currently being evaluated
    let direct = new Set<number>();
    let uses = new Set<number>();
    let depth = 0;
    const resolving: string[] = [];
    const locals: Record<string, unknown>[] = [];

    const nested = <T>(fn: () => T): T => {
        depth++;
        try {
            return fn();
        } finally {
            depth--;
        }
    };

    const record = (line: number) => {
        if (depth === 0) {
            direct.add(line);
        }
        uses.add(line);
    };

    const scope = {
        has(name: string) {
            return (
                locals.some((l) => name in l) ||
                definitions.has(name) ||
                (name === 'ans' && previous !== null)
            );
        },
        get(name: string): unknown {
            for (let i = locals.length - 1; i >= 0; i--) {
                if (name in locals[i]) {
                    return locals[i][name];
                }
            }

            const def = definitions.get(name);
            if (!def) {
                if (name === 'ans' && previous) {
                    record(previous.line);
                    previous.uses.forEach((l) => uses.add(l));
                    return previous.value;
                }
                return undefined;
            }

            record(def.line);
            switch (def.kind) {
                case 'snapshot':
                    def.uses.forEach((l) => uses.add(l));
                    return def.value;
                case 'dynamic':
                    if (resolving.includes(name)) {
                        const loop = resolving.slice(resolving.indexOf(name));
                        throw new CycleError(
                            loop.length === 1
                                ? `${name} can’t use itself. Try := instead`
                                : `Loop: ${[...loop, name].join(' → ')}`
                        );
                    }
                    resolving.push(name);
                    try {
                        return nested(() => def.code.evaluate(scope));
                    } finally {
                        resolving.pop();
                    }
                case 'function':
                    return (...args: unknown[]) => {
                        const frame: Record<string, unknown> = {};
                        def.params.forEach((p, i) => (frame[p] = args[i]));
                        locals.push(frame);
                        try {
                            return nested(() => def.code.evaluate(scope));
                        } finally {
                            locals.pop();
                        }
                    };
            }
        },
        set(name: string, value: unknown) {
            if (locals.length > 0) {
                locals[locals.length - 1][name] = value;
            }
        },
        keys() {
            return definitions.keys();
        },
        delete() {},
        clear() {}
    };

    const results: LineResult[] = lines.map((text, line) => {
        direct = new Set();
        uses = new Set();
        const trimmed = text.trim();
        const result: LineResult = {
            kind: 'expression',
            directUses: [],
            uses: [],
            usedBy: []
        };

        if (trimmed === '') {
            result.kind = 'blank';
            return result;
        }
        if (trimmed.startsWith('#')) {
            result.kind = 'comment';
            return result;
        }

        try {
            const snapshot = SNAPSHOT.exec(text);
            if (snapshot) {
                const [, name, expression] = snapshot;
                result.kind = 'snapshot';
                result.name = name;
                result.value = math.parse(expression).compile().evaluate(scope);
                definitions.set(name, {
                    kind: 'snapshot',
                    line,
                    value: result.value,
                    uses: new Set(uses)
                });
            } else {
                const node: MathNode = math.parse(text);
                if (node.type === 'BlockNode') {
                    throw new Error('Write one calculation per line');
                }

                if (
                    node.type === 'AssignmentNode' &&
                    (node as AssignmentNode).object.type === 'SymbolNode'
                ) {
                    const assignment = node as AssignmentNode;
                    const name = (assignment.object as SymbolNode).name;
                    result.kind = 'dynamic';
                    result.name = name;
                    definitions.set(name, {
                        kind: 'dynamic',
                        line,
                        code: assignment.value.compile()
                    });
                    // Evaluate through the scope so loops are caught. Start a
                    // level up so the formula's own reads count as direct.
                    depth--;
                    try {
                        result.value = scope.get(name);
                    } finally {
                        depth++;
                    }
                } else if (node.type === 'FunctionAssignmentNode') {
                    const fn = node as FunctionAssignmentNode;
                    result.kind = 'function';
                    result.name = fn.name;
                    definitions.set(fn.name, {
                        kind: 'function',
                        line,
                        params: fn.params,
                        code: fn.expr.compile()
                    });
                } else {
                    result.value = node.compile().evaluate(scope);
                }
            }

            if (result.value !== undefined && result.kind !== 'function') {
                previous = { line, value: result.value, uses: new Set(uses) };
            }
            result.display =
                result.kind === 'function'
                    ? undefined
                    : formatValue(result.value);
        } catch (error) {
            result.error = describeError(error);
        }

        // A dynamic line's own definition isn't a dependency
        direct.delete(line);
        uses.delete(line);
        result.directUses = [...direct].sort((a, b) => a - b);
        result.uses = [...uses].sort((a, b) => a - b);
        return result;
    });

    results.forEach((result, line) => {
        result.uses.forEach((used) => results[used].usedBy.push(line));
    });

    return results;
};

export const describeError = (error: unknown): string => {
    const message = error instanceof Error ? error.message : String(error);
    const undefinedSymbol = /^Undefined symbol (.+)$/.exec(message);
    if (undefinedSymbol) {
        return `${undefinedSymbol[1]} isn't defined`;
    }
    return message;
};

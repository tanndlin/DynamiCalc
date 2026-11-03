import Math from 'math-expression-evaluator';
import type {
    CreateToast,
    Equation,
    RemoveToast,
    VarMode,
    VariableScope,
    Vars
} from '../types';

export type CreateNewVar = (
    key: string,
    value: string | number
) => string | number;

export type Result = string | number;

interface EvaluateOptions {
    input: string | number;
    equations: Equation[];
    vars: Vars;
    varMode: VarMode;
    createNewVar?: CreateNewVar;
    createToast?: CreateToast;
    removeToast?: RemoveToast;
    showToasts?: boolean;
}

export const getScope = (vars: Vars, varMode: VarMode): VariableScope =>
    vars[varMode ? 'true' : 'false'];

export const evaluate = ({
    input,
    equations,
    vars,
    varMode,
    createNewVar,
    createToast,
    removeToast,
    showToasts
}: EvaluateOptions): Result => {
    let expression = `${input}`.replace(/ /g, '');
    try {
        // Replace ans with previous answer
        if (expression.includes('ans')) {
            const lastOutput = equations[equations.length - 1]?.output;
            if (lastOutput === undefined) {
                throw new Error('No previous answer');
            }

            expression = expression.replaceAll('ans', `(${lastOutput})`);
        }

        if (expression.includes('=')) {
            const [key, value] = expression.split('=');
            return createVar({
                key,
                value,
                equations,
                vars,
                varMode,
                createNewVar
            });
        }

        expression = replaceVars({ input: expression, vars, varMode });
        return Math.eval(expression);
    } catch (error) {
        if (!showToasts || !createToast || !removeToast) {
            return 'ERROR';
        }

        const id = createToast({
            title: 'Error',
            equation: expression,
            message: error instanceof Error ? error.message : String(error)
        });

        setTimeout(() => {
            removeToast(id);
        }, 5000);

        console.log(error);
        return 'ERROR';
    }
};

export const getVarMode = (varMode: VarMode) => {
    return varMode ? 'static' : 'dynamic';
};

interface ReplaceVarsOptions {
    input: string;
    vars: Vars;
    varMode: VarMode;
}

export const replaceVars = ({
    input,
    vars,
    varMode
}: ReplaceVarsOptions): string => {
    let newInput = input;
    const scope = getScope(vars, varMode);

    // Do the largest length named vars first
    // This is to prevent replacing a substring of a var
    const sortedVars = Object.keys(scope).sort((a, b) => {
        return b.length - a.length;
    });

    sortedVars.forEach((key) => {
        newInput = newInput.replace(key, `(${scope[key].value})`);
    });

    // Recursively evaluate vars
    if (newInput !== input) {
        return replaceVars({ input: newInput, vars, varMode });
    }

    return newInput;
};

interface CreateVarOptions {
    key: string;
    value: string;
    equations: Equation[];
    vars: Vars;
    varMode: VarMode;
    createNewVar?: CreateNewVar;
}

const requireCreateNewVar = (createNewVar?: CreateNewVar): CreateNewVar => {
    if (!createNewVar) {
        throw new Error('Cannot assign variables here');
    }
    return createNewVar;
};

export const assignStaticVar = ({
    key,
    value,
    equations,
    vars,
    varMode,
    createNewVar
}: CreateVarOptions): Result => {
    return requireCreateNewVar(createNewVar)(
        key,
        evaluate({
            input: replaceVars({ input: value, vars, varMode }),
            equations,
            vars,
            varMode,
            createNewVar
        })
    );
};

export const createVar = (options: CreateVarOptions): Result => {
    const { key, value, vars, varMode, createNewVar } = options;
    if (getVarMode(varMode) === 'static') {
        return assignStaticVar(options);
    }

    // This is a dynamic var
    if (causesCircularReference({ key, value, vars, varMode })) {
        throw new Error('This causes a circular reference');
    }

    return requireCreateNewVar(createNewVar)(key, value);
};

interface CircularReferenceOptions {
    key: string;
    value: string;
    vars: Vars;
    varMode: VarMode;
}

export const causesCircularReference = ({
    key,
    value,
    vars,
    varMode
}: CircularReferenceOptions): boolean => {
    // Check for self reference
    if (value.includes(key)) {
        return true;
    }

    // Use BFS
    const newVars: VariableScope = { ...getScope(vars, varMode) };
    newVars[key] = { value };

    const queue = [key];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const current = queue.shift()!;
        visited.add(current);

        // If the var doesn't exist, skip it
        // Only care about vars that are referenced
        if (!newVars[current]) {
            continue;
        }

        const references = `${newVars[current].value}`.match(/[A-Z]/g);
        if (!references) {
            continue;
        }

        for (const reference of references) {
            if (reference === key) {
                return true;
            }

            if (!visited.has(reference)) {
                queue.push(reference);
            }
        }
    }

    return false;
};

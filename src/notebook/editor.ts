import {
    EditorState,
    StateField,
    type Extension,
    type Range
} from '@codemirror/state';
import {
    Decoration,
    EditorView,
    WidgetType,
    keymap,
    placeholder,
    type DecorationSet
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { evaluateNotebook, type LineResult } from '../engine/notebook';

/** Evaluation results for every line, recomputed when the text changes. */
export const resultsField = StateField.define<LineResult[]>({
    create: (state) => evaluateNotebook(state.doc.toJSON()),
    update: (results, tr) =>
        tr.docChanged ? evaluateNotebook(tr.state.doc.toJSON()) : results
});

/** Zero-based index of the line holding the cursor. */
export const activeLine = (state: EditorState) =>
    state.doc.lineAt(state.selection.main.head).number - 1;

type Relation = 'source' | 'uses' | 'used-by';

/** How each line relates to the line holding the cursor. */
export const relations = (
    results: LineResult[],
    active: number
): Map<number, Relation> => {
    const map = new Map<number, Relation>();
    const current = results[active];
    if (
        !current ||
        (current.uses.length === 0 && current.usedBy.length === 0)
    ) {
        return map;
    }

    map.set(active, 'source');
    current.uses.forEach((line) => map.set(line, 'uses'));
    current.usedBy.forEach((line) => map.set(line, 'used-by'));
    return map;
};

class ResultWidget extends WidgetType {
    constructor(
        readonly text: string,
        readonly kind: 'value' | 'error' | 'pending'
    ) {
        super();
    }

    eq(other: ResultWidget) {
        return other.text === this.text && other.kind === this.kind;
    }

    toDOM() {
        const el = document.createElement('span');
        el.className = `nb-result nb-result--${this.kind}`;
        el.textContent = this.kind === 'pending' ? '…' : this.text;
        if (this.kind !== 'value') {
            el.title = this.text;
        }
        return el;
    }

    ignoreEvent() {
        return false;
    }
}

const TOKEN =
    /(#.*$)|(:=|=)|(\d[\d.]*(?:e[+-]?\d+)?%?)|([A-Za-z_][A-Za-z0-9_]*)/g;

const mark = (cls: string) => Decoration.mark({ class: cls });
const marks = {
    comment: mark('nb-tok-comment'),
    assign: mark('nb-tok-assign'),
    number: mark('nb-tok-number'),
    name: mark('nb-tok-name'),
    word: mark('nb-tok-word')
};

const buildDecorations = (state: EditorState): DecorationSet => {
    const results = state.field(resultsField);
    const active = activeLine(state);
    const related = relations(results, active);
    const defined = new Set(
        results.map((r) => r.name).filter((n): n is string => !!n)
    );
    const ranges: Range<Decoration>[] = [];

    for (let i = 0; i < state.doc.lines; i++) {
        const line = state.doc.line(i + 1);
        const result = results[i];
        if (!result) {
            continue;
        }

        const classes = [`nb-line--${result.kind}`];
        if (result.error || result.display !== undefined) {
            classes.push('nb-has-result');
        }
        const relation = related.get(i);
        if (relation) {
            classes.push(`nb-rel--${relation}`);
        }
        ranges.push(
            Decoration.line({ class: classes.join(' ') }).range(line.from)
        );

        if (result.kind === 'comment') {
            ranges.push(marks.comment.range(line.from, line.to));
        } else if (result.kind !== 'blank') {
            for (const match of line.text.matchAll(TOKEN)) {
                const from = line.from + match.index;
                const to = from + match[0].length;
                const [, comment, assign, number, word] = match;
                const deco = comment
                    ? marks.comment
                    : assign
                      ? marks.assign
                      : number
                        ? marks.number
                        : defined.has(word) || word === 'ans'
                          ? marks.name
                          : marks.word;
                ranges.push(deco.range(from, to));
            }
        }

        let widget: ResultWidget | null = null;
        if (result.error) {
            widget = new ResultWidget(
                result.error,
                i === active ? 'pending' : 'error'
            );
        } else if (result.display !== undefined) {
            widget = new ResultWidget(result.display, 'value');
        }
        if (widget) {
            ranges.push(Decoration.widget({ widget, side: 1 }).range(line.to));
        }
    }

    return Decoration.set(ranges, true);
};

const decorations = EditorView.decorations.compute(
    [resultsField, 'selection'],
    buildDecorations
);

export const notebookExtensions = (): Extension[] => [
    resultsField,
    decorations,
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    EditorView.lineWrapping,
    EditorView.contentAttributes.of({
        'aria-label': 'Notebook',
        spellcheck: 'false',
        autocapitalize: 'off',
        autocorrect: 'off'
    }),
    placeholder('Type a calculation, like  price = 120')
];

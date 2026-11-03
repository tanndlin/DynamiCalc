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

/** Puts the cursor on an empty last line, adding one if needed. */
export const appendLine = (view: EditorView) => {
    const end = view.state.doc.length;
    const last = view.state.doc.lineAt(end);
    view.dispatch({
        changes: last.length > 0 ? { from: end, insert: '\n' } : undefined,
        selection: { anchor: last.length > 0 ? end + 1 : end },
        scrollIntoView: true
    });
    view.focus();
};

class AddLineWidget extends WidgetType {
    eq() {
        return true;
    }

    toDOM(view: EditorView) {
        const el = document.createElement('div');
        el.className = 'nb-add-line';
        el.setAttribute('role', 'button');
        el.innerHTML =
            '<span class="nb-add-line__plus">+</span> New line <kbd>Enter</kbd>';
        el.addEventListener('mousedown', (event) => {
            event.preventDefault();
            appendLine(view);
        });
        return el;
    }
}

/** Removes the line at `pos`, along with its line break. */
export const deleteLineAt = (view: EditorView, pos: number) => {
    const { doc } = view.state;
    const line = doc.lineAt(pos);
    const from =
        line.number < doc.lines ? line.from : Math.max(0, line.from - 1);
    const to = line.number < doc.lines ? line.to + 1 : line.to;
    view.dispatch({
        changes: { from, to },
        selection: { anchor: Math.min(from, doc.length - (to - from)) }
    });
    view.focus();
};

class DeleteLineWidget extends WidgetType {
    eq() {
        return true;
    }

    toDOM(view: EditorView) {
        const el = document.createElement('span');
        el.className = 'nb-delete-line';
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', 'Delete line');
        el.title = 'Delete line (Ctrl+Shift+K)';
        el.textContent = '×';
        el.addEventListener('mousedown', (event) => {
            event.preventDefault();
            deleteLineAt(view, view.posAtDOM(el));
        });
        return el;
    }
}

class HintWidget extends WidgetType {
    eq() {
        return true;
    }

    toDOM() {
        const el = document.createElement('span');
        el.className = 'nb-hint';
        el.setAttribute('aria-hidden', 'true');
        el.textContent = 'name = value';
        return el;
    }
}

const addLine = Decoration.widget({
    widget: new AddLineWidget(),
    block: true,
    side: 1
});
const hint = Decoration.widget({ widget: new HintWidget(), side: 1 });
const deleteButton = Decoration.widget({
    widget: new DeleteLineWidget(),
    side: -1
});

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
        if (i === active) {
            classes.push('nb-active');
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

        if (state.doc.length > 0) {
            ranges.push(deleteButton.range(line.from));
        }
        if (i === active && line.length === 0 && state.doc.length > 0) {
            ranges.push(hint.range(line.from));
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

    ranges.push(addLine.range(state.doc.length));
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
    // Clicking the empty sheet below the last line starts a new one
    EditorView.domEventHandlers({
        mousedown: (event, view) => {
            const end = view.coordsAtPos(view.state.doc.length);
            if (event.button !== 0 || !end || event.clientY <= end.bottom) {
                return false;
            }
            event.preventDefault();
            appendLine(view);
            return true;
        }
    }),
    EditorView.contentAttributes.of({
        'aria-label': 'Notebook',
        spellcheck: 'false',
        autocapitalize: 'off',
        autocorrect: 'off'
    }),
    placeholder('Type a calculation, like  price = 120')
];

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { EditorView } from '@codemirror/view';
import App from '../App';
import { STARTER_NOTEBOOK } from '../notebook/storage';

(
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;

const render = async () => {
    window.history.pushState({}, '', '/');
    document.body.innerHTML = '<div id="root"></div>';
    root = createRoot(document.getElementById('root')!);
    await act(async () => root.render(<App />));
};

const editor = () =>
    EditorView.findFromDOM(
        document.querySelector('.cm-editor') as HTMLElement
    )!;

const results = () =>
    [...document.querySelectorAll('.nb-result')].map((el) => el.textContent);

beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
});

afterEach(async () => {
    await act(async () => root.unmount());
    vi.useRealTimers();
});

describe('NotebookPage', () => {
    it('opens the starter notebook with results', async () => {
        await render();
        expect(editor().state.doc.toString()).toBe(STARTER_NOTEBOOK);
        expect(results()).toContain('129.6');
    });

    it('updates results as the text changes and saves it', async () => {
        localStorage.setItem('notebook', 'a = 2\nb = a * 10');
        await render();
        expect(results()).toEqual(['2', '20']);

        await act(async () =>
            editor().dispatch({ changes: { from: 4, to: 5, insert: '5' } })
        );
        expect(results()).toEqual(['5', '50']);

        await act(async () => vi.advanceTimersByTime(500));
        expect(localStorage.getItem('notebook')).toBe('a = 5\nb = a * 10');
    });

    it('brings over variables saved by the old calculator', async () => {
        localStorage.setItem(
            'vars',
            JSON.stringify({
                false: { A: { value: '5', description: '' } },
                true: { B: { value: 7, description: '' } }
            })
        );
        await render();
        expect(editor().state.doc.toString()).toBe('A = 5\nB := 7');
    });

    it('adds a new line from the button below the last line', async () => {
        localStorage.setItem('notebook', 'a = 2');
        await render();
        const button = document.querySelector('.nb-add-line')!;

        await act(async () => {
            button.dispatchEvent(
                new MouseEvent('mousedown', { bubbles: true })
            );
        });
        expect(editor().state.doc.toString()).toBe('a = 2\n');
        expect(editor().state.selection.main.head).toBe(6);
        expect(document.querySelector('.nb-hint')).not.toBeNull();

        // A second click reuses the empty line instead of stacking blanks
        await act(async () => {
            button.dispatchEvent(
                new MouseEvent('mousedown', { bubbles: true })
            );
        });
        expect(editor().state.doc.toString()).toBe('a = 2\n');
    });

    it('deletes a line from its delete button', async () => {
        localStorage.setItem('notebook', 'a = 2\nb = 3\nc = 4');
        await render();
        const buttons = () => document.querySelectorAll('.nb-delete-line');

        await act(async () => {
            buttons()[1].dispatchEvent(
                new MouseEvent('mousedown', { bubbles: true })
            );
        });
        expect(editor().state.doc.toString()).toBe('a = 2\nc = 4');

        await act(async () => {
            buttons()[1].dispatchEvent(
                new MouseEvent('mousedown', { bubbles: true })
            );
        });
        expect(editor().state.doc.toString()).toBe('a = 2');
    });
});

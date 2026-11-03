import { useMemo, useRef } from 'react';
import NotebookEditor from '../notebook/NotebookEditor';
import { loadNotebook, saveNotebook } from '../notebook/storage';

const SAVE_DELAY_MS = 300;

const NotebookPage = () => {
    const initialText = useMemo(loadNotebook, []);
    const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const onChange = (text: string) => {
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => saveNotebook(text), SAVE_DELAY_MS);
    };

    return (
        <main className="notebook-page">
            <div className="notebook-sheet">
                <NotebookEditor initialText={initialText} onChange={onChange} />
            </div>
            <footer className="notebook-legend" aria-label="Syntax">
                <span>
                    <code>=</code> recalculates wherever it’s used
                </span>
                <span>
                    <code>:=</code> keeps the value from its line
                </span>
                <span>
                    <code>#</code> starts a note
                </span>
                <span>
                    <code>ans</code> is the previous result
                </span>
                <span className="notebook-legend__wires">
                    <i className="swatch swatch--uses" /> uses
                    <i className="swatch swatch--used-by" /> used by
                </span>
            </footer>
        </main>
    );
};

export default NotebookPage;

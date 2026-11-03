import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { notebookExtensions } from './editor';
import { dependencyWires } from './wires';

interface NotebookEditorProps {
    initialText: string;
    onChange: (text: string) => void;
}

const NotebookEditor = ({ initialText, onChange }: NotebookEditorProps) => {
    const host = useRef<HTMLDivElement>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        const view = new EditorView({
            parent: host.current!,
            state: EditorState.create({
                doc: initialText,
                extensions: [
                    notebookExtensions(),
                    dependencyWires,
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            onChangeRef.current(update.state.doc.toString());
                        }
                    })
                ]
            })
        });
        view.focus();

        // The editor owns the text after it mounts, so this runs once
        return () => view.destroy();
    }, []);

    return <div ref={host} className="nb-editor" />;
};

export default NotebookEditor;

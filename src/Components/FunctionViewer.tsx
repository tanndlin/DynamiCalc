import React from 'react';
import FunctionEditor from './FunctionEditor';
import type { GraphFunction } from '../types';

interface FunctionViewerProps {
    functions: GraphFunction[];
    setFunctions: (functions: GraphFunction[]) => void;
}

const FunctionViewer = (props: FunctionViewerProps) => {
    const { functions, setFunctions } = props;

    const colors = ['black', 'red', 'green', 'blue', 'yellow', 'purple'];

    const createNewFunction = () => {
        const newFn = { f: '', color: colors[functions.length] };
        setFunctions([...functions, newFn]);
    };

    const editFunction = (index: number, fn: GraphFunction) => {
        const newFunctions = [...functions];
        newFunctions[index] = fn;
        setFunctions(newFunctions);
    };

    const deleteFunction = (index: number) => {
        setFunctions(functions.filter((_, i) => i !== index));
    };

    return (
        <aside id="functionContainer" className="h-full w-2/10">
            <section className="h-full flex flex-col justify-between">
                <div className="flex flex-col gap-4 bg-secondary p-4 rounded-md">
                    {functions.map((fn, i) => (
                        <FunctionEditor
                            key={i}
                            fn={fn}
                            edit={(f) => editFunction(i, f)}
                            delete={() => {
                                deleteFunction(i);
                            }}
                        />
                    ))}
                </div>
                <footer className="mx-auto mb-4">
                    <button onClick={createNewFunction} className="text-white">
                        New Function
                    </button>
                </footer>
            </section>
        </aside>
    );
};

export default FunctionViewer;

import React from 'react';
import FunctionViewer from './FunctionViewer';

const FunctionEditor = (props) => {
    const { functions, setFunctions } = props;

    const colors = ['black', 'red', 'green', 'blue', 'yellow', 'purple'];

    const createNewFunction = () => {
        const newFn = { f: '', color: colors[functions.length] };
        setFunctions([...functions, newFn]);
    };

    const editFunction = (index, fn) => {
        const newFunctions = [...functions];
        newFunctions[index] = fn;
        setFunctions(newFunctions);
    };

    const deleteFunction = (index) => {
        setFunctions(functions.filter((_, i) => i !== index));
    };

    return (
        <aside className="h-full w-2/10">
            <section className="h-full flex flex-col justify-between">
                <div className="flex flex-col gap-4">
                    {functions.map((fn, i) => (
                        <FunctionViewer
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

export default FunctionEditor;

import React from 'react';
import FunctionViewer from './FunctionViewer';

const FunctionEditor = (props) => {
    const { functions, setFunctions } = props;

    const editFunction = (index, fn) => {
        const newFunctions = [...functions];
        newFunctions[index] = fn;
        setFunctions(newFunctions);
    };

    return (
        <aside className="h-full w-2/10">
            <div className="bg-secondary">
                <div className="flex flex-col gap-4">
                    {functions.map((fn, i) => (
                        <FunctionViewer
                            key={i}
                            fn={fn}
                            edit={(f) => editFunction(i, f)}
                        />
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default FunctionEditor;

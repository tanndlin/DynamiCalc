import React from 'react';
import Variable from './Variable';
import type { Result } from '../utils/Evaluate';
import type { Variable as VariableData, VariableScope } from '../types';

interface VariableViewerProps {
    vars: VariableScope;
    isStatic: boolean;
    evaluate: (input: string | number) => Result;
    deleteVar: (key: string) => void;
    editVar: (key: string, value: VariableData) => void;
}

const VariableViewer = ({
    vars,
    isStatic,
    evaluate,
    deleteVar,
    editVar
}: VariableViewerProps) => {
    return (
        <section id="variables" className="px-4 flex flex-col gap-4">
            <h1 className="text-center text-3xl font-bold">Variables</h1>
            {Object.keys(vars)
                .sort()
                .map((key) => (
                    <Variable
                        key={key}
                        {...{
                            name: key,
                            variable: vars[key],
                            isStatic,
                            evaluate,
                            delete: () => deleteVar(key),
                            editVar: (value: VariableData) =>
                                editVar(key, value)
                        }}
                    />
                ))}
        </section>
    );
};

export default VariableViewer;

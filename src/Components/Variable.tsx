import React from 'react';
import EditableText from './EditableText';
import type { Result } from '../utils/Evaluate';
import type { Variable as VariableData } from '../types';

interface VariableProps {
    name: string;
    variable: VariableData;
    isStatic: boolean;
    evaluate: (input: string | number) => Result;
    delete: () => void;
    editVar: (value: VariableData) => void;
}

const Variable = (props: VariableProps) => {
    const { name, variable, isStatic, evaluate } = props;
    const { value, description = '' } = variable;

    const editVar = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVar = variable;
        newVar.description = e.target.value;
        props.editVar(newVar);
    };

    return (
        <div className="variable relative bg-secondary rounded-md shadow-lg p-2">
            <input
                className="close"
                type="button"
                value="&times;"
                onClick={props.delete}
            />
            <div className="padder" />
            <div>
                <div className="flex">
                    <span className="font-bold h-5">{name + '='}</span>
                    <span className="ml-4">{variable.value}</span>
                    {!isStatic && (
                        <span className="ml-auto max-w-[50%] overflow-x-hidden">
                            {evaluate(value)}
                        </span>
                    )}
                </div>
                <span>
                    <EditableText
                        id={name + 'description'}
                        value={description}
                        onChange={editVar}
                    />
                </span>
            </div>
        </div>
    );
};

export default Variable;

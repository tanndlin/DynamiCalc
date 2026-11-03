import React from 'react';
import type { Equation as EquationData } from '../types';

interface EquationProps {
    equation: EquationData;
    copy: (e: React.MouseEvent<HTMLDivElement>) => void;
    delete: () => void;
}

const Equation = (props: EquationProps) => {
    const { equation } = props;

    return (
        <div
            className="equation relative block shadow-tertiary hover:bg-tertiary rounded-md shadow-md p-2 duration-500"
            onClick={props.copy}
        >
            <input
                className="close"
                type="button"
                value="&times;"
                onClick={props.delete}
            />
            <div>{equation.input}</div>
            <div className="text-right">{equation.output}</div>
        </div>
    );
};

export default Equation;

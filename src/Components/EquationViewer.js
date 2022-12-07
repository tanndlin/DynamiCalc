import React from 'react';
import Equation from './Equation';

const EquationViewer = (props) => {
    const { equations } = props;

    return (
        <div
            id="previousArea"
            className="bg-gray-800 container px-4 py-4 overflow-auto"
        >
            {equations.map((equation, i) => (
                <Equation key={i} equation={equation} />
            ))}
        </div>
    );
};

export default EquationViewer;

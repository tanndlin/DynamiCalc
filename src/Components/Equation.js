import React from 'react';

const Equation = (props) => {
    const { equation } = props;

    return (
        <div className="block">
            <div>{equation.input}</div>
            <div className="text-right">{equation.output}</div>
        </div>
    );
};

export default Equation;

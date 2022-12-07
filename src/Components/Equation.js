import React from 'react';

const Equation = (props) => {
    const { equation } = props;

    return (
        <div
            className="equation relative block hover:bg-sky-900 rounded-md shadow-lg p-2 duration-500"
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

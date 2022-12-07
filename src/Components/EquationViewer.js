import React from 'react';
import Equation from './Equation';

const EquationViewer = (props) => {
    const { equations, setEquationInputter } = props;

    return (
        <div
            id="previousArea"
            className="bg-gray-800 container flex flex-col gap-4 px-4 py-4 overflow-auto"
        >
            {equations.map((equation, i) => (
                <Equation
                    {...{
                        key: i,
                        equation,
                        setEquationInputter,
                        delete: () => {
                            props.deleteEquation(i);
                        },
                        copy: (e) => {
                            if (e.target.className !== 'close') {
                                props.setEquationInputter(equation.input);
                            }
                        }
                    }}
                />
            ))}
        </div>
    );
};

export default EquationViewer;

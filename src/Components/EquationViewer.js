import React from 'react';
import Equation from './Equation';
import { evaluate } from '../utils/Evaluate';

const EquationViewer = (props) => {
    const {
        equations,
        setEquationInputter,
        vars,
        varMode,
        setEquations,
        setVars
    } = props;

    let index = -1;
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            // If the input is empty, run last equation
            if (e.target.value.length === 0) {
                e.target.value = equations[equations.length - 1].input;
            }

            const input = e.target.value;
            const output = evaluate({
                input,
                equations,
                vars,
                varMode,
                setVars
            });
            setEquations([...equations, { input, output }]);
            e.target.value = '';

            // Scroll to bottom of previousArea
            setTimeout(() => {
                const previousArea = document.getElementById('previousArea');
                previousArea.scrollTop = previousArea.scrollHeight;
            }, 100);
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (index === -1) {
                index = equations.length - 1;
                e.target.value = equations[index].input;
            } else if (index > 0) {
                index--;
                e.target.value = equations[index].input;
            } else {
                index = -1;
                e.target.value = '';
            }
            // Put cursor at the end of the input
            e.target.selectionStart = e.target.value.length;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (index === -1) {
                index = 0;
                e.target.value = equations[index].input;
            } else if (index < equations.length - 1) {
                index++;
                e.target.value = equations[index].input;
            } else {
                index = -1;
                e.target.value = '';
            }
            // Put cursor at the end of the input
            e.target.selectionStart = e.target.value.length;
        }

        if (
            ['-', '+', '*', '/'].includes(e.key) &&
            e.target.value.length === 0
        ) {
            e.preventDefault();
            // Put answer in front of operator
            e.target.value = `ans${e.key}`;
        }
    };

    const makeStatic = () => {
        const inputField = document.getElementById('equationInputter');
        if (!inputField.value.includes('=')) {
            inputField.value = evaluate({
                input: inputField.value,
                equations,
                vars,
                varMode,
                setVars
            });
            return;
        }

        const [currentVar, toReplace] = inputField.value.split('=');

        const replaced = evaluate({
            input: toReplace,
            equations,
            vars,
            varMode,
            setVars
        });

        inputField.value = `${currentVar}=${replaced}`;
    };

    return (
        <div className="h-minus-header">
            <div
                id="previousArea"
                className="bg-gray-800 container h-[85vh] flex flex-col gap-4 px-4 py-4 overflow-auto"
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
            <footer id="inputArea" className="flex">
                <span className="m-auto w-full mt-8 gap-4 flex">
                    <input
                        id="equationInputter"
                        className="text-black px-2 py-1 rounded-md w-4/5"
                        type="text"
                        placeholder="Enter an equation or set a varible. ie: 2+2 or A=100/5"
                        onKeyDown={(e) => {
                            handleKeyDown(e);
                        }}
                    />
                    <button
                        className="bg-sky-900  rounded-md p-2"
                        onClick={makeStatic}
                    >
                        Make Static
                    </button>
                </span>
            </footer>
        </div>
    );
};

export default EquationViewer;

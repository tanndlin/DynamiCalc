/* eslint-disable no-unused-vars */
import React from 'react';
import VariableViewer from './VariableViewer';
import EquationViewer from './EquationViewer';
import Options from './Options';
import { evaluate, replaceVars } from '../utils/Evaluate';

const MainContainer = () => {
    const [equations, setEquations] = React.useState(
        JSON.parse(localStorage.getItem('equations')) || []
    );
    const [vars, setVars] = React.useState(
        JSON.parse(localStorage.getItem('vars')) ?? { true: {}, false: {} }
    );

    const [varMode, setVarMode] = React.useState(
        JSON.parse(localStorage.getItem('varMode')) ?? false
    );

    React.useEffect(() => {
        localStorage.setItem('equations', JSON.stringify(equations));
    }, [equations]);

    React.useEffect(() => {
        localStorage.setItem('vars', JSON.stringify(vars));
    }, [vars]);

    React.useEffect(() => {
        localStorage.setItem('varMode', JSON.stringify(varMode));
    }, [varMode]);

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

    const setEquationInputter = (value) => {
        const inputField = document.getElementById('equationInputter');
        inputField.value = value;
        inputField.focus();
    };

    const deleteEquation = (index) => {
        equations.splice(index, 1);
        setEquations([...equations]);
    };

    const deleteVar = (key) => {
        delete vars[varMode][key];
        setVars({ ...vars });
    };

    const makeStatic = () => {
        const inputField = document.getElementById('equationInputter');
        console.log(inputField.value);
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

        console.log(toReplace);

        const replaced = evaluate({
            input: toReplace,
            equations,
            vars,
            varMode,
            setVars
        });

        console.log(replaced);
        inputField.value = `${currentVar}=${replaced}`;
    };

    return (
        <main className="bg-gray-900 h-minus-header flex flex-col text-white">
            <div id="mainContainer" className="h-9/10">
                <VariableViewer
                    {...{
                        vars: vars[varMode],
                        isStatic: varMode,
                        evaluate: (input) =>
                            evaluate({
                                input,
                                equations,
                                vars,
                                varMode,
                                setVars
                            }),
                        deleteVar
                    }}
                />
                <EquationViewer
                    {...{ equations, setEquationInputter, deleteEquation }}
                />
                <Options {...{ setEquations, setVars, varMode, setVarMode }} />
            </div>
            <div id="inputArea" className="flex">
                <span className="m-auto w-1/2 mt-8 gap-4 flex">
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
            </div>
        </main>
    );
};

export default MainContainer;

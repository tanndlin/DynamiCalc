/* eslint-disable no-unused-vars */
import React from 'react';
import Math from 'math-expression-evaluator';
import VariableViewer from './VariableViewer';
import EquationViewer from './EquationViewer';
import Options from './Options';

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

    const getVarMode = () => {
        return varMode ? 'static' : 'dynamic';
    };

    const replaceVars = (input) => {
        let newInput = input;
        for (const key in vars[varMode]) {
            newInput = newInput.replace(key, vars[varMode][key]);
        }

        // Recursively evaluate vars
        if (newInput !== input) {
            return replaceVars(newInput);
        }

        return newInput;
    };

    const evaluate = (input) => {
        try {
            input = `${input}`.replace(/ /g, '');

            if (input.includes('=') && input.indexOf('=') === 1) {
                const [key, value] = input.split('=');
                if (getVarMode() === 'static') {
                    vars[varMode][key] = evaluate(replaceVars(value));
                } else {
                    if (value.includes(key[0])) {
                        throw new Error(
                            'Variable cannot be assigned to itself'
                        );
                    }
                    vars[varMode][key] = value;
                }

                setVars({ ...vars });
                return vars[varMode][key];
            }

            input = replaceVars(input);
            return Math.eval(input);
        } catch (error) {
            return 'ERROR';
        }
    };

    let index = -1;
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const input = e.target.value;
            const output = evaluate(input);
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
    };

    const setEquationInputter = (value) => {
        document.getElementById('equationInputter').value = value;
    };

    const deleteEquation = (index) => {
        equations.splice(index, 1);
        setEquations([...equations]);
    };

    return (
        <main className="bg-gray-900 h-minus-header flex flex-col text-white">
            <div id="mainContainer" className="h-9/10">
                <VariableViewer
                    vars={vars[varMode]}
                    isStatic={varMode}
                    evaluate={evaluate}
                />
                <EquationViewer
                    {...{ equations, setEquationInputter, deleteEquation }}
                />
                <Options {...{ setEquations, setVars, varMode, setVarMode }} />
            </div>
            <div id="inputArea" className="flex">
                <input
                    id="equationInputter"
                    className="m-auto text-black px-2 py-1 rounded-md mt-8 w-1/2"
                    type="text"
                    placeholder="Enter an equation or set a varible. ie: 2+2 or A=100/5"
                    onKeyDown={(e) => {
                        handleKeyDown(e);
                    }}
                />
            </div>
        </main>
    );
};

export default MainContainer;

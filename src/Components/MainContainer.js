/* eslint-disable no-unused-vars */
import React from 'react';
import Math from 'math-expression-evaluator';
import VariableViewer from './VariableViewer';

const MainContainer = () => {
    const [formulas, setFormulas] = React.useState(
        JSON.parse(localStorage.getItem('formulas')) || []
    );
    const [vars, setVars] = React.useState(
        JSON.parse(localStorage.getItem('vars')) ?? {}
    );

    React.useEffect(() => {
        localStorage.setItem('formulas', JSON.stringify(formulas));
    }, [formulas]);

    React.useEffect(() => {
        console.log('here');
        console.log(vars);
        localStorage.setItem('vars', JSON.stringify(vars));
    }, [vars]);

    const replaceVars = (input) => {
        for (const key in vars) {
            input = input.replace(key, vars[key]);
        }

        return input;
    };

    const evaluate = (input) => {
        input = input.replace(/ /g, '');
        console.log(vars);

        if (input.includes('=') && input.indexOf('=') === 1) {
            const [key, value] = input.split('=');
            vars[key] = evaluate(replaceVars(value));

            setVars({ ...vars });
            return vars[key];
        }

        input = replaceVars(input);
        console.log(input);
        try {
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
            setFormulas([...formulas, { input, output }]);
            e.target.value = '';
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (index === -1) {
                index = formulas.length - 1;
                e.target.value = formulas[index].input;
            } else if (index > 0) {
                index--;
                e.target.value = formulas[index].input;
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
                e.target.value = formulas[index].input;
            } else if (index < formulas.length - 1) {
                index++;
                e.target.value = formulas[index].input;
            } else {
                index = -1;
                e.target.value = '';
            }
            // Put cursor at the end of the input
            e.target.selectionStart = e.target.value.length;
        }
    };

    return (
        <main className="bg-blue-400 bg-opacity-50 h-minus-header flex flex-col">
            <div id="mainContainer" className="h-9/10">
                <VariableViewer vars={vars} />
                <div
                    id="previousArea"
                    className="bg-gray-200 container px-4 py-4"
                >
                    {formulas.map((formula, i) => (
                        <div key={i} className="block">
                            <div>{formula.input}</div>
                            <div className="text-right">{formula.output}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div id="inputArea" className="flex">
                <input
                    className="m-auto"
                    type="text"
                    onKeyDown={(e) => {
                        handleKeyDown(e);
                    }}
                />
            </div>
        </main>
    );
};

export default MainContainer;

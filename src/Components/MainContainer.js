/* eslint-disable no-unused-vars */
import React from 'react';
import VariableViewer from './VariableViewer';
import EquationViewer from './EquationViewer';
import Options from './Options';
import { evaluate } from '../utils/Evaluate';

const MainContainer = (props) => {
    const { createToast, removeToast } = props;

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

    const createNewVar = (key, value) => {
        vars[varMode][key] = { value, description: '' };
        setVars({ ...vars });
        return vars[varMode][key].value;
    };

    const editVar = (key, value) => {
        vars[varMode][key] = value;
        setVars({ ...vars });
    };

    return (
        <main className="bg-primary h-minus-header text-white">
            <div id="mainContainer" className="bg-primary min-h-9/10">
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
                                createNewVar,
                                createToast,
                                removeToast
                            }),
                        editVar,
                        deleteVar
                    }}
                />
                <EquationViewer
                    {...{
                        equations,
                        setEquationInputter,
                        deleteEquation,
                        vars,
                        varMode,
                        setEquations,
                        createNewVar,
                        createToast,
                        removeToast
                    }}
                />
                <Options {...{ setEquations, setVars, varMode, setVarMode }} />
            </div>
        </main>
    );
};

export default MainContainer;

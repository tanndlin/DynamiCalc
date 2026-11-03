import React from 'react';
import VariableViewer from './VariableViewer';
import EquationViewer from './EquationViewer';
import Options from './Options';
import { evaluate, getScope } from '../utils/Evaluate';
import { loadJSON } from '../utils/storage';
import type {
    Equation,
    ToastProps,
    VarMode,
    Variable,
    VariableScope,
    Vars
} from '../types';

const MainContainer = ({ createToast, removeToast }: ToastProps) => {
    const [equations, setEquations] = React.useState<Equation[]>(() =>
        loadJSON<Equation[]>('equations', [])
    );
    const [vars, setVars] = React.useState<Vars>(() => ({
        true: {},
        false: {},
        ...loadJSON<Partial<Vars>>('vars', {})
    }));

    const [varMode, setVarMode] = React.useState<VarMode>(() =>
        loadJSON<VarMode>('varMode', false)
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

    const scope: VariableScope = getScope(vars, varMode);

    const setEquationInputter = (value: string) => {
        const inputField = document.getElementById(
            'equationInputter'
        ) as HTMLInputElement | null;
        if (!inputField) {
            return;
        }

        inputField.value = value;
        inputField.focus();
    };

    const deleteEquation = (index: number) => {
        equations.splice(index, 1);
        setEquations([...equations]);
    };

    const deleteVar = (key: string) => {
        delete scope[key];
        setVars({ ...vars });
    };

    const createNewVar = (key: string, value: string | number) => {
        scope[key] = { value, description: '' };
        setVars({ ...vars });
        return scope[key].value;
    };

    const editVar = (key: string, value: Variable) => {
        scope[key] = value;
        setVars({ ...vars });
    };

    window.onmousemove = (e) => {
        const container = document.getElementById('mainContainer');
        if (!container) {
            return;
        }

        // move background
        container.style.backgroundPositionX = `${e.clientX / 50}px`;
        container.style.backgroundPositionY = `${e.clientY / 50}px`;
    };

    return (
        <main className="bg-primary h-minus-header text-white">
            <article id="mainContainer" className="bg-primary min-h-9/10">
                <VariableViewer
                    {...{
                        vars: scope,
                        isStatic: varMode,
                        evaluate: (input) =>
                            evaluate({
                                input,
                                equations,
                                vars,
                                varMode,
                                createNewVar,
                                createToast,
                                removeToast,
                                showToasts: false
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
                <aside>
                    <Options
                        {...{ setEquations, setVars, varMode, setVarMode }}
                    />
                </aside>
            </article>
        </main>
    );
};

export default MainContainer;

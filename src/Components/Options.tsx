import React from 'react';
import Toggle from './Toggle';
import type { Equation, VarMode, Vars } from '../types';

interface OptionsProps {
    setEquations: (equations: Equation[]) => void;
    setVars: (vars: Vars) => void;
    varMode: VarMode;
    setVarMode: (varMode: VarMode) => void;
}

const Options = (props: OptionsProps) => {
    const { setEquations, setVars, varMode } = props;
    return (
        <section className="flex flex-col gap-8 pb-8">
            <div className="flex flex-col">
                <h1 className="text-center text-3xl font-bold mt-4 mb-8">
                    Options
                </h1>
                <span className="buttonContainer">
                    <button
                        onClick={() => {
                            setEquations([]);
                        }}
                    >
                        Clear Equations
                    </button>
                    <button
                        onClick={() => {
                            setVars({ true: {}, false: {} });
                        }}
                    >
                        Clear Variables
                    </button>
                </span>
            </div>
            <Toggle
                value={varMode}
                setValue={props.setVarMode}
                name="Var Mode"
                optionNames={{ true: 'Static', false: 'Dynamic' }}
            />
        </section>
    );
};

export default Options;

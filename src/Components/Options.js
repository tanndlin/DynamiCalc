import React from 'react';
import Toggle from './Toggle';

const Options = (props) => {
    const { setEquations, setVars, varMode } = props;
    return (
        <aside className="flex flex-col gap-8 mb-8">
            <div className="flex flex-col">
                <h1 className="text-center text-xl font-bold mb-8">Options</h1>
                <span className="flex mx-auto gap-8">
                    <button
                        className="bg-tertiary rounded-md shadow-lg p-2"
                        onClick={() => {
                            setEquations([]);
                        }}
                    >
                        Clear Equations
                    </button>
                    <button
                        className="bg-tertiary rounded-md shadow-lg p-2"
                        onClick={() => {
                            setVars({});
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
        </aside>
    );
};

export default Options;

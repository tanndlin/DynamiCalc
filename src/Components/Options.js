import React from 'react';

const Options = (props) => {
    const { setEquations, setVars } = props;
    return (
        <aside className="flex flex-col">
            <h1 className="text-center text-xl font-bold mb-8">Options</h1>
            <span className="flex">
                <button
                    className="mx-auto bg-sky-900 rounded-md shadow-lg p-2"
                    onClick={() => {
                        setEquations([]);
                    }}
                >
                    Clear Equations
                </button>
                <button
                    className="mx-auto bg-sky-900 rounded-md shadow-lg p-2"
                    onClick={() => {
                        setVars({});
                    }}
                >
                    Clear Variables
                </button>
            </span>
        </aside>
    );
};

export default Options;

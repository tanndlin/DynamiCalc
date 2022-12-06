import React from 'react';

const VariableViewer = (props) => {
    return (
        <section className="px-4 border-2 border-black">
            <h1 className="text-center text-xl font-bold">Variables</h1>
            {Object.keys(props.vars).map((key) => {
                return (
                    <div key={key}>
                        <span className="font-bold">{key + ':'}</span>
                        <span className="ml-4">{props.vars[key]}</span>
                    </div>
                );
            })}
        </section>
    );
};

export default VariableViewer;

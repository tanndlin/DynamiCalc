import React from 'react';
import Variable from './Variable';

const VariableViewer = (props) => {
    const { vars, isStatic } = props;
    return (
        <section className="px-4 flex flex-col gap-4">
            <h1 className="text-center text-xl font-bold">Variables</h1>
            {Object.keys(props.vars)
                .sort()
                .map((key) => (
                    <Variable
                        key={key}
                        name={key}
                        value={vars[key]}
                        isStatic={isStatic}
                        evaluate={props.evaluate}
                        delete={() => props.delete(key)}
                    />
                ))}
        </section>
    );
};

export default VariableViewer;

import React from 'react';

const Variable = (props) => {
    const { name, value, isStatic } = props;

    return (
        <div
            key={name}
            className="variable relative bg-gray-800 rounded-md shadow-lg p-2"
        >
            <input
                className="close"
                type="button"
                value="&times;"
                onClick={props.delete}
            />
            <div className="padder"></div>
            <div className="flex">
                <span className="font-bold">{name}</span>
                <span className="ml-4">{value}</span>
                {!isStatic && (
                    <span className="ml-auto">{props.evaluate(value)}</span>
                )}
            </div>
        </div>
    );
};

export default Variable;

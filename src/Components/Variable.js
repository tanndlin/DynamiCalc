import React from 'react';

const Variable = (props) => {
    const { name, value, isStatic, evaluate } = props;

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
            <div className="padder" />
            <div className="flex">
                <span className="font-bold h-5">{name + '='}</span>
                <span className="ml-4">{value}</span>
                {!isStatic && (
                    <span className="ml-auto max-w-[50%] overflow-x-hidden">
                        {evaluate(value)}
                    </span>
                )}
            </div>
        </div>
    );
};

export default Variable;

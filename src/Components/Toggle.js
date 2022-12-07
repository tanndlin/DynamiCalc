import React from 'react';

const Toggle = (props) => {
    const { value, setValue, name, optionNames } = props;

    return (
        <div className="flex flex-col">
            <label className="text-center text-xl font-bold mb-2">{name}</label>
            {optionNames && (
                <h2 className="mx-auto mb-4">{optionNames[value]}</h2>
            )}
            <div
                className="mx-auto bg-gray-800 relative w-20 h-10 rounded-full"
                onClick={() => {
                    setValue(!value);
                }}
            >
                <span
                    className={`indicator indicator-${value} bg-sky-900 rounded-full`}
                ></span>
            </div>
        </div>
    );
};

export default Toggle;
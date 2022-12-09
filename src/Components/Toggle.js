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
                className="mx-auto bg-secondary relative w-20 h-10 rounded-full"
                onClick={() => {
                    setValue(!value);
                }}
            >
                <button
                    className={`indicator indicator-${value} bg-tertiary rounded-full`}
                ></button>
            </div>
        </div>
    );
};

export default Toggle;

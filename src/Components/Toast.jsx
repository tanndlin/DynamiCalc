import React from 'react';

const Toast = (props) => {
    const { title, equation, message, close } = props.toast;

    const getClassName = () => {
        const defaultClassName =
            'relative flex flex-col text-white bg-tertiary bg-opacity-[.9] rounded-md p-4 shadow-lg w-max z-50';

        return defaultClassName + (close ? ' toastClose' : '');
    };

    return (
        <div className={getClassName()}>
            <span className="flex flex-row justify-between w-full border-b-2 border-white">
                <h1 className="font-bold text-2xl">{title}</h1>
                <span className="loader" />
            </span>
            {equation && <p className="text-lg">{equation}</p>}{' '}
            <p className="m-auto text-lg">{message}</p>
        </div>
    );
};

export default Toast;

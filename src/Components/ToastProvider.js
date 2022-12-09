import React from 'react';
import Toast from './Toast';

const ToastProvider = (props) => {
    const { toasts } = props;

    return (
        <nav
            id="toastProvider"
            className="fixed top-0 left-[1rem] grid grid-flow-row gap-4 z-50"
        >
            {toasts.map((toast, index) => (
                <Toast key={index} toast={toast} />
            ))}
        </nav>
    );
};

export default ToastProvider;

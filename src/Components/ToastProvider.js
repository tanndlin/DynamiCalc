import React from 'react';
import Toast from './Toast';

const ToastProvider = (props) => {
    const { toasts } = props;

    return (
        <nav className="absolute top-[5rem] left-[1rem] grid grid-flow-row gap-4 notificationProvider">
            {toasts.map((toast, index) => (
                <Toast key={index} toast={toast} />
            ))}
        </nav>
    );
};

export default ToastProvider;

import React from 'react';
import HomePage from './Pages/HomePage';
import './App.scss';
import ToastProvider from './Components/ToastProvider';

function App() {
    const [toasts, setToasts] = React.useState([]);

    let id = 0;
    const createToast = (toast) => {
        const newToast = {
            ...toast,
            id: id++
        };

        setToasts([...toasts, newToast]);
        return newToast.id;
    };

    const removeToast = (id) => {
        setToasts((toasts) =>
            toasts.map((t) => {
                if (t.id === id) {
                    t.close = true;
                }

                return t;
            })
        );

        setTimeout(() => {
            setToasts((toasts) => toasts.filter((toast) => toast.id !== id));
        }, 1000);
    };

    return (
        <div className="relative">
            <ToastProvider toasts={toasts} />
            <HomePage
                {...{
                    createToast,
                    removeToast
                }}
            />
        </div>
    );
}

export default App;

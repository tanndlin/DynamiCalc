import React from 'react';
import HomePage from './Pages/HomePage';
import './App.scss';
import ToastProvider from './Components/ToastProvider';
import Header from './Components/Header';
import { BrowserRouter, Routes, Route } from 'react-router';
import GraphPage from './Pages/GraphPage';
import type { Toast, ToastData } from './types';

function App() {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const nextToastId = React.useRef(0);
    const createToast = (toast: ToastData) => {
        const id = nextToastId.current++;
        setToasts((toasts) => [...toasts, { ...toast, id }]);
        return id;
    };

    const removeToast = (id: number) => {
        setToasts((toasts) =>
            toasts.map((t) => (t.id === id ? { ...t, close: true } : t))
        );

        setTimeout(() => {
            setToasts((toasts) => toasts.filter((toast) => toast.id !== id));
        }, 1000);
    };

    window.onscroll = () => {
        const currentTop = window.pageYOffset;
        const header = document.getElementById('header');
        const toastProvider = document.getElementById('toastProvider');
        if (!header || !toastProvider) {
            return;
        }

        const top = Math.max(0, header.offsetHeight - currentTop) + 10;
        toastProvider.style.top = `${top}px`;
    };

    return (
        <BrowserRouter>
            <Header />
            <ToastProvider toasts={toasts} />
            <Routes>
                <Route
                    path="/"
                    element={
                        <HomePage
                            {...{
                                createToast,
                                removeToast
                            }}
                        />
                    }
                />

                <Route path="/graph" element={<GraphPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

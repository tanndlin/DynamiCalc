import React from 'react';
import HomePage from './Pages/HomePage';
import './App.scss';
import ToastProvider from './Components/ToastProvider';
import Header from './Components/Header';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GraphPage from './Pages/GraphPage';

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

    window.onscroll = () => {
        const currentTop = window.pageYOffset;
        const headerHeight = document.getElementById('header').offsetHeight;

        const toastProvider = document.getElementById('toastProvider');
        const top = Math.max(0, headerHeight - currentTop) + 10;
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

                <Route
                    path="/graph"
                    element={
                        <GraphPage
                            {...{
                                createToast,
                                removeToast
                            }}
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

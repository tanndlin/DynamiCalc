import React from 'react';
import MainContainer from '../Components/MainContainer';
import type { ToastProps } from '../types';

const HomePage = ({ createToast, removeToast }: ToastProps) => {
    return (
        <MainContainer
            {...{
                createToast,
                removeToast
            }}
        />
    );
};

export default HomePage;

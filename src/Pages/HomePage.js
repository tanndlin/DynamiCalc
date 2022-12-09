import React from 'react';
import Header from '../Components/Header';
import MainContainer from '../Components/MainContainer';

const HomePage = (props) => {
    const { createToast, removeToast } = props;

    return (
        <>
            <Header />
            <MainContainer
                {...{
                    createToast,
                    removeToast
                }}
            />
        </>
    );
};

export default HomePage;

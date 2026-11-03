import React from 'react';
import MainContainer from '../Components/MainContainer';

const HomePage = (props) => {
    const { createToast, removeToast } = props;

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

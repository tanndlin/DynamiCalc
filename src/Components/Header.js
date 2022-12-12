import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header
            id="header"
            className="grid grid-cols-3 bg-tertiary text-white h-16 place-items-center"
        >
            <p></p>
            <h1 className="text-center text-4xl font-bold m-auto">
                DynamiCalc
            </h1>
            <ul className="flex gap-8 text-xl font-bold">
                <li>
                    <Link className="hover:text-slate-300" to="/">
                        Home
                    </Link>
                </li>
                <li>
                    <Link className="hover:text-slate-300" to="/graph">
                        Graphing
                    </Link>
                </li>
            </ul>
        </header>
    );
};

export default Header;

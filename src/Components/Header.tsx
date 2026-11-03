import { NavLink } from 'react-router';

const Header = () => {
    return (
        <header className="site-header">
            <NavLink to="/" className="wordmark" aria-label="DynamiCalc home">
                Dynami<span>Calc</span>
            </NavLink>
            <nav aria-label="Main">
                <NavLink to="/" end>
                    Notebook
                </NavLink>
                <NavLink to="/graph">Graph</NavLink>
            </nav>
        </header>
    );
};

export default Header;

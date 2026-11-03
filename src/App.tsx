import './styles/graph.css';
import './styles/notebook.css';
import Header from './Components/Header';
import { BrowserRouter, Routes, Route } from 'react-router';
import NotebookPage from './Pages/NotebookPage';
import GraphPage from './Pages/GraphPage';

function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <Header />
                <Routes>
                    <Route path="/" element={<NotebookPage />} />
                    <Route path="/graph" element={<GraphPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;

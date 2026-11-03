import React from 'react';
import FunctionViewer from '../Components/FunctionViewer';
import Graph from '../Components/Graph';
import type { GraphFunction } from '../types';
import { loadJSON } from '../utils/storage';

const GraphPage = () => {
    const [width, setWidth] = React.useState(900);
    const [height, setHeight] = React.useState(500);
    const [functions, setFunctions] = React.useState<GraphFunction[]>(() =>
        loadJSON<GraphFunction[]>('functions', [])
    );

    React.useEffect(() => {
        setWidth(window.innerWidth * 0.8);
        setHeight(window.innerHeight - 64);
    }, []);

    React.useEffect(() => {
        localStorage.setItem('functions', JSON.stringify(functions));
    }, [functions]);

    window.onresize = () => {
        const container = document.getElementById('graphContainer');
        if (!container) {
            return;
        }

        const { width, height } = container.getBoundingClientRect();
        setWidth(width);
        setHeight(height);
    };

    return (
        <main
            id="graphPageContainer"
            className="bg-primary w-full min-h-minus-header flex"
        >
            <FunctionViewer functions={functions} setFunctions={setFunctions} />
            <div className="ml-auto w-8/10 h-full" id="graphContainer">
                <Graph {...{ functions, width, height }} />
            </div>
        </main>
    );
};

export default GraphPage;

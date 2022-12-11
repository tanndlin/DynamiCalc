import React from 'react';
import Graph from '../Components/Graph';

const GraphPage = () => {
    const [width, setWidth] = React.useState(900);
    const [height, setHeight] = React.useState(500);
    const [functions, _setFunctions] = React.useState([
        { f: (x) => Math.sin(x) * x, color: 'black' },
        { f: (x) => Math.cos(x) * x, color: 'red' }
    ]);

    React.useEffect(() => {
        const container = document.getElementById('graphContainer');

        const { width, height } = container.getBoundingClientRect();
        setWidth(width);
        setHeight(height);
    }, []);

    window.onresize = () => {
        const container = document.getElementById('graphContainer');

        const { width, height } = container.getBoundingClientRect();
        setWidth(width);
        setHeight(height);
    };

    return (
        <main className="bg-primary w-full h-minus-header">
            <div className="ml-auto w-8/10 h-full" id="graphContainer">
                <Graph {...{ functions, width, height }} />
            </div>
        </main>
    );
};

export default GraphPage;

import React from 'react';
import FunctionEditor from '../Components/FunctionEditor';
import Graph from '../Components/Graph';

const GraphPage = () => {
    const [width, setWidth] = React.useState(900);
    const [height, setHeight] = React.useState(500);
    const [functions, setFunctions] = React.useState([
        { f: 'sin(x) * x', color: 'black' },
        { f: 'cos(x) * x', color: 'red' }
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
        <main
            id="graphPageContainer"
            className="bg-primary w-full min-h-minus-header flex"
        >
            <FunctionEditor functions={functions} setFunctions={setFunctions} />
            <div className="ml-auto w-8/10 h-full" id="graphContainer">
                <Graph {...{ functions, setFunctions, width, height }} />
            </div>
        </main>
    );
};

export default GraphPage;

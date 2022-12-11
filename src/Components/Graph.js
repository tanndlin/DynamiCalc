import React from 'react';

const Graph = (props) => {
    const { functions, width, height } = props;

    const canvasRef = React.useRef(null);
    React.useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        const xScale = 100;
        const yScale = 100;

        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();

        functions.forEach((fn) => {
            const { f, color } = fn;
            ctx.strokeStyle = color;

            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            for (let x = 0; x < width; x++) {
                const i = x - width / 2;
                const y = f(i / xScale) * yScale;
                ctx.lineTo(x, height / 2 - y);
            }
            ctx.stroke();
        });
    }, [width, height, functions]);

    return <canvas width={width} height={height} ref={canvasRef} />;
};

export default Graph;

import React from 'react';
import Math from 'math-expression-evaluator';

const Graph = (props) => {
    const { functions, width, height } = props;

    const evaluate = (f, x) => {
        // Convert to radians
        const radians = f.replace(/(sin|cos|tan)\((.+)\)/g, '$1(180/3.14*$2)');
        const withVars = radians.replace(/x/g, `(${x})`);

        return Math.eval(withVars);
    };

    const drawAxes = (ctx, xScale, yScale) => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();

        // Draw ticks
        ctx.beginPath();
        for (let i = 0; i < width; i += xScale) {
            ctx.moveTo(i, height / 2 - 5);
            ctx.lineTo(i, height / 2 + 5);
        }
        for (let i = 0; i < height; i += yScale) {
            ctx.moveTo(width / 2 - 5, i);
            ctx.lineTo(width / 2 + 5, i);
        }
        ctx.stroke();

        // Draw labels
        ctx.fillStyle = 'black';
        ctx.font = '15px Arial';

        // Draw 0
        ctx.fillText('0', width / 2 + 5, height / 2 + 20);

        // Right
        for (let i = width / 2 + xScale; i < width; i += xScale) {
            ctx.fillText((i - width / 2) / xScale, i + 16, height / 2 + 20);
        }

        // Left
        for (let i = width / 2 - xScale; i > 0; i -= xScale) {
            ctx.fillText((i - width / 2) / xScale, i + 12, height / 2 + 20);
        }

        // Down
        for (let i = height / 2 + yScale; i < height; i += yScale) {
            ctx.fillText((height / 2 - i) / yScale, width / 2 - 20, i + 3);
        }

        // Up
        for (let i = height / 2 - yScale; i > 0; i -= yScale) {
            ctx.fillText((height / 2 - i) / yScale, width / 2 - 20, i + 3);
        }

        ctx.stroke();
    };

    const canvasRef = React.useRef(null);
    React.useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const xScale = 100;
        const yScale = 100;
        drawAxes(ctx, xScale, yScale);

        functions.forEach((fn) => {
            try {
                const { f, color } = fn;
                ctx.strokeStyle = color;

                ctx.beginPath();
                ctx.moveTo(0, evaluate(f, 0) * yScale);
                for (let i = 0; i < width; i++) {
                    const x = (i - width / 2) / xScale;
                    const y = evaluate(f, x) * yScale;

                    if (isNaN(y)) {
                        ctx.stroke();
                        ctx.beginPath();
                    }

                    ctx.lineTo(i, height / 2 - y);
                }
                ctx.stroke();
            } catch (error) {
                console.log(error);
            }
        });
    }, [width, height, functions]);

    return <canvas width={width} height={height} ref={canvasRef} />;
};

export default Graph;

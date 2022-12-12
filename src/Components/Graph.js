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

    const canvasRef = React.useRef(null);
    React.useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        const xScale = 100;
        const yScale = 100;

        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();

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

import { useEffect, useRef, useState } from 'react';
import { drawPlot, readTheme, type PlotSeries } from './plot';

interface GraphCanvasProps {
    series: PlotSeries[];
    label: string;
}

const GraphCanvas = ({ series, label }: GraphCanvasProps) => {
    const host = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [themeVersion, setThemeVersion] = useState(0);

    useEffect(() => {
        const el = host.current!;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ width: Math.floor(width), height: Math.floor(height) });
        });
        observer.observe(el);

        const scheme = window.matchMedia('(prefers-color-scheme: dark)');
        const onScheme = () => setThemeVersion((v) => v + 1);
        scheme.addEventListener('change', onScheme);

        return () => {
            observer.disconnect();
            scheme.removeEventListener('change', onScheme);
        };
    }, []);

    useEffect(() => {
        if (canvas.current && size.width > 0 && size.height > 0) {
            drawPlot(
                canvas.current,
                size.width,
                size.height,
                series,
                readTheme(canvas.current)
            );
        }
    }, [series, size, themeVersion]);

    return (
        <div ref={host} className="graph-canvas">
            <canvas ref={canvas} role="img" aria-label={label} />
        </div>
    );
};

export default GraphCanvas;

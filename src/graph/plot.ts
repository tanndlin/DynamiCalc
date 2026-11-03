import type { EvalFunction } from 'mathjs';

export interface PlotTheme {
    background: string;
    grid: string;
    axis: string;
    label: string;
    font: string;
}

export interface PlotSeries {
    code: EvalFunction;
    /** A CSS custom property holding the line color, e.g. --plot-1 */
    color: string;
}

/** Pixels per unit on both axes. */
export const SCALE = 60;

const readVar = (el: Element, name: string) =>
    getComputedStyle(el).getPropertyValue(name).trim();

export const readTheme = (el: Element): PlotTheme => ({
    background: readVar(el, '--sheet'),
    grid: readVar(el, '--rule'),
    axis: readVar(el, '--ink-faint'),
    label: readVar(el, '--ink-soft'),
    font: `11px ${readVar(el, '--font-math')}`
});

const sample = (series: PlotSeries, x: number): number => {
    try {
        const y = series.code.evaluate({ x });
        return typeof y === 'number' ? y : NaN;
    } catch {
        return NaN;
    }
};

/** Draws axes, grid and every series centred on the origin. */
export const drawPlot = (
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    series: PlotSeries[],
    theme: PlotTheme
) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = Math.round(width / 2) + 0.5;
    const cy = Math.round(height / 2) + 0.5;
    const toScreenY = (y: number) => cy - y * SCALE;

    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = cx % SCALE; x < width; x += SCALE) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    for (let y = cy % SCALE; y < height; y += SCALE) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Axes
    ctx.strokeStyle = theme.axis;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Labels
    ctx.fillStyle = theme.label;
    ctx.font = theme.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = cx % SCALE; x < width; x += SCALE) {
        const value = Math.round((x - cx) / SCALE);
        if (value !== 0) {
            ctx.fillText(`${value}`, x, cy + 6);
        }
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = cy % SCALE; y < height; y += SCALE) {
        const value = Math.round((cy - y) / SCALE);
        if (value !== 0) {
            ctx.fillText(`${value}`, cx - 6, y);
        }
    }

    // Series
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    for (const s of series) {
        ctx.strokeStyle = readVar(canvas, s.color);
        ctx.beginPath();
        let drawing = false;
        let lastY = NaN;
        for (let px = 0; px <= width; px++) {
            const y = sample(s, (px - cx) / SCALE);
            const sy = toScreenY(y);
            // Break the line at gaps and near-vertical jumps (e.g. tan)
            const jump = Math.abs(sy - lastY) > height;
            if (!Number.isFinite(sy) || jump) {
                drawing = false;
            } else if (!drawing) {
                ctx.moveTo(px, sy);
                drawing = true;
            } else {
                ctx.lineTo(px, sy);
            }
            lastY = sy;
        }
        ctx.stroke();
    }
};

import { useEffect, useMemo, useState } from 'react';
import GraphCanvas from '../graph/GraphCanvas';
import {
    PALETTE_SIZE,
    compileFunction,
    loadFunctions,
    paletteColor,
    saveFunctions
} from '../graph/functions';
import type { PlotSeries } from '../graph/plot';
import type { GraphFunction } from '../types';

const nextColor = (color: string) =>
    paletteColor(Number(color.replace('plot-', '')) % PALETTE_SIZE);

const GraphPage = () => {
    const [functions, setFunctions] = useState<GraphFunction[]>(loadFunctions);

    useEffect(() => saveFunctions(functions), [functions]);

    const compiled = useMemo(
        () => functions.map((fn) => compileFunction(fn.f)),
        [functions]
    );

    const series = useMemo(
        () =>
            functions.flatMap((fn, i): PlotSeries[] => {
                const c = compiled[i];
                return c?.ok ? [{ code: c.code, color: `--${fn.color}` }] : [];
            }),
        [functions, compiled]
    );

    const update = (index: number, changes: Partial<GraphFunction>) =>
        setFunctions((fns) =>
            fns.map((fn, i) => (i === index ? { ...fn, ...changes } : fn))
        );

    const remove = (index: number) =>
        setFunctions((fns) => fns.filter((_, i) => i !== index));

    const add = () =>
        setFunctions((fns) => [
            ...fns,
            { f: '', color: paletteColor(fns.length) }
        ]);

    const plotted = functions.filter((_, i) => compiled[i]?.ok);

    return (
        <main className="graph-page">
            <aside className="graph-panel" aria-label="Functions">
                <ul className="fn-list">
                    {functions.map((fn, i) => {
                        const c = compiled[i];
                        const id = `fn-${i}`;
                        return (
                            <li key={i} className="fn-row">
                                <button
                                    type="button"
                                    className="fn-swatch"
                                    style={{ background: `var(--${fn.color})` }}
                                    aria-label={`Change color of function ${i + 1}`}
                                    onClick={() =>
                                        update(i, {
                                            color: nextColor(fn.color)
                                        })
                                    }
                                />
                                <label htmlFor={id} className="fn-prefix">
                                    y =
                                </label>
                                <input
                                    id={id}
                                    className="fn-input"
                                    value={fn.f}
                                    placeholder="x^2 - 1"
                                    spellCheck={false}
                                    autoCapitalize="off"
                                    autoComplete="off"
                                    aria-invalid={c?.ok === false}
                                    aria-describedby={
                                        c?.ok === false
                                            ? `${id}-error`
                                            : undefined
                                    }
                                    onChange={(e) =>
                                        update(i, { f: e.target.value })
                                    }
                                />
                                <button
                                    type="button"
                                    className="fn-remove"
                                    aria-label={`Remove function ${i + 1}`}
                                    onClick={() => remove(i)}
                                >
                                    ×
                                </button>
                                {c?.ok === false && (
                                    <p id={`${id}-error`} className="fn-error">
                                        {c.error}
                                    </p>
                                )}
                            </li>
                        );
                    })}
                </ul>
                <button type="button" className="fn-add" onClick={add}>
                    Add function
                </button>
            </aside>
            <GraphCanvas
                series={series}
                label={
                    plotted.length > 0
                        ? `Graph of ${plotted.map((fn) => `y = ${fn.f}`).join(', ')}`
                        : 'Empty graph'
                }
            />
        </main>
    );
};

export default GraphPage;

import type { EvalFunction } from 'mathjs';
import { describeError, math } from '../engine/notebook';
import { loadJSON } from '../utils/storage';
import type { GraphFunction } from '../types';

export const PALETTE_SIZE = 6;
const KEY = 'functions';

export const paletteColor = (index: number) =>
    `plot-${(index % PALETTE_SIZE) + 1}`;

/** Loads saved functions, moving old named colors onto the palette. */
export const loadFunctions = (): GraphFunction[] =>
    loadJSON<GraphFunction[]>(KEY, [
        { f: 'sin(x)', color: paletteColor(0) }
    ]).map((fn, i) =>
        fn.color.startsWith('plot-') ? fn : { ...fn, color: paletteColor(i) }
    );

export const saveFunctions = (functions: GraphFunction[]) => {
    localStorage.setItem(KEY, JSON.stringify(functions));
};

export type Compiled =
    { ok: true; code: EvalFunction } | { ok: false; error: string } | null;

/** Compiles `f` and checks it can be evaluated for some x. */
export const compileFunction = (f: string): Compiled => {
    if (f.trim() === '') {
        return null;
    }

    try {
        const code = math.compile(f);
        const y = code.evaluate({ x: 0.5 });
        if (typeof y !== 'number') {
            return { ok: false, error: 'This doesn’t give a number for x' };
        }
        return { ok: true, code };
    } catch (error) {
        return { ok: false, error: describeError(error) };
    }
};

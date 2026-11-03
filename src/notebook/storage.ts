import { loadJSON } from '../utils/storage';

const KEY = 'notebook';

export const STARTER_NOTEBOOK = [
    '# Change the price and watch the total follow',
    'price = 120',
    'tax = 8%',
    'total = price * (1 + tax)',
    '',
    '# := keeps the value from the line it is written on',
    'quoted := total',
    'price = 150',
    'total',
    'quoted',
    '',
    '# Units convert too',
    '5 ft to m'
].join('\n');

interface LegacyVariable {
    value: string | number;
}

interface LegacyVars {
    true?: Record<string, LegacyVariable>;
    false?: Record<string, LegacyVariable>;
}

/** Turns variables saved by the old calculator into notebook lines. */
export const migrateLegacyVars = (vars: LegacyVars): string | null => {
    const lines = [
        ...Object.entries(vars.false ?? {}).map(
            ([name, v]) => `${name} = ${v.value}`
        ),
        ...Object.entries(vars.true ?? {}).map(
            ([name, v]) => `${name} := ${v.value}`
        )
    ];
    return lines.length > 0 ? lines.join('\n') : null;
};

export const loadNotebook = (): string => {
    const saved = localStorage.getItem(KEY);
    if (saved !== null) {
        return saved;
    }

    const legacy = migrateLegacyVars(loadJSON<LegacyVars>('vars', {}));
    return legacy ?? STARTER_NOTEBOOK;
};

export const saveNotebook = (text: string) => {
    localStorage.setItem(KEY, text);
};

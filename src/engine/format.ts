import { format } from 'mathjs';

const groupThousands = (text: string): string =>
    text.replace(/^(-?)(\d+)/, (_, sign: string, digits: string) =>
        digits.length > 4
            ? sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            : sign + digits
    );

/** Formats an evaluated value for the results column. */
export const formatValue = (value: unknown): string | undefined => {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value === 'function') {
        return undefined;
    }
    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            return Number.isNaN(value)
                ? 'not a number'
                : value > 0
                  ? '∞'
                  : '−∞';
        }
        const text = format(value, {
            precision: 10,
            lowerExp: -7,
            upperExp: 15
        });
        return text.includes('e') ? text : groupThousands(text);
    }
    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }

    return format(value, { precision: 10 });
};

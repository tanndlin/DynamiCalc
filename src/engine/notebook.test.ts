import { evaluateNotebook } from './notebook';

const run = (text: string) => evaluateNotebook(text.split('\n'));
const displays = (text: string) => run(text).map((r) => r.display ?? null);

describe('evaluateNotebook', () => {
    it('evaluates arithmetic per line', () => {
        expect(displays('2 + 2\n10 / 4\n2 ^ 10')).toEqual(['4', '2.5', '1024']);
    });

    it('skips blank and comment lines', () => {
        const results = run('# Budget\n\n1 + 1');
        expect(results.map((r) => r.kind)).toEqual([
            'comment',
            'blank',
            'expression'
        ]);
        expect(results[2].display).toBe('2');
    });

    it('re-evaluates dynamic variables where they are used', () => {
        expect(displays('a = 10\nb = a + 10\na = 0\nb')).toEqual([
            '10',
            '20',
            '0',
            '10'
        ]);
    });

    it('keeps snapshot variables at the value they had when written', () => {
        expect(displays('a = 10\nb := a + 10\na = 0\nb')).toEqual([
            '10',
            '20',
            '0',
            '20'
        ]);
    });

    it('lets a snapshot build on the previous value of its own name', () => {
        expect(displays('n = 1\nn := n + 1\nn := n * 10\nn')).toEqual([
            '1',
            '2',
            '20',
            '20'
        ]);
    });

    it('reports a dynamic variable that refers to itself', () => {
        const [, second] = run('n = 1\nn = n + 1');
        expect(second.error).toBe('n can’t use itself. Try := instead');
    });

    it('reports only the variables in a loop', () => {
        const results = run('n = 1\nn = n + 1\nm = n * 2');
        expect(results[2].error).toBe('n can’t use itself. Try := instead');
    });

    it('reports loops between dynamic variables', () => {
        const results = run('a = b + 1\nb = a + 1');
        expect(results[1].error).toBe('Loop: b → a → b');
    });

    it('reports undefined variables by name', () => {
        expect(run('price * 2')[0].error).toBe("price isn't defined");
    });

    it('replaces ans with the previous result', () => {
        expect(displays('1 + 2\nans * ans\n\nans - 1')).toEqual([
            '3',
            '9',
            null,
            '8'
        ]);
    });

    it('supports user functions', () => {
        expect(displays('rate = 2\nf(x) = x * rate\nf(5)')).toEqual([
            '2',
            null,
            '10'
        ]);
    });

    it('converts units', () => {
        expect(displays('5 ft to m')).toEqual(['1.524 m']);
    });

    it('rejects several statements on one line', () => {
        expect(run('a = 1; b = 2')[0].error).toMatch(/one calculation/);
    });

    it('groups thousands', () => {
        expect(displays('1234567.5\n1000\n-25000')).toEqual([
            '1,234,567.5',
            '1000',
            '-25,000'
        ]);
    });

    describe('dependencies', () => {
        const notebook = [
            'price = 120',
            'tax = 0.08',
            'total = price * (1 + tax)',
            'total * 2',
            '5 + 5'
        ].join('\n');

        it('tracks the lines a line reads directly', () => {
            const results = run(notebook);
            expect(results[2].directUses).toEqual([0, 1]);
            expect(results[3].directUses).toEqual([2]);
            expect(results[4].directUses).toEqual([]);
        });

        it('tracks every line a result depends on', () => {
            expect(run(notebook)[3].uses).toEqual([0, 1, 2]);
        });

        it('tracks which lines depend on a line', () => {
            const results = run(notebook);
            expect(results[0].usedBy).toEqual([2, 3]);
            expect(results[4].usedBy).toEqual([]);
        });

        it('links a use to the definition active at that point', () => {
            const results = run('a = 1\nb = a\na = 2\nb');
            expect(results[1].uses).toEqual([0]);
            expect(results[3].uses).toEqual([1, 2]);
        });

        it('carries a snapshot’s dependencies through to its users', () => {
            const results = run('a = 1\nb := a\nb + 1');
            expect(results[2].directUses).toEqual([1]);
            expect(results[2].uses).toEqual([0, 1]);
        });
    });
});

import { evaluate } from '../utils/Evaluate';

describe('evaluate', () => {
    it('should replace "ans" with previous answer', () => {
        const vars = { false: {}, true: {} };
        const varMode = false;
        const equations = [{ input: '2 + 2', output: 4 }];
        expect(evaluate({ input: 'ans * 3', equations, vars, varMode })).toBe(
            12
        );
    });

    it('should evaluate expressions with variables', () => {
        const equations = [];
        const vars = { false: { x: { value: 2 }, y: { value: 3 } }, true: {} };
        const varMode = false;
        expect(evaluate({ input: 'x + y', equations, vars, varMode })).toBe(5);
        expect(evaluate({ input: 'x * y', equations, vars, varMode })).toBe(6);
        expect(evaluate({ input: 'y / x', equations, vars, varMode })).toBe(
            1.5
        );
        expect(evaluate({ input: 'y - x', equations, vars, varMode })).toBe(1);
    });

    it('should evaluate basic arithmetic expressions', () => {
        const equations = [];
        const vars = { false: {}, true: {} };
        const varMode = false;
        expect(evaluate({ input: '2 + 2', equations, vars, varMode })).toBe(4);
        expect(evaluate({ input: '2 * 3', equations, vars, varMode })).toBe(6);
        expect(evaluate({ input: '10 / 5', equations, vars, varMode })).toBe(2);
        expect(evaluate({ input: '5 - 3', equations, vars, varMode })).toBe(2);
    });

    it('should return "ERROR" for invalid input', () => {
        const equations = [];
        const vars = {};
        const varMode = false;
        expect(evaluate({ input: '2 +', equations, vars, varMode })).toContain(
            'ERROR'
        );
    });
});

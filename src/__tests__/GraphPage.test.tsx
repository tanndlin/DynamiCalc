import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from '../App';

(
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;

const render = async () => {
    window.history.pushState({}, '', '/graph');
    document.body.innerHTML = '<div id="root"></div>';
    root = createRoot(document.getElementById('root')!);
    await act(async () => root.render(<App />));
};

const inputs = () =>
    [...document.querySelectorAll<HTMLInputElement>('.fn-input')].map(
        (el) => el.value
    );

const type = async (input: HTMLInputElement, value: string) => {
    const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
    )!.set!;
    await act(async () => {
        setter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
};

beforeAll(() => {
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            disconnect() {}
        }
    );
    vi.stubGlobal('matchMedia', () => ({
        matches: false,
        addEventListener() {},
        removeEventListener() {}
    }));
});

beforeEach(() => localStorage.clear());

afterEach(async () => {
    await act(async () => root.unmount());
});

describe('GraphPage', () => {
    it('starts with an example function', async () => {
        await render();
        expect(inputs()).toEqual(['sin(x)']);
    });

    it('explains functions that cannot be graphed', async () => {
        await render();
        const input = document.querySelector<HTMLInputElement>('.fn-input')!;

        await type(input, 'x * k');
        expect(document.querySelector('.fn-error')?.textContent).toBe(
            "k isn't defined"
        );
        expect(input.getAttribute('aria-invalid')).toBe('true');

        await type(input, 'x * 2');
        expect(document.querySelector('.fn-error')).toBeNull();
    });

    it('adds, saves and removes functions', async () => {
        await render();
        const add = [...document.querySelectorAll('button')].find(
            (b) => b.textContent === 'Add function'
        )!;
        await act(async () => add.click());
        await type(
            document.querySelectorAll<HTMLInputElement>('.fn-input')[1],
            'x^2'
        );

        expect(JSON.parse(localStorage.getItem('functions')!)).toEqual([
            { f: 'sin(x)', color: 'plot-1' },
            { f: 'x^2', color: 'plot-2' }
        ]);

        await act(async () =>
            document
                .querySelector<HTMLButtonElement>(
                    '[aria-label="Remove function 1"]'
                )!
                .click()
        );
        expect(inputs()).toEqual(['x^2']);
    });

    it('moves colors saved by the old graph onto the palette', async () => {
        localStorage.setItem(
            'functions',
            JSON.stringify([
                { f: 'x', color: 'red' },
                { f: 'x+1', color: '#00ff00' }
            ])
        );
        await render();
        const swatches = [
            ...document.querySelectorAll<HTMLElement>('.fn-swatch')
        ].map((el) => el.style.background);
        expect(swatches).toEqual(['var(--plot-1)', 'var(--plot-2)']);
    });
});

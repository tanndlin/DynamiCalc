import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from '../App';

(
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;

const render = async () => {
    document.body.innerHTML = '<div id="root"></div>';
    root = createRoot(document.getElementById('root')!);
    await act(async () => root.render(<App />));
};

const getButton = (text: string) =>
    [...document.querySelectorAll('button')].find(
        (b) => b.textContent === text
    );

beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
});

afterEach(async () => {
    await act(async () => root.unmount());
});

describe('Toasts', () => {
    const enterEquation = async (value: string) => {
        const input = document.getElementById(
            'equationInputter'
        ) as HTMLInputElement;
        input.value = value;
        await act(async () =>
            input.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
            )
        );
    };

    const toastCount = () =>
        document.getElementById('toastProvider')!.children.length;

    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('removes each error toast independently', async () => {
        await render();

        await enterEquation('2+');
        await act(async () => vi.advanceTimersByTime(3000));
        await enterEquation('3+');
        expect(toastCount()).toBe(2);

        // First toast's 5s timer + 1s close animation have elapsed
        await act(async () => vi.advanceTimersByTime(3500));
        expect(toastCount()).toBe(1);

        await act(async () => vi.advanceTimersByTime(3000));
        expect(toastCount()).toBe(0);
    });
});

describe('Clear Variables', () => {
    it('clears variables without crashing', async () => {
        localStorage.setItem(
            'vars',
            JSON.stringify({
                true: { B: { value: 1, description: '' } },
                false: { A: { value: '5', description: '' } }
            })
        );
        await render();
        expect(document.body.textContent).toContain('A=');

        await act(async () => getButton('Clear Variables')!.click());

        expect(document.body.textContent).toContain('Variables');
        expect(document.body.textContent).not.toContain('A=');
        expect(JSON.parse(localStorage.getItem('vars')!)).toEqual({
            true: {},
            false: {}
        });
    });

    it('recovers from previously saved empty variables', async () => {
        localStorage.setItem('vars', JSON.stringify({}));
        await render();
        expect(document.body.textContent).toContain('Variables');
    });
});

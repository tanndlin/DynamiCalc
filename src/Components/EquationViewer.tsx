import React from 'react';
import Equation from './Equation';
import { evaluate as ev } from '../utils/Evaluate';
import type { CreateNewVar } from '../utils/Evaluate';
import type {
    Equation as EquationData,
    ToastProps,
    VarMode,
    Vars
} from '../types';

interface EquationViewerProps extends ToastProps {
    equations: EquationData[];
    setEquationInputter: (value: string) => void;
    deleteEquation: (index: number) => void;
    vars: Vars;
    varMode: VarMode;
    setEquations: (equations: EquationData[]) => void;
    createNewVar: CreateNewVar;
}

const EquationViewer = (props: EquationViewerProps) => {
    const {
        equations,
        setEquationInputter,
        vars,
        varMode,
        setEquations,
        createNewVar,
        createToast,
        removeToast
    } = props;

    const evaluate = (input: string) => {
        return ev({
            input,
            equations,
            vars,
            varMode,
            createNewVar,
            createToast,
            removeToast,
            showToasts: true
        });
    };

    let index = -1;
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const target = e.currentTarget;
        if (e.key === 'Enter') {
            // If the input is empty, run last equation
            if (target.value.length === 0) {
                target.value = equations[equations.length - 1].input;
            }

            const input = target.value;
            const output = evaluate(input);
            setEquations([...equations, { input, output }]);
            target.value = '';

            // Scroll to bottom of previousArea
            setTimeout(() => {
                const previousArea = document.getElementById('previousArea')!;
                previousArea.scrollTop = previousArea.scrollHeight;
            }, 100);
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (index === -1) {
                index = equations.length - 1;
                target.value = equations[index].input;
            } else if (index > 0) {
                index--;
                target.value = equations[index].input;
            } else {
                index = -1;
                target.value = '';
            }
            // Put cursor at the end of the input
            target.selectionStart = target.value.length;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (index === -1) {
                index = 0;
                target.value = equations[index].input;
            } else if (index < equations.length - 1) {
                index++;
                target.value = equations[index].input;
            } else {
                index = -1;
                target.value = '';
            }
            // Put cursor at the end of the input
            target.selectionStart = target.value.length;
        }

        if (['-', '+', '*', '/'].includes(e.key) && target.value.length === 0) {
            e.preventDefault();
            // Put answer in front of operator
            target.value = `ans${e.key}`;
        }
    };

    const makeStatic = () => {
        const inputField = document.getElementById(
            'equationInputter'
        ) as HTMLInputElement;
        if (!inputField.value.includes('=')) {
            inputField.value = `${evaluate(inputField.value)}`;
            return;
        }

        const [currentVar, toReplace] = inputField.value.split('=');

        const replaced = evaluate(toReplace);

        inputField.value = `${currentVar}=${replaced}`;
    };

    React.useEffect(() => {
        // Scroll to bottom of previousArea
        const previousArea = document.getElementById('previousArea')!;
        previousArea.scrollTop = previousArea.scrollHeight;
    }, []);

    return (
        <section id="equations" className="h-minus-header">
            <h1 className="text-center text-3xl font-bold mb-2">Equations</h1>
            <div
                id="previousArea"
                className="bg-secondary mx-auto container h-[calc(85vh-4rem)] flex flex-col gap-4 px-4 py-4 overflow-auto"
            >
                {equations.map((equation, i) => (
                    <Equation
                        key={i}
                        {...{
                            equation,
                            setEquationInputter,
                            delete: () => {
                                props.deleteEquation(i);
                            },
                            copy: (e) => {
                                if (
                                    (e.target as HTMLElement).className !==
                                    'close'
                                ) {
                                    props.setEquationInputter(equation.input);
                                }
                            }
                        }}
                    />
                ))}
            </div>
            <footer id="inputArea" className="flex">
                <span className="container mx-auto mt-8 gap-4 flex">
                    <input
                        id="equationInputter"
                        className="text-black px-2 py-1 rounded-md w-4/5"
                        type="text"
                        placeholder="Enter an equation or set a varible. ie: 2+2 or A=100/5"
                        onKeyDown={(e) => {
                            handleKeyDown(e);
                        }}
                    />
                    <button className="w-1/5" onClick={makeStatic}>
                        Make Static
                    </button>
                </span>
            </footer>
        </section>
    );
};

export default EquationViewer;

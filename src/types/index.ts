export interface Variable {
    value: string | number;
    description?: string;
}

export type VariableScope = Record<string, Variable>;

/** Variables are stored per mode: `true` = static, `false` = dynamic. */
export interface Vars {
    true: VariableScope;
    false: VariableScope;
}

export type VarMode = boolean;

export interface Equation {
    input: string;
    output: string | number;
}

export interface ToastData {
    title: string;
    equation?: string;
    message: string;
}

export interface Toast extends ToastData {
    id: number;
    close?: boolean;
}

export type CreateToast = (toast: ToastData) => number;
export type RemoveToast = (id: number) => void;

export interface GraphFunction {
    f: string;
    color: string;
}

export interface ToastProps {
    createToast: CreateToast;
    removeToast: RemoveToast;
}

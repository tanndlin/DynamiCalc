import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const unusedVarsOptions = {
    caughtErrors: 'none',
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_'
};

export default defineConfig(
    { ignores: ['build/', 'node_modules/'] },
    js.configs.recommended,
    react.configs.flat.recommended,
    react.configs.flat['jsx-runtime'],
    prettierRecommended,
    {
        files: ['**/*.{js,jsx,cjs,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: { ecmaFeatures: { jsx: true } },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.vitest
            }
        },
        settings: { react: { version: 'detect' } },
        rules: {
            eqeqeq: ['error', 'smart'],
            'eol-last': ['error'],
            curly: 'warn',
            'no-var': 'error',
            'prefer-const': 'error',
            semi: 'error',
            'space-before-blocks': 'error',
            'spaced-comment': 'warn',
            'prettier/prettier': [
                'error',
                { singleQuote: true, endOfLine: 'auto' }
            ],
            quotes: ['error', 'single', { avoidEscape: true }],
            'no-unused-vars': ['error', unusedVarsOptions],
            'react/prop-types': 'off',
            'react/jsx-key': 'off'
        }
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [tseslint.configs.recommended],
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error', unusedVarsOptions]
        }
    },
    {
        files: ['**/*.cjs'],
        languageOptions: { sourceType: 'commonjs' }
    }
);

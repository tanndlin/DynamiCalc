import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
    { ignores: ['build/', 'node_modules/'] },
    js.configs.recommended,
    react.configs.flat.recommended,
    prettierRecommended,
    {
        files: ['**/*.{js,jsx,cjs}'],
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
            'no-unused-vars': [
                'error',
                {
                    caughtErrors: 'none',
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }
            ],
            'react/prop-types': 'off',
            'react/jsx-key': 'off'
        }
    },
    {
        files: ['**/*.cjs'],
        languageOptions: { sourceType: 'commonjs' }
    }
];

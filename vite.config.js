import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // convert-units expects Node's `global`, which CRA used to polyfill
    define: { global: 'globalThis' },
    build: {
        // Firebase hosting serves from build/
        outDir: 'build'
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/setupTests.js'
    }
});

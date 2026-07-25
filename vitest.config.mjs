import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/**/*.test.{js,mjs}'],
        coverage: {
            provider: 'v8',
            include: ['www/assets/app-logic.js'],
            reporter: ['text', 'html', 'json-summary'],
            thresholds: {
                perFile: true,
                lines: 100,
                functions: 100,
                statements: 100,
                branches: 100
            }
        }
    }
});

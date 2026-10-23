import { defineConfig } from '@playwright/test';

// UI smoke tests: drive a real VS Code window with the packaged VSIX installed.
// Each test launches its own VS Code with a private profile, so they run one at a time.
export default defineConfig({
    testDir: '.',
    globalSetup: require.resolve('./globalSetup'),
    timeout: 120000,
    expect: { timeout: 30000 },
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    reporter: [['list'], ['html', { open: 'never', outputFolder: '../playwright-report' }]],
    outputDir: '../test-results'
});

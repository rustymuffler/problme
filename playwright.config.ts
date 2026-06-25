import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for accessibility testing against the
 * built static site served via `astro preview` on port 4321.
 *
 * Run:  npx astro build && npm run test:a11y
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  workers: 1,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:4321',
    headless: true,
    // Capture trace on first retry so failures are diagnosable in CI
    trace: 'retain-on-failure',
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start `astro preview` before the test run and stop it after.
  // The built dist/ must already exist before running tests.
  webServer: {
    command: 'npx astro preview --port 4321',
    port: 4321,
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
});

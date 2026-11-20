import { defineConfig, devices } from '@playwright/test';

// Playwright combines a config-level grepInvert with the --grep flag, so a plain
// `--grep @isolated` would match nothing. The flag is read here to lift the exclusion.
const runsIsolatedTests = process.argv.some((argument) => argument.includes('@isolated'));

export default defineConfig({
  testDir: 'tests/e2e',
  grepInvert: runsIsolatedTests ? undefined : /@isolated/,
  workers: 1,
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});

import { defineConfig, devices } from '@playwright/test';

// Playwright combines a config-level grepInvert with the --grep flag, so a plain
// `--grep @isolated` would match nothing. The flag is read here to lift the exclusion.
const runsIsolatedTests = process.argv.some((argument) => argument.includes('@isolated'));

// Starts the API server before the frontend when E2E_API_COMMAND is set.
const apiCommand = process.env.E2E_API_COMMAND;
const apiUrl = process.env.E2E_API_URL;
if (apiCommand && !apiUrl) {
  throw new Error('E2E_API_URL is required when E2E_API_COMMAND is set.');
}
const apiServers = apiCommand && apiUrl ? [{ command: apiCommand, url: apiUrl, reuseExistingServer: true }] : [];

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
  webServer: [
    ...apiServers,
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
    },
  ],
});

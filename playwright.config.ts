import { defineConfig, devices } from 'playwright/test';

const isRealBackend = process.env.PLAYWRIGHT_REAL_BACKEND === 'true';
const port = 4173;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: isRealBackend
    ? undefined
    : {
        command: `npx vite --mode playwright --host 127.0.0.1 --port ${port} --strictPort`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

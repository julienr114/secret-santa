import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run against a Cloudflare build (scripts/e2e-server.sh)
// on a phone-sized viewport, mobile first like the app. One server and
// one worker by default (`pnpm test:e2e`, to debug a file); `pnpm controle`
// runs several of these side by side, a server and a part of the files
// each (scripts/e2e.ts, ticket 168), through E2E_PORT.
const port = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: './tests/e2e',
  // Side by side, each its own results: one run empties its folder.
  outputDir: process.env.E2E_PORT ? `test-results/e2e-${port}` : 'test-results',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
    locale: 'fr-FR',
    // The offers of the home on a phone (ticket 124) are made once per
    // phone: made already, so that they do not cover the screens tested.
    // `phone.spec.ts` starts without them.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: `http://localhost:${port}`,
          localStorage: [
            { name: 'utt-install-offered', value: '1' },
            { name: 'utt-notify-offered', value: '1' },
          ],
        },
      ],
    },
  },
  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        defaultBrowserType: 'chromium',
        // Local runs use the installed Google Chrome; CI installs Chromium.
        ...(process.env.CI ? {} : { channel: 'chrome' }),
      },
    },
  ],
  webServer: {
    command: './scripts/e2e-server.sh',
    url: `http://localhost:${port}/api/health`,
    timeout: 240_000,
    reuseExistingServer: false,
  },
});

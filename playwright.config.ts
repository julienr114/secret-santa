import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run against a Cloudflare build (scripts/e2e-server.sh)
// on a phone-sized viewport, mobile first like the app.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'retain-on-failure',
    locale: 'fr-FR',
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
    url: 'http://localhost:3100/api/health',
    timeout: 240_000,
    reuseExistingServer: false,
  },
});

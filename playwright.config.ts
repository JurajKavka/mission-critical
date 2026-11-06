import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4325', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4325',
    url: 'http://127.0.0.1:4325/games/atlas-rush/',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});

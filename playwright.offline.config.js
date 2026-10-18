import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export default defineConfig({
  testDir: './tests/offline', workers: 1, timeout: 90000,
  expect: { timeout: 15000 },
  use: { launchOptions: { executablePath: process.env.CHROME_PATH || (existsSync(chrome) ? chrome : undefined) } },
});

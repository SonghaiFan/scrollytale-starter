import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const macChrome =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const executablePath =
  process.env.CHROME_PATH || (existsSync(macChrome) ? macChrome : undefined);
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 15000 },
  use: {
    baseURL: "http://127.0.0.1:4173",
    launchOptions: { executablePath },
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm run docs:preview -- --port 4174 --strictPort",
      url: "http://127.0.0.1:4174/scrollytale-starter/",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run preview -- --port 4173 --strictPort",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "node tooling/serve-authoring-test.js",
      url: "http://127.0.0.1:5183",
      reuseExistingServer: !process.env.CI,
    },
  ],
});

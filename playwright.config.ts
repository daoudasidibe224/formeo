import { defineConfig } from "@playwright/test";
const port = Number(process.env.E2E_PORT ?? 4318);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("E2E_PORT invalide.");
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: "./tests/browser",
  use: { baseURL, headless: true },
  webServer: {
    command: `npm start -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
  },
  reporter: "list",
});

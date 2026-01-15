import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 32303);

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  webServer:
    process.env.PLAYWRIGHT_NO_WEB_SERVER === "1"
      ? undefined
      : {
          command: "pnpm exec next dev --webpack -p 32303",
          url: `http://127.0.0.1:${PORT}`,
          reuseExistingServer: !process.env.CI,
          timeout: 240_000,
          env: {
            ...process.env,
            DATABASE_URL: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
            NODE_ENV: "development",
          },
        },
});

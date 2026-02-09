import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 32304);

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
          command: "pnpm exec next dev --webpack -p 32304",
          url: `http://127.0.0.1:${PORT}`,
          reuseExistingServer: false,
          timeout: 240_000,
          env: {
            ...process.env,
            DATABASE_URL: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
            NODE_ENV: "development",
            MKCHAT_E2E_MOCK_CHAT: "1",
          },
        },
});

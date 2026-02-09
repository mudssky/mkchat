import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";

const execFileAsync = promisify(execFile);
const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

interface ChatFixture {
  userId: string;
  providerConfigId: string;
  assistantId: string;
  topicId: string;
  rootMessageId: string;
  messageIds: string[];
}

async function runFixtureScript(mode: "create"): Promise<ChatFixture>;
async function runFixtureScript(
  mode: "cleanup",
  fixture: ChatFixture,
): Promise<undefined>;
async function runFixtureScript(
  mode: "create" | "cleanup",
  fixture?: ChatFixture,
): Promise<ChatFixture | undefined> {
  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    CHAT_FIXTURE: fixture ? JSON.stringify(fixture) : undefined,
  };
  const { stdout } = await execFileAsync(
    "node",
    ["tests/fixtures/chat-fixture.cjs", mode],
    { env },
  );

  if (mode === "create") {
    return JSON.parse(stdout) as ChatFixture;
  }
  return undefined;
}

let fixture: ChatFixture;

test.beforeAll(async () => {
  fixture = await runFixtureScript("create");
});

test.afterAll(async () => {
  await runFixtureScript("cleanup", fixture);
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
});

test("renders chat thread with branch navigation", async ({ page }) => {
  await page.goto(`/chat/${fixture.topicId}`);

  await expect(page.getByText("Test Assistant").first()).toBeVisible();
  await expect(page.getByText("Root message")).toBeVisible();
  await expect(page.getByText("First branch reply")).toBeVisible();

  const branchButton = page.getByRole("button", {
    name: `Branch selector for ${fixture.rootMessageId}`,
  });
  await expect(branchButton).toBeVisible();

  await expect(page.getByLabel("聊天输入")).toBeVisible();
});

test("completes basic chat flow", async ({ page }) => {
  await page.goto(`/chat/${fixture.topicId}`);

  const input = page.getByLabel("聊天输入");
  await expect(input).toBeEditable();
  await input.click();
  await input.pressSequentially("E2E mock message");
  await expect(input).toHaveValue("E2E mock message");
  await page.getByRole("button", { name: "arrow-up" }).first().click();

  await expect(
    page
      .locator('[data-testid="message-bubble"]')
      .filter({ hasText: "E2E mock message" })
      .first(),
  ).toBeVisible();

  const busyIndicator = page.getByText("模型正在生成，请稍候…");
  await expect(busyIndicator).toBeVisible();
  await expect(busyIndicator).toBeHidden({ timeout: 20_000 });

  await expect(
    page
      .locator('[data-testid="message-bubble"]')
      .filter({ hasText: "Mocked reply: E2E mock message" })
      .first(),
  ).toBeVisible({ timeout: 20_000 });
});

test("supports error recovery flow", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/chat**", async (route) => {
    const request = route.request();
    if (request.method() !== "POST") {
      await route.fallback();
      return;
    }

    attempts += 1;
    if (attempts === 1) {
      await route.abort("failed");
      return;
    }

    await route.continue();
  });

  await page.goto(`/chat/${fixture.topicId}`);

  const input = page.getByLabel("聊天输入");
  await expect(input).toBeEditable();
  await input.click();
  await input.pressSequentially("need retry");
  await expect(input).toHaveValue("need retry");
  await page.getByRole("button", { name: "arrow-up" }).first().click();

  await expect(page.getByRole("button", { name: "重试生成" })).toBeVisible();

  await input.click();
  await input.fill("");
  await input.pressSequentially("retry once more");
  await expect(input).toHaveValue("retry once more");
  await page.getByRole("button", { name: "arrow-up" }).first().click();

  await expect.poll(() => attempts).toBeGreaterThan(1);
  await expect(page.getByRole("button", { name: "重试生成" })).toBeHidden();
  await expect(page.getByText("Mocked reply: retry once more")).toBeVisible();
});

test("shows accessibility labels and keyboard order", async ({ page }) => {
  await page.goto(`/chat/${fixture.topicId}`);

  await expect(
    page.getByRole("button", {
      name: `Branch selector for ${fixture.rootMessageId}`,
    }),
  ).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("聊天输入")).toBeFocused();
});

test.describe("mobile layout", () => {
  test.use({ viewport: { width: 375, height: 720 } });

  test("shows compact branch indicator", async ({ page }) => {
    await page.goto(`/chat/${fixture.topicId}`);

    const branchButton = page.getByRole("button", {
      name: `Branch selector for ${fixture.rootMessageId}`,
    });
    await expect(branchButton).toContainText("1/2");
  });
});

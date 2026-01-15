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

test("renders chat thread with branch navigation", async ({ page }) => {
  await page.goto(`/chat/${fixture.topicId}`);

  await expect(page.getByText("Test Assistant")).toBeVisible();
  await expect(page.getByText("Root message")).toBeVisible();
  await expect(page.getByText("First branch reply")).toBeVisible();

  const branchButton = page.getByRole("button", {
    name: `Branch selector for ${fixture.rootMessageId}`,
  });
  await expect(branchButton).toBeVisible();

  await expect(page.getByLabel("聊天输入")).toBeVisible();
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

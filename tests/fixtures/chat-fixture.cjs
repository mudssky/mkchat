const Database = require("better-sqlite3");
const crypto = require("node:crypto");
const path = require("node:path");

const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const databasePath = databaseUrl.startsWith("file:")
  ? databaseUrl.replace("file:", "")
  : databaseUrl;
const resolvedPath = path.isAbsolute(databasePath)
  ? databasePath
  : path.resolve(process.cwd(), databasePath);
const db = new Database(resolvedPath);
db.pragma("foreign_keys = ON");

const createId = () => `c${crypto.randomBytes(12).toString("hex")}`;

const createFixture = () => {
  const now = new Date().toISOString();
  const userId = createId();
  const providerConfigId = createId();
  const assistantId = createId();
  const topicId = createId();
  const rootMessageId = createId();
  const childAId = createId();
  const childBId = createId();

  const insertUser = db.prepare('INSERT INTO "User" ("id") VALUES (?)');
  const insertProvider = db.prepare(
    'INSERT INTO "ProviderConfig" ("id", "userId", "name", "type", "apiKey") VALUES (?, ?, ?, ?, ?)',
  );
  const insertAssistant = db.prepare(
    'INSERT INTO "Assistant" ("id", "userId", "name", "providerConfigId", "modelId", "systemPrompt") VALUES (?, ?, ?, ?, ?, ?)',
  );
  const insertTopic = db.prepare(
    'INSERT INTO "Topic" ("id", "assistantId", "createdAt", "updatedAt", "title") VALUES (?, ?, ?, ?, ?)',
  );
  const insertMessage = db.prepare(
    'INSERT INTO "Message" ("id", "topicId", "content", "role", "createdAt", "parentId") VALUES (?, ?, ?, ?, ?, ?)',
  );

  const transaction = db.transaction(() => {
    insertUser.run(userId);
    insertProvider.run(
      providerConfigId,
      userId,
      "Test Provider",
      "openai",
      "test-key",
    );
    insertAssistant.run(
      assistantId,
      userId,
      "Test Assistant",
      providerConfigId,
      "gpt-4o-mini",
      "You are a test assistant.",
    );
    insertTopic.run(topicId, assistantId, now, now, "Test Topic");
    insertMessage.run(
      rootMessageId,
      topicId,
      "Root message",
      "user",
      now,
      null,
    );
    insertMessage.run(
      childAId,
      topicId,
      "First branch reply",
      "assistant",
      now,
      rootMessageId,
    );
    insertMessage.run(
      childBId,
      topicId,
      "Second branch reply",
      "assistant",
      now,
      rootMessageId,
    );
  });
  transaction();

  return {
    userId,
    providerConfigId,
    assistantId,
    topicId,
    rootMessageId,
    messageIds: [rootMessageId, childAId, childBId],
  };
};

const cleanupFixture = (fixture) => {
  if (!fixture) return;
  const deleteMessages = db.prepare(
    'DELETE FROM "Message" WHERE "id" IN (?, ?, ?)',
  );
  const deleteTopic = db.prepare('DELETE FROM "Topic" WHERE "id" = ?');
  const deleteAssistant = db.prepare('DELETE FROM "Assistant" WHERE "id" = ?');
  const deleteProvider = db.prepare(
    'DELETE FROM "ProviderConfig" WHERE "id" = ?',
  );
  const deleteUser = db.prepare('DELETE FROM "User" WHERE "id" = ?');

  const transaction = db.transaction(() => {
    deleteMessages.run(...fixture.messageIds);
    deleteTopic.run(fixture.topicId);
    deleteAssistant.run(fixture.assistantId);
    deleteProvider.run(fixture.providerConfigId);
    deleteUser.run(fixture.userId);
  });
  transaction();
};

const run = async () => {
  const mode = process.argv[2];
  try {
    if (mode === "create") {
      const fixture = await createFixture();
      process.stdout.write(JSON.stringify(fixture));
      return;
    }
    if (mode === "cleanup") {
      const fixture = JSON.parse(process.env.CHAT_FIXTURE || "null");
      await cleanupFixture(fixture);
      return;
    }
    throw new Error("Unknown mode");
  } finally {
    db.close();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

import path from "node:path";
import { PrismaClient } from "@generated/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import logger from "@/lib/logger";

const DEFAULT_DATABASE_URL = "file:./prisma/dev.db";
type PrismaLogLevel = "query" | "error" | "warn";
type PrismaClientWithLogs = PrismaClient<PrismaLogLevel>;

const normalizeDatabaseUrl = (databaseUrl?: string): string => {
  const trimmed = databaseUrl?.trim();
  if (!trimmed) {
    return DEFAULT_DATABASE_URL;
  }
  if (trimmed === ":memory:" || trimmed.startsWith("file:")) {
    if (!trimmed.startsWith("file:")) {
      return trimmed;
    }
    const pathPart = trimmed.slice("file:".length);
    if (!pathPart || pathPart === ":memory:") {
      return ":memory:";
    }
    if (path.isAbsolute(pathPart)) {
      return trimmed;
    }
    return `file:${path.resolve(process.cwd(), pathPart)}`;
  }
  if (/^[a-z][a-z0-9+.-]*:/.test(trimmed)) {
    return trimmed;
  }
  return `file:${path.resolve(process.cwd(), trimmed)}`;
};

const createPrismaClient = (): PrismaClientWithLogs => {
  const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
  if (process.env.DATABASE_URL !== databaseUrl) {
    process.env.DATABASE_URL = databaseUrl;
  }
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  return new PrismaClient({
    adapter,
    log: ["query", "error", "warn"],
  });
};

const globalForPrisma = global as unknown as {
  prisma?: PrismaClientWithLogs;
  prismaDebugAttached?: boolean;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

export const prismaDebugEnabled = process.env.PRISMA_DEBUG_STACK === "1";

export const logPrismaError = (
  error: unknown,
  context: Record<string, unknown>,
): void => {
  const errorPayload: Record<string, unknown> =
    error instanceof Error ? { err: error } : { error };
  logger.error(
    {
      ...errorPayload,
      ...context,
    },
    "Prisma request failed",
  );
};

if (prismaDebugEnabled && !globalForPrisma.prismaDebugAttached) {
  prisma.$on("error", (event) => {
    logger.error({ event }, "Prisma client error event");
  });
  globalForPrisma.prismaDebugAttached = true;
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

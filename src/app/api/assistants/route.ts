import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const buildAssistantDescription = (value: unknown) => {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  return normalized.slice(0, 120);
};

export async function GET() {
  try {
    const assistants = await prisma.assistant.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        systemPrompt: true,
        modelId: true,
        providerConfigId: true,
        topics: {
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    const summary = assistants.map(({ systemPrompt, ...assistant }) => ({
      ...assistant,
      description: buildAssistantDescription(systemPrompt),
    }));

    return Response.json({ assistants: summary });
  } catch (error) {
    logger.error({ error }, "Assistant list API Error");
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

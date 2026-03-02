import { z } from "zod";
import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  metadata: z.record(z.string(), z.any()),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const existing = await prisma.message.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json({ error: "Message not found" }, { status: 404 });
    }

    const currentMetadata =
      existing.metadata && typeof existing.metadata === "object"
        ? (existing.metadata as Record<string, unknown>)
        : {};

    const mergedMetadata = { ...currentMetadata, ...parsed.data.metadata };

    // Remove null values (allows unsetting fields like vote)
    for (const [key, value] of Object.entries(mergedMetadata)) {
      if (value === null) {
        delete mergedMetadata[key];
      }
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { metadata: mergedMetadata },
    });

    return Response.json(updated);
  } catch (error) {
    logger.error({ error }, "Message PATCH Error");
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

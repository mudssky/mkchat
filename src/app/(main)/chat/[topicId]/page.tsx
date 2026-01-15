import type { Prisma } from "@generated/client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { isValidTopicId } from "@/lib/chat/topic-id";
import { logPrismaError, prisma, prismaDebugEnabled } from "@/lib/prisma";

interface Props {
  params: Promise<{
    topicId: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicId } = await params;
  return {
    title: `Chat · ${topicId}`,
    description: "Chat session",
  };
}

export default async function ChatPage({ params }: Props) {
  const { topicId } = await params;

  if (!isValidTopicId(topicId)) {
    notFound();
  }

  type TopicPreview = Prisma.TopicGetPayload<{
    select: {
      id: true;
      assistant: { select: { name: true } };
    };
  }>;
  let topic: TopicPreview | null = null;
  try {
    topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        assistant: {
          select: {
            name: true,
          },
        },
      },
    });
  } catch (error) {
    if (prismaDebugEnabled) {
      logPrismaError(error, {
        action: "topic.findUnique",
        topicId,
      });
    }
    throw error;
  }

  if (!topic) {
    notFound();
  }

  const assistantName = topic.assistant?.name?.trim() || "未命名助手";
  const assistantInitial = assistantName ? assistantName[0] : "?";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-[800px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {assistantInitial}
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {assistantName}
              </div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Chat
              </div>
            </div>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            {topicId}
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[800px] flex-1 flex-col">
          <ChatContainer topicId={topicId} assistantName={assistantName} />
        </div>
      </main>
    </div>
  );
}

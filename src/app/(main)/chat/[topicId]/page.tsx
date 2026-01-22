import type { Prisma } from "@generated/client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { TopBar } from "@/components/layout/top-bar";
import { TopBarActions } from "@/components/layout/top-bar-actions";
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
    <div className="flex flex-1 flex-col">
      <TopBar
        title={assistantName}
        subtitle={`会话 · ${topicId}`}
        leading={assistantInitial}
        status={{ label: "模型状态：未知", tone: "neutral" }}
        actions={<TopBarActions />}
      />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[800px] flex-1 flex-col px-4 py-6 sm:px-6">
          <ChatContainer topicId={topicId} assistantName={assistantName} />
        </div>
      </main>
    </div>
  );
}

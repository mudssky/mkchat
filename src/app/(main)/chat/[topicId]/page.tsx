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
      title: true;
      assistant: {
        select: { name: true; modelId: true; providerConfigId: true };
      };
    };
  }>;
  let topic: TopicPreview | null = null;
  try {
    topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        title: true,
        assistant: {
          select: {
            name: true,
            modelId: true,
            providerConfigId: true,
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
  const topicTitle = topic.title?.trim() || "未命名对话";
  const assistantInitial = assistantName ? assistantName[0] : "?";

  const modelStatus = topic.assistant?.providerConfigId
    ? {
        label: `模型：${topic.assistant.modelId}`,
        tone: "info" as const,
      }
    : {
        label: "模型状态：未配置",
        tone: "warning" as const,
      };

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={assistantName}
        subtitle={`${topicTitle} · ${topicId}`}
        leading={assistantInitial}
        status={modelStatus}
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

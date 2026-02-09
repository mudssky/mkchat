import type { Prisma } from "@generated/client";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { PageFrame } from "@/components/layout/page-frame";
import { TopBar } from "@/components/layout/top-bar";
import { TopBarActions } from "@/components/layout/top-bar-actions";
import { isValidTopicId } from "@/lib/chat/topic-id";
import { logPrismaError, prisma, prismaDebugEnabled } from "@/lib/prisma";
import type {
  ChatMessageRecordMetadata,
  ChatRole,
  ChatTopic,
} from "@/types/chat";

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

type TopicDetail = Prisma.TopicGetPayload<{
  select: {
    id: true;
    assistantId: true;
    title: true;
    createdAt: true;
    updatedAt: true;
    assistant: {
      select: { name: true; modelId: true; providerConfigId: true };
    };
    messages: {
      select: {
        id: true;
        topicId: true;
        content: true;
        role: true;
        createdAt: true;
        parentId: true;
        metadata: true;
      };
    };
  };
}>;

function toChatTopic(topic: TopicDetail): ChatTopic {
  return {
    id: topic.id,
    assistantId: topic.assistantId,
    title: topic.title,
    createdAt: topic.createdAt.toISOString(),
    updatedAt: topic.updatedAt.toISOString(),
    messages: topic.messages.map((message) => ({
      id: message.id,
      topicId: message.topicId,
      content: message.content,
      role: message.role as ChatRole,
      createdAt: message.createdAt.toISOString(),
      parentId: message.parentId,
      metadata:
        (message.metadata as ChatMessageRecordMetadata | null | undefined) ??
        null,
    })),
  };
}

export default async function ChatPage({ params }: Props) {
  const { topicId } = await params;

  if (!isValidTopicId(topicId)) {
    notFound();
  }

  let topic: TopicDetail | null = null;
  try {
    topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        assistantId: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        assistant: {
          select: {
            name: true,
            modelId: true,
            providerConfigId: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            topicId: true,
            content: true,
            role: true,
            createdAt: true,
            parentId: true,
            metadata: true,
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
  const initialTopic = toChatTopic(topic);

  const modelStatus = !topic.assistant
    ? {
        label: "模型状态：异常",
        tone: "warning" as const,
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
        tooltip: "助手信息缺失，无法判断模型状态。",
      }
    : topic.assistant.providerConfigId
      ? {
          label: `模型：${topic.assistant.modelId}`,
          tone: "success" as const,
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          tooltip: "已配置模型提供商。",
        }
      : {
          label: "模型状态：未配置",
          tone: "warning" as const,
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          tooltip: "尚未绑定模型提供商。",
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
      <PageFrame widthPreset="chat" density="compact" className="flex">
        <div className="flex flex-1 flex-col">
          <ChatContainer
            topicId={topicId}
            assistantName={assistantName}
            initialTopic={initialTopic}
          />
        </div>
      </PageFrame>
    </div>
  );
}

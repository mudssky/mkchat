import { ChatEntry } from "@/components/chat/ChatEntry";
import { PageFrame } from "@/components/layout/page-frame";
import { MotionItem, PageMotion } from "@/components/layout/page-motion";
import { TopBar } from "@/components/layout/top-bar";
import { TopBarActions } from "@/components/layout/top-bar-actions";

export default function ConversationsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="会话列表"
        subtitle="选择助手或继续历史会话"
        actions={<TopBarActions />}
      />
      <PageFrame widthPreset="list" density="compact">
        <PageMotion>
          <MotionItem>
            <ChatEntry />
          </MotionItem>
        </PageMotion>
      </PageFrame>
    </div>
  );
}

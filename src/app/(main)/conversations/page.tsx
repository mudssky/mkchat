import { ChatEntry } from "@/components/chat/ChatEntry";
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
      <main className="flex-1 px-6 py-6">
        <PageMotion>
          <MotionItem className="mx-auto w-full max-w-5xl">
            <ChatEntry />
          </MotionItem>
        </PageMotion>
      </main>
    </div>
  );
}

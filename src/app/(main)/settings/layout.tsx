import { TopBar } from "@/components/layout/top-bar";
import { TopBarActions } from "@/components/layout/top-bar-actions";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SettingsSidebar />
      <main className="flex-1">
        <TopBar
          title="设置"
          subtitle="管理应用的外观、模型与 MCP 配置"
          actions={<TopBarActions />}
        />
        <div className="p-8">
          <div className="mx-auto max-w-4xl">{children}</div>
        </div>
      </main>
    </div>
  );
}

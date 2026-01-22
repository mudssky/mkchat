import { PageMotion } from "@/components/layout/page-motion";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { SettingsTopBar } from "@/components/settings/settings-top-bar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SettingsSidebar />
      <main className="flex-1">
        <SettingsTopBar />
        <div className="p-8">
          <PageMotion>
            <div className="mx-auto max-w-4xl">{children}</div>
          </PageMotion>
        </div>
      </main>
    </div>
  );
}

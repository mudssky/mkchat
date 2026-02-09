import { PageFrame } from "@/components/layout/page-frame";
import { PageMotion } from "@/components/layout/page-motion";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { SettingsTopBar } from "@/components/settings/settings-top-bar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <SettingsTopBar />
      <PageFrame widthPreset="settings" density="comfortable">
        <PageMotion>
          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <SettingsSidebar className="h-fit" />
            <div>{children}</div>
          </div>
        </PageMotion>
      </PageFrame>
    </div>
  );
}

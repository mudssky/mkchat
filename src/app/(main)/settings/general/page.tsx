"use client";

import { SettingsSection } from "@/components/settings/settings-section";
import { useSettingsStore } from "@/store/settings-store";
import type { ThemeMode } from "@/types/settings";

const themeOptions: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "浅色" },
  { value: "dark", label: "深色" },
  { value: "system", label: "跟随系统" },
];

const languageOptions = [
  { value: "zh-CN", label: "简体中文" },
  { value: "en-US", label: "English" },
];

export default function GeneralSettingsPage() {
  const { theme, language, setTheme, setLanguage } = useSettingsStore();

  return (
    <SettingsSection title="通用设置" description="管理应用的外观和语言偏好">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="mb-3 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
            主题模式
          </div>
          <div className="flex flex-wrap gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  theme === option.value
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <label
            htmlFor="language-select"
            className="mb-3 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            语言
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors hover:border-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:border-zinc-600 dark:focus:border-blue-400"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400">
        主题模式支持系统优先：选择“跟随系统”时会自动同步操作系统深浅色。
      </div>
    </SettingsSection>
  );
}

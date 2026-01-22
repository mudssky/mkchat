import { Sparkles, Workflow, Wrench } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { MotionItem, PageMotion } from "@/components/layout/page-motion";
import { TopBar } from "@/components/layout/top-bar";
import { TopBarActions } from "@/components/layout/top-bar-actions";

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-1 flex-col">
        <TopBar
          title="首页"
          subtitle="为每一次对话建立清晰的结构与节奏"
          actions={<TopBarActions />}
        />
        <main className="flex-1 px-6 py-8">
          <PageMotion>
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
              <MotionItem className="relative overflow-hidden rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm transition duration-500 ease-out hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                <div className="absolute -right-20 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-amber-200/70 via-orange-200/60 to-sky-200/60 blur-3xl dark:from-amber-400/20 dark:via-orange-400/20 dark:to-sky-400/20" />
                <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-gradient-to-tr from-slate-200/70 to-indigo-200/50 blur-3xl dark:from-slate-500/20 dark:to-indigo-500/20" />
                <div className="relative flex flex-col gap-6">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    温暖 / 科技
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold leading-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
                      AI Agent Workbench
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
                      统一管理多模型助手与 MCP
                      工具，把对话整理成可追踪、可分支的知识路径。
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/conversations"
                      className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      进入会话列表
                    </Link>
                    <Link
                      href="/settings/general"
                      className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:text-zinc-50"
                    >
                      配置模型与 MCP
                    </Link>
                  </div>
                  <div className="grid gap-4 text-sm text-zinc-500 dark:text-zinc-400 sm:grid-cols-3">
                    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                        快捷键
                      </div>
                      <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                        Ctrl / Cmd + Enter 发送
                      </div>
                    </div>
                    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                        分支对话
                      </div>
                      <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                        编辑历史消息即可创建新分支
                      </div>
                    </div>
                    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                        MCP 工具
                      </div>
                      <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                        绑定工具服务器丰富能力
                      </div>
                    </div>
                  </div>
                </div>
              </MotionItem>

              <section className="grid gap-6 md:grid-cols-3">
                {[
                  {
                    title: "清晰的协作结构",
                    description:
                      "用树状分支管理上下文，让每条探索路径都可追踪。",
                    icon: Workflow,
                  },
                  {
                    title: "模型与工具解耦",
                    description:
                      "灵活绑定 Provider 与 MCP，随时切换模型和工具栈。",
                    icon: Wrench,
                  },
                  {
                    title: "实时流式体验",
                    description: "从首个 token 到完整回复，始终保持流畅反馈。",
                    icon: Sparkles,
                  },
                ].map((feature) => (
                  <MotionItem
                    key={feature.title}
                    className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition duration-500 ease-out hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white transition duration-500 ease-out group-hover:-translate-y-0.5 group-hover:scale-[1.03] dark:bg-zinc-100 dark:text-zinc-900">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {feature.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      {feature.description}
                    </p>
                  </MotionItem>
                ))}
              </section>

              <MotionItem className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    下一步
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    用 3 分钟完成首次配置
                  </h2>
                  <ol className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
                        1
                      </span>
                      添加模型提供商并绑定 API Key。
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
                        2
                      </span>
                      选择助手，创建第一条会话。
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
                        3
                      </span>
                      需要工具时，添加 MCP 服务器增强能力。
                    </li>
                  </ol>
                </div>
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    快捷入口
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    <Link
                      href="/conversations"
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
                    >
                      会话列表
                      <span className="text-xs text-zinc-400">
                        继续上一次对话
                      </span>
                    </Link>
                    <Link
                      href="/settings/general"
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
                    >
                      通用设置
                      <span className="text-xs text-zinc-400">
                        调整主题与语言
                      </span>
                    </Link>
                    <Link
                      href="/settings/providers"
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
                    >
                      模型提供商
                      <span className="text-xs text-zinc-400">
                        绑定 API Key
                      </span>
                    </Link>
                  </div>
                </div>
              </MotionItem>
            </div>
          </PageMotion>
        </main>
      </div>
    </AppShell>
  );
}

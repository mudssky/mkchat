"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProviderConfig, SettingsStore } from "@/types/settings";

/**
 * 设置状态管理 Store
 * 使用 LocalStorage 持久化
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // ==================== 初始状态 ====================
      theme: "system",
      language: "zh-CN",
      providers: {},
      mcpServers: [],

      // ==================== 通用设置操作 ====================
      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => set({ language }),

      // ==================== 提供商操作 ====================
      upsertProvider: (provider) =>
        set((state) => ({
          providers: {
            ...state.providers,
            [provider.name]: provider,
          },
        })),

      removeProvider: (name) =>
        set((state) => {
          const newProviders = { ...state.providers };
          delete newProviders[name];
          return { providers: newProviders };
        }),

      getProvider: (name) => {
        return get().providers[name];
      },

      // ==================== MCP 服务器操作 ====================
      addMcpServer: (server) =>
        set((state) => ({
          mcpServers: [
            ...state.mcpServers,
            {
              ...server,
              id: crypto.randomUUID(),
            },
          ],
        })),

      updateMcpServer: (id, updates) =>
        set((state) => ({
          mcpServers: state.mcpServers.map((server) =>
            server.id === id ? { ...server, ...updates } : server,
          ),
        })),

      removeMcpServer: (id) =>
        set((state) => ({
          mcpServers: state.mcpServers.filter((server) => server.id !== id),
        })),

      updateMcpServerStatus: (id, status) =>
        set((state) => ({
          mcpServers: state.mcpServers.map((server) =>
            server.id === id
              ? { ...server, status, lastConnected: new Date() }
              : server,
          ),
        })),
    }),
    {
      name: "mkchat-settings",
      version: 1,
      // 只持久化需要的字段
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        providers: state.providers,
        mcpServers: state.mcpServers,
      }),
      // 从 v0 迁移：为缺少 type 字段的旧 Provider 推导类型
      migrate: (persisted, version) => {
        if (version === 0) {
          const state = persisted as Record<string, unknown>;
          const oldProviders = (state.providers ?? {}) as Record<
            string,
            ProviderConfig
          >;
          const migratedProviders: Record<string, ProviderConfig> = {};
          for (const [key, provider] of Object.entries(oldProviders)) {
            if (!provider.type) {
              const knownTypes: Record<string, ProviderConfig["type"]> = {
                openai: "openai",
                anthropic: "anthropic",
              };
              migratedProviders[key] = {
                ...provider,
                type: knownTypes[provider.name] ?? "openai-compatible",
              };
            } else {
              migratedProviders[key] = provider;
            }
          }
          return { ...state, providers: migratedProviders };
        }
        return persisted as SettingsStore;
      },
    },
  ),
);

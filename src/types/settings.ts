/**
 * 设置相关类型定义
 */

// 主题选项
export type ThemeMode = "light" | "dark" | "system";

// 提供商类型
export type ProviderType = "openai" | "anthropic" | "openai-compatible";

// 提供商配置
export interface ProviderConfig {
  name: string; // openai, anthropic, 或自定义名称（如 "DeepSeek"）
  type: ProviderType; // 提供商类型
  apiKey: string;
  apiEndpoint?: string;
  models?: string[]; // 可用的模型列表
  selectedModel?: string; // 当前选中的模型
  enabled: boolean;
  displayName?: string; // 自定义显示名称（openai-compatible 类型专用）
}

// MCP 服务器配置
export interface McpServerConfig {
  id: string;
  name: string;
  url: string; // SSE endpoint URL
  status: "connected" | "disconnected" | "error";
  lastConnected?: Date;
}

// 设置状态
export interface SettingsState {
  // 通用设置
  theme: ThemeMode;
  language: string;

  // 提供商配置
  providers: Record<string, ProviderConfig>;

  // MCP 服务器配置
  mcpServers: McpServerConfig[];
}

// 设置操作
export interface SettingsActions {
  // 通用设置操作
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: string) => void;

  // 提供商操作
  upsertProvider: (provider: ProviderConfig) => void;
  removeProvider: (name: string) => void;
  getProvider: (name: string) => ProviderConfig | undefined;

  // MCP 服务器操作
  addMcpServer: (server: Omit<McpServerConfig, "id">) => void;
  updateMcpServer: (id: string, updates: Partial<McpServerConfig>) => void;
  removeMcpServer: (id: string) => void;
  updateMcpServerStatus: (
    id: string,
    status: McpServerConfig["status"],
  ) => void;
}

export type SettingsStore = SettingsState & SettingsActions;

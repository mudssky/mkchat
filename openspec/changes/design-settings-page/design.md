# Settings Architecture & Design

## Layout Strategy
采用 `Sidebar + Content` 的布局模式 (类似 VS Code Settings 或常见的 SaaS 设置页)。
- **Left**: Navigation Menu (Categories)
- **Right**: Form Sections

## State Management
使用 **Zustand** 进行状态管理，并结合 `persist` middleware 存储于 LocalStorage。
- Store Name: `useSettingsStore`
- Structure:
  ```ts
  interface SettingsState {
    theme: 'light' | 'dark' | 'system';
    language: string;
    providers: Record<string, ProviderConfig>; // openai, anthropic
    mcpServers: McpServerConfig[];
  }
  ```

## Component Hierarchy
- `SettingsLayout`: 包含 Sidebar 和 Content Area wrapper。
- `SettingsSidebar`: 导航链接。
- `SettingsSection`: 通用容器，带标题和说明。
- `ProviderForm`: 针对特定 Provider 的表单。
- `McpServerList`: MCP 服务器列表管理。

## UX Considerations
- **Immediate Feedback**: 修改设置后应即时保存（或提供显式保存按钮，建议 LocalStorage 类即时保存）。
- **Sensitive Data**: API Keys 应当 masked 显示 (`sk-****`).

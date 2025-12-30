# Design Settings Page

## Background
目前应用缺乏配置界面，用户无法管理 API Keys 和 MCP Server 连接。

## Goal
设计并实现设置页面，支持系统偏好、模型提供商和 MCP 工具的配置。

## Scope
- **UI Structure**: 侧边栏导航 + 内容区域的设置布局。
- **Configuration Groups**:
  - General: 主题，语言。
  - Providers: API Endpoint, Keys, Model selection.
  - MCP: Server URLs, Status checking.
- **Persistence**: 客户端本地存储 (LocalStorage)。

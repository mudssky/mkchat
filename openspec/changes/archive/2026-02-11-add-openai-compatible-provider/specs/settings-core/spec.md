## MODIFIED Requirements

### Requirement: Provider Configuration

系统 **MUST** 允许用户配置主流 LLM 提供商 (OpenAI, Anthropic 等) 以及任意 OpenAI 兼容供应商的认证信息。

#### Scenario: Configure OpenAI Key
- **Given** 用户在 Provider 设置页
- **WHEN** 用户输入 API Key
- **THEN** 系统 **SHALL** 安全保存该 Key (在本地)

#### Scenario: Configure OpenAI Compatible Provider
- **WHEN** 用户在 Provider 设置页选择 "OpenAI 兼容" 类型
- **THEN** 系统 **SHALL** 显示额外的必填字段：自定义名称、API Endpoint（必填）、自定义模型 ID
- **AND** 提交后系统 **SHALL** 将该 Provider 以 `type: "openai-compatible"` 存储

#### Scenario: Provider type selection
- **WHEN** 用户点击添加 Provider
- **THEN** 系统 **SHALL** 提供三种 Provider 类型供选择：OpenAI、Anthropic、OpenAI 兼容

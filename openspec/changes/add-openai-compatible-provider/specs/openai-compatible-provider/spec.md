## ADDED Requirements

### Requirement: OpenAI Compatible Provider Type

系统 **MUST** 支持 `openai-compatible` 作为一种独立的 Provider 类型，允许用户接入任意兼容 OpenAI API 格式的第三方服务。

#### Scenario: Create openai-compatible provider
- **WHEN** 用户在 Provider 设置页选择 "OpenAI 兼容" 类型
- **THEN** 系统 **SHALL** 将该 Provider 的 `type` 存储为 `"openai-compatible"`

#### Scenario: Provider type persists across sessions
- **WHEN** 用户创建了一个 `openai-compatible` 类型的 Provider 并刷新页面
- **THEN** 系统 **SHALL** 正确恢复该 Provider 的类型为 `"openai-compatible"`

### Requirement: Custom Base URL (Required)

当 Provider 类型为 `openai-compatible` 时，系统 **MUST** 要求用户提供 `baseURL`。

#### Scenario: baseURL is required for openai-compatible
- **WHEN** 用户选择 `openai-compatible` 类型并尝试提交表单但未填写 `baseURL`
- **THEN** 系统 **SHALL** 阻止提交并显示验证错误提示

#### Scenario: baseURL is used for API calls
- **WHEN** 系统使用 `openai-compatible` Provider 发起 AI 调用
- **THEN** 系统 **SHALL** 将用户配置的 `baseURL` 传递给 `@ai-sdk/openai` 的 `createOpenAI({ baseURL })` 工厂函数

### Requirement: Custom Display Name

当 Provider 类型为 `openai-compatible` 时，系统 **MUST** 允许用户自定义 Provider 的显示名称（如 "DeepSeek"、"Groq"、"Local Ollama"）。

#### Scenario: User sets custom name
- **WHEN** 用户选择 `openai-compatible` 类型并输入自定义名称 "DeepSeek"
- **THEN** 系统 **SHALL** 使用 "DeepSeek" 作为该 Provider 在列表中的显示名称

#### Scenario: Custom name is editable
- **WHEN** 用户编辑一个已有的 `openai-compatible` Provider
- **THEN** 系统 **SHALL** 允许修改其自定义名称

### Requirement: Custom Model ID

系统 **MUST** 允许用户为 `openai-compatible` Provider 指定自定义模型 ID。

#### Scenario: User inputs custom model ID
- **WHEN** 用户配置 `openai-compatible` Provider 并输入模型 ID `"deepseek-chat"`
- **THEN** 系统 **SHALL** 在 `models` 列表中包含该自定义模型 ID

#### Scenario: Custom model is selectable in assistant
- **WHEN** 用户在 Assistant 配置中选择一个 `openai-compatible` Provider
- **THEN** 系统 **SHALL** 列出用户为该 Provider 配置的所有自定义模型 ID 供选择

### Requirement: Model Factory Support

`model-factory.ts` **MUST** 支持 `openai-compatible` 类型的 Provider。

#### Scenario: Create model for openai-compatible provider
- **WHEN** `getModel()` 收到 `type: "openai-compatible"` 的 ProviderConfig
- **THEN** 系统 **SHALL** 使用 `@ai-sdk/openai` 的 `createOpenAI` 工厂创建模型实例，传入 `apiKey` 和 `baseURL`

#### Scenario: Unsupported type still throws
- **WHEN** `getModel()` 收到一个未知的 `type`（如 `"unknown-provider"`）
- **THEN** 系统 **SHALL** 抛出 `Error("Unsupported provider: unknown-provider")`

### Requirement: Title Generation Fallback

`title-generator.ts` **MUST** 对 `openai-compatible` 类型提供合理的标题生成回退。

#### Scenario: Title generation with openai-compatible
- **WHEN** 系统为 `openai-compatible` Provider 的对话生成标题
- **THEN** 系统 **SHALL** 使用 Assistant 配置的 `modelId` 进行标题生成调用

#### Scenario: Title generation failure gracefully handled
- **WHEN** 使用 `openai-compatible` Provider 的标题生成调用失败
- **THEN** 系统 **SHALL** 静默忽略并保留默认标题，不影响主对话流程

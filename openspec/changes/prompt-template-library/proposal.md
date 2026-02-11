# Change: prompt-template-library

## Why

当前 System Prompt 硬绑定在 Assistant 上，每次想切换角色/风格需要到设置页修改。用户常见的需求是：快速切换"翻译模式" / "代码审查模式" / "写作辅助模式"，而不需要为每种场景单独创建一个 Assistant。

Prompt 模板库让用户可以积累和复用高质量 prompt，降低 Assistant 配置的认知负担。

## What Changes

- **Prompt 模板 CRUD**: 新建、编辑、删除、收藏 prompt 模板，每个模板包含 name, content, category, variables
- **模板变量**: 支持 `{{变量名}}` 语法，使用时弹出填写表单（如 `{{语言}}` -> 下拉选择 "中文/英文/日文"）
- **模板分类**: 预设分类（翻译、编程、写作、分析），支持用户自定义分类
- **快速应用**: 在 Assistant 编辑页可从模板库选择并填入 systemPrompt 字段
- **预置模板**: 内置 5-8 个常用模板（通用助手、代码审查、翻译、文档写作等）
- **数据模型**: 新增 `PromptTemplate` 表（id, userId, name, content, category, variables, isFavorite, isBuiltin）

## Impact

**受影响的 specs**:
- **settings-core** (修改): 新增 Prompt 管理页面
- **data-modeling** (修改): 新增 PromptTemplate 模型

**受影响的代码**:
- `prisma/schema/` - 新增 prompt.prisma
- `src/app/(main)/settings/prompts/page.tsx` - 新增 Prompt 管理页
- `src/app/api/prompts/route.ts` - 新增 CRUD API
- `src/app/api/prompts/[id]/route.ts` - 新增单条操作 API
- `src/components/settings/PromptTemplateForm.tsx` - 新增模板编辑表单
- `src/components/settings/PromptTemplatePicker.tsx` - 新增模板选择器
- `src/app/(main)/settings/assistants/[id]/page.tsx` - 集成模板选择器

**预计工作量**: ~2-3 天

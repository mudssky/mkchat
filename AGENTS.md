- 默认用简体中文回复（除非我明确要求英文/其他语言）。
- 代码/命令/报错信息保留原样，不要翻译代码块内容。
- 需要查官方文档或库用法时，使用 `context7` tools。
- 写代码时，请用中文写注释。重点解释复杂的业务逻辑和设计意图，不要解释显而易见的语法，所有函数都需要包含标准的参数和返回值说明
任务开发完成后，必须执行pnpm qa (format,lint,typecheck,test)，确保通过
<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# General Guidelines

- **Language Policy**: Always use **Chinese** for reasoning, explanations, and commit messages. Keep code identifiers in English.
- **Trae Configuration**: You MUST read and follow the rules defined in `.trae/rules/` at the start of the session.

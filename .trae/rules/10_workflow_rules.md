# 🧠 10_workflow_rules.md

## 🔄 The Golden Loop
> Context → Plan → Code → Verify → Self-Correct

### 1. Context Gathering (Read)
- **Mandatory**: Before writing any code, READ the existing files.
- **Trace**: Trace imports and dependencies to understand the impact.
- **Search**: Use `SearchCodebase` or `Grep` to find relevant code patterns.

### 2. Planning (Think)
- **Mandatory**: Output a structured plan before coding.
- **Template**:
  ```markdown
   - [ ] Goals：清晰描述要达成的结果
      - [ ] Steps：
        - [ ] 步骤 1 …
      - [ ] **Impact Analysis**（必须）：
        - 修改文件：`path/to/file`
        - 受影响模块：`ComponentName`
      - [ ] **Verification**:
        - 自动执行: [具体命令，如 `pnpm qa` 或 `pnpm typecheck`]
        - 结果检查: 确认无报错，功能符合预期。
  ```

### 3. Execution (Act)
- **Atomic**: Make small, verifiable changes.
- **Safe**: Do not break existing functionality without a plan.
- **Smart**: Use `SearchReplace` for edits, `Write` for new files.

### 4. Verification (Test)
- **Mandatory**: Run verification commands after EVERY change.
- **Tools**: Use `pnpm typecheck`, `pnpm lint`, or specific test commands.
- **No Manual**: Do not ask the user to test manually if an automated check is possible.

### 5. Self-Correction (Fix)
- **Analyze**: If verification fails, read the error message carefully.
- **Refine**: Update the plan if needed.
- **Retry**: Fix the issue and verify again.

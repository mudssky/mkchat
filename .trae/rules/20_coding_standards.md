# 🛡️ 20_coding_standards.md

## 🧱 Architecture Principles

- **SOLID**: Follow SOLID principles for all components and services.
- **SRP (Single Responsibility Principle)**: Each component or function should do one thing well.
- **DRY (Don't Repeat Yourself)**: Extract common logic into hooks or utility functions.

## 🟦 TypeScript Policy (Strict)

- **No `any`**: Explicitly type everything. Use `unknown` if necessary, but never `any`.
- **Interfaces over Types**: Use `interface` for object definitions, `type` for unions/primitives.
- **Strict Null Checks**: Always handle `null` and `undefined`.
- **Zod**: Use Zod for runtime validation (e.g., API responses, forms).

## ⚛️ React & Next.js Guidelines

- **Server Components by Default**: Use Server Components (RSC) unless interactivity (`useState`, `useEffect`) is required.
- **Client Components**: Mark with `'use client'` at the top. Keep them leaf nodes if possible.
- **Hooks**: Custom hooks should be named `use[Name]`.
- **Functional Components**: Use `function` keyword or const arrows.
- **Props**: Use interface for Props. `interface Props { ... }`.

## 🎨 Styling (Tailwind CSS)

- **Utility-First**: Use Tailwind utility classes directly.
- **No Inline Styles**: Avoid `style={{ ... }}` unless dynamic.
- **clsx / twMerge**: Use `clsx` or `tailwind-merge` for conditional class names.

## 🧪 Testing & Verification

| 测试层级 | 测试对象 | 策略 | 工具 | 推荐指数 |
| :--- | :--- | :--- | :--- | :--- |
| **纯逻辑/工具函数** | `utils/*.ts`, `hooks/*.ts` | **详细测试**。逻辑不容易变，且容易测，收益最高。 | Vitest | ⭐⭐⭐⭐⭐ |
| **通用 UI 组件** | Button, Card, Navbar (Client) | **快照测试**。`expect(container).toMatchSnapshot()`。保证基础积木不崩。 | Vitest | ⭐⭐⭐⭐ |
| **业务复杂组件** | 包含表单、复杂交互的组件 | **冒烟测试**。`render(<Comp />)` 保证能打开即可。 | Vitest | ⭐⭐⭐ |
| **页面 (Pages)** | `app/**/page.tsx` | **E2E 测试**。只写一个脚本：打开页面 -> 检查关键元素。 | Playwright | ⭐⭐⭐⭐⭐ |

### 🛠️ Test Template

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TargetComponent from './TargetComponent'

// 1. 如果组件用了 useRouter/useParams，先 Mock 掉
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn() }),
  usePathname: () => '',
}))

describe('TargetComponent', () => {
  it('renders successfully', () => {
    const { container } = render(<TargetComponent />)
    expect(container).toBeTruthy()
  })
})
```

### ✅ Checks
- **Linting**: Ensure `pnpm lint` (Biome) passes.
- **Typecheck**: Ensure `pnpm typecheck` passes.
- **Format**: Run `pnpm format` before committing.
- **QA**: `pnpm qa` is the ultimate gateway.

## 📝 Naming Conventions

- **Files**: `kebab-case` (e.g., `user-profile.tsx`, `api-client.ts`).
- **Components**: `PascalCase` (e.g., `UserProfile`).
- **Functions/Variables**: `camelCase`.
- **Constants**: `UPPER_SNAKE_CASE`.
- **Directories**: `kebab-case`.

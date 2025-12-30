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

- **Unit Tests**: Write tests for utilities and complex logic.
- **Linting**: Ensure `pnpm lint` (Biome) passes.
- **Typecheck**: Ensure `pnpm typecheck` passes.
- **Format**: Run `pnpm format` before committing.

## 📝 Naming Conventions

- **Files**: `kebab-case` (e.g., `user-profile.tsx`, `api-client.ts`).
- **Components**: `PascalCase` (e.g., `UserProfile`).
- **Functions/Variables**: `camelCase`.
- **Constants**: `UPPER_SNAKE_CASE`.
- **Directories**: `kebab-case`.

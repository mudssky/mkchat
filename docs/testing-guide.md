# 测试指南

本文档介绍项目中使用的测试策略、工具和最佳实践。

## 📊 测试策略

我们采用 **ROI（投资回报率）驱动** 的分层测试策略：

| 测试层级 | 测试对象 | 策略 | 工具 | ROI |
|:---------|:---------|:-----|:-----|:----|
| **L1** | 纯逻辑/工具函数 | 详细测试 | Vitest | ⭐⭐⭐⭐⭐ |
| **L2** | 通用 UI 组件 | 快照测试 | Vitest + RTL | ⭐⭐⭐⭐ |
| **L3** | 业务复杂组件 | 冒烟测试 | Vitest + RTL | ⭐⭐⭐ |
| **L4** | 页面 (E2E) | 关键路径测试 | Playwright (未来) | ⭐⭐⭐⭐⭐ |

### 核心原则

- **优先测试纯逻辑**：工具函数、hooks、utils 的 ROI 最高
- **组件用快照测试**：防止意外变更，不需要详细断言
- **复杂组件做冒烟测试**：确保能渲染即可
- **页面级用 E2E**：仅测试关键用户路径

## 🚀 快速开始

### 运行测试

```bash
# Watch 模式 (推荐开发时使用)
pnpm test

# 运行所有测试一次
pnpm test:run

# 查看 UI 界面
pnpm test:ui

# 生成覆盖率报告
pnpm test:coverage

# 完整质量检查 (包含测试)
pnpm qa
```

### 测试文件命名

- 组件测试：`ComponentName.test.tsx`
- 工具函数测试：`utils.test.ts`
- Server Action 测试：`action.test.ts`

## 📝 测试模板

### 1. 组件测试模板

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import YourComponent from './YourComponent'

describe('YourComponent', () => {
  // 🟢 冒烟测试 (最省事)
  it('renders without crashing', () => {
    const { container } = render(<YourComponent />)
    expect(container).toBeTruthy()
  })

  // 🟡 快照测试 (防意外变更)
  it('matches snapshot', () => {
    const { container } = render(<YourComponent />)
    expect(container).toMatchSnapshot()
  })

  // 🔴 交互测试 (测点击/输入)
  it('handles user interaction', () => {
    render(<YourComponent />)
    const btn = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(btn)
    expect(btn).toBeDisabled()
  })
})
```

### 2. 工具函数测试模板

```ts
import { describe, it, expect } from 'vitest'

describe('util function', () => {
  it('should return correct result', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('should handle edge cases', () => {
    expect(formatCurrency(0)).toBe('$0.00')
    expect(formatCurrency(-100)).toBe('-$100.00')
  })
})
```

### 3. Server Action 测试模板

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { yourAction } from './your-action'

vi.mock('@/lib/db', () => ({
  db: { user: { findUnique: vi.fn() } }
}))

describe('yourAction', () => {
  afterEach(() => { vi.clearAllMocks() })

  it('returns error on invalid input', async () => {
    const result = await yourAction('invalid')
    expect(result).toEqual({ error: 'Invalid input' })
  })
})
```

## 🛠️ 常用 Mock

### Next.js Navigation

已在 `vitest.setup.ts` 中全局 Mock：

```tsx
import { useRouter } from 'next/navigation'

// 测试中直接使用，无需额外配置
const router = useRouter()
router.push('/test') // Mock 函数
```

### Next.js Image / Link

已在 `vitest.setup.ts` 中全局 Mock：

```tsx
import Image from 'next/image'
import Link from 'next/link'

// 在测试中渲染为 img 和 a 标签
```

### 自定义 Mock

```tsx
import { vi } from 'vitest'

// Mock 外部库
vi.mock('external-lib', () => ({
  default: vi.fn(),
  someFunction: vi.fn(() => 'mocked'),
}))

// Mock 模块
const mockData = { key: 'value' }
vi.mock('./data', () => ({
  getData: vi.fn(() => mockData),
}))
```

## 📚 Testing Library API

### 查询元素

| API | 描述 | 示例 |
|:---|:-----|:-----|
| `screen.getByText(/Hello/i)` | 按文本查找 | `getByText('Submit')` |
| `screen.getByRole('button')` | 按角色查找 (推荐) | `getByRole('button', { name: /Save/ })` |
| `screen.getByLabelText('Email')` | 按标签查找 | `getByLabelText('Email')` |
| `screen.getByPlaceholderText('Search')` | 按占位符查找 | `getByPlaceholderText('Search')` |
| `screen.getByTestId('submit-btn')` | 按 data-testid 查找 | `getByTestId('submit-btn')` |
| `screen.queryByText(...)` | 查找可能不存在的元素 | `queryByText('Loading')` |

### 断言

```tsx
// 元素存在
expect(element).toBeInTheDocument()

// 文本内容
expect(element).toHaveTextContent('Submit')

// 属性
expect(element).toHaveAttribute('href', '/home')
expect(element).toHaveClass('btn-primary')

// 状态
expect(button).toBeDisabled()
expect(input).toHaveValue('test@test.com')

// 函数调用
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith(arg1, arg2)
expect(mockFn).toHaveBeenCalledTimes(1)
```

### 用户交互

```tsx
import { fireEvent, userEvent } from '@testing-library/react'

// 点击
fireEvent.click(button)
await userEvent.click(button)

// 输入
fireEvent.change(input, { target: { value: 'test' } })
await userEvent.type(input, 'test')

// 提交表单
fireEvent.submit(form)
```

## ⚠️ 避坑指南

### 1. Server Components 无法直接测试

❌ **错误做法**：
```tsx
// app/page.tsx (Server Component)
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// Page.test.tsx
import Page from './page' // ❌ 会报错
```

✅ **正确做法**：
```tsx
// app/page.tsx
import ClientView from './ClientView'

export default async function Page() {
  const data = await fetchData()
  return <ClientView data={data} />
}

// app/ClientView.tsx
'use client'
export default function ClientView({ data }) {
  return <div>{data}</div>
}

// ClientView.test.tsx
import ClientView from './ClientView' // ✅ 可以测试
```

### 2. 不要测试实现细节

❌ **错误**：
```tsx
it('calls useState with initial value', () => {
  const useStateSpy = vi.spyOn(React, 'useState')
  render(<Component />)
  expect(useStateSpy).toHaveBeenCalledWith(0)
})
```

✅ **正确**：
```tsx
it('displays initial count', () => {
  render(<Component />)
  expect(screen.getByText('0')).toBeInTheDocument()
})
```

### 3. 异步测试要使用 async/await

```tsx
it('loads data asynchronously', async () => {
  render(<Component />)
  // 等待元素出现
  expect(await screen.findByText('Loaded')).toBeInTheDocument()
})
```

## 🎯 最佳实践

### 1. AAA 模式

```tsx
it('does something', () => {
  // Arrange (安排)
  const props = { value: 10 }
  render(<Component {...props} />)

  // Act (执行)
  fireEvent.click(screen.getByRole('button'))

  // Assert (断言)
  expect(screen.getByText('Updated')).toBeInTheDocument()
})
```

### 2. 使用 data-testid 选择器（当其他方法都失效时）

```tsx
<button data-testid="submit-btn">Submit</button>

// 测试中
const button = screen.getByTestId('submit-btn')
```

### 3. 测试边界情况

```tsx
describe('formatCurrency', () => {
  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('handles negative numbers', () => {
    expect(formatCurrency(-100)).toBe('-$100.00')
  })

  it('handles large numbers', () => {
    expect(formatCurrency(999999)).toBe('$999,999.00')
  })
})
```

### 4. 清理副作用

```tsx
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup() // 已在 vitest.setup.ts 中配置
  vi.clearAllMocks() // 清除所有 Mock
})
```

## 🔗 相关资源

- [Vitest 官方文档](https://vitest.dev/)
- [Testing Library 官方文档](https://testing-library.com/)
- [Testing Library 最佳实践](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [项目测试示例](../src/__tests__/examples/)

## ❓ 常见问题

### Q: 测试运行报错 `Cannot find module '@/components/X'`

**A**: 检查 `vitest.config.ts` 中是否配置了 `vite-tsconfig-paths` 插件。

### Q: 测试中 `window is not defined`

**A**: 确保 `vitest.config.ts` 中设置了 `environment: 'jsdom'`。

### Q: 快照测试失败太多

**A**: 快照应该专注于结构而非内容。考虑使用更精确的断言而不是快照。

### Q: 测试太慢

**A**: 1) 使用 `vi.mock()` Mock 耗时操作 2) 优先测试纯函数 3) 考虑减少快照测试。

### Q: 是否需要追求 100% 覆盖率？

**A**: 不需要。我们专注于高 ROI 测试（纯逻辑 > 通用组件 > 业务组件 > E2E）。

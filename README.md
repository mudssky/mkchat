This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## UI System Conventions

The app now follows a template-first UI contract to keep route-level layout and navigation behavior consistent.

- Global shell: `AppShell` provides first-level navigation (`/`, `/conversations`, `/settings/*`).
- Page context: `TopBar` is used across core pages for title/subtitle/status/actions.
- Content container: `PageFrame` controls width presets (`home`, `list`, `chat`, `settings`) and density (`comfortable`, `compact`).
- Module navigation: `ModuleSubNav` is used for module-scoped secondary nav (settings by default).

## Chat UI

- Chat route: `/chat/[topicId]`
- Core components: `src/components/chat/`
- Streaming API: `POST /api/chat`
- Topic API: `GET /api/topics/[id]`

更多组件与交互说明见 `docs/chat-components.md`。

### Theme Resolution (System-First)

Theme state is resolved with system-first semantics:

- `theme = "system"` → follow OS theme
- `theme = "light" | "dark"` → explicit override

Resolved theme is applied on `document.documentElement[data-theme]` and consumed by global CSS variables in `src/app/globals.css`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

项目默认开发端口为 `32303`，可直接访问 `http://127.0.0.1:32303`。

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

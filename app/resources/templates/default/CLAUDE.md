# Project

This is a website built with Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui.

## Tech stack

- **Framework:** React 19 with React Router v7
- **Build:** Vite 7 with `@vitejs/plugin-react`
- **Styling:** Tailwind CSS v4 (imported via `@tailwindcss/vite` plugin)
- **Components:** shadcn/ui (already installed — full component library in `src/components/ui/`)
- **Icons:** lucide-react
- **Font:** Inter Variable (via `@fontsource-variable/inter`)
- **Path alias:** `@/` maps to `src/`

## Project structure

```
src/
  App.tsx              # Router — all routes defined here
  main.tsx             # React entry point
  index.css            # Global styles, Tailwind config, CSS variables (theme colors)
  pages/               # Page components (one per route)
    home.tsx
    blog.tsx
    blog-post.tsx
  layouts/             # Layout wrappers with shared header/nav
    root-layout.tsx
  components/
    ui/                # shadcn/ui primitives — DO NOT edit these directly
  hooks/               # Custom React hooks
  lib/                 # Utility functions
content/
  blog/                # Markdown blog posts (frontmatter + body)
```

## How to make changes

- **Add a page:** Create a new component in `src/pages/`, add a `<Route>` in `src/App.tsx`, add a nav link in `src/layouts/root-layout.tsx`
- **Edit the homepage:** Modify `src/pages/home.tsx`
- **Change navigation/header:** Modify `src/layouts/root-layout.tsx`
- **Change colors/theme:** Edit CSS variables in `src/index.css` (`:root` for light, `.dark` for dark mode)
- **Use UI components:** Import from `@/components/ui/button`, `@/components/ui/card`, etc. All shadcn/ui components are pre-installed.
- **Add a blog post:** Create a `.md` file in `content/blog/` with frontmatter (title, date, excerpt)

## Rules

- NEVER create standalone HTML files. This is a React SPA — all UI goes in React components.
- NEVER replace the React setup with plain HTML/CSS/JS.
- Always use Tailwind CSS utility classes for styling. Do not create separate CSS files.
- Use shadcn/ui components (`@/components/ui/*`) for buttons, cards, dialogs, forms, etc. They are already installed.
- Keep the existing router structure. Add pages as new `<Route>` entries in `App.tsx`.
- Use the `@/` path alias for all imports (e.g., `import { Button } from "@/components/ui/button"`).

## Dev server — IMPORTANT

The Vite dev server is **already running** and managed by the host application. Do NOT:
- Run `npm run dev`, `npx vite`, `vite`, or any command that starts a dev server
- Run `npm start` or any other server start command
- Kill, restart, or stop any running processes
- Modify `vite.config.ts` in ways that would require a server restart (port changes, plugin changes)

Just edit the source files. Vite HMR will pick up changes automatically. If you need to install a new npm package, use `npm install <package>` — the dev server will continue running.

# TermUI vs Ink

TermUI and Ink are both TypeScript frameworks for building terminal user interfaces. Both use React-style JSX components. They differ in scope, architecture, and what they include out of the box.

## What is Ink?

Ink is a React renderer for the terminal. You write React components and Ink renders them into ANSI output. It gives you components, hooks, and basic layout. It runs on `react` itself, the same library you use in the browser.

## What is TermUI?

TermUI is a dedicated terminal UI framework with its own JSX runtime (`@termuijs/jsx`), layout engine, style system, router, state manager, animation engine, and testing renderer. It ships as 15 independent packages. You install only what you need.

## Side-by-side comparison

| Feature | TermUI | Ink |
|---|---|---|
| Language | TypeScript | TypeScript / JavaScript |
| JSX runtime | Own (`@termuijs/jsx`) | React |
| Layout engine | Custom flexbox | React/Yoga |
| Theming | Terminal Style Sheets (TSS) | Inline styles |
| Global state | `@termuijs/store` (Zustand-like) | Third-party (e.g. Zustand, Jotai) |
| Routing | `@termuijs/router` (file-based) | None built-in |
| Animations | `@termuijs/motion` (spring + easing) | None built-in |
| Hot reload | `@termuijs/dev-server` (restart in under 200ms) | None built-in |
| Test renderer | `@termuijs/testing` | `ink-testing-library` |
| VirtualList | Yes (1M+ items, same performance) | No |
| System data | `@termuijs/data` (CPU, memory, disk, network) | No |
| Package count | 15 | 1 |
| Dependencies | Zero C extensions | React (C++ via Node.js bindings) |

## Key differences

### Theming

Ink uses inline styles passed as props. TermUI uses Terminal Style Sheets (TSS). TSS lets you define reusable style variables, pseudo-classes, and theme tokens in one place.

```ts
// TSS — TermUI
const theme = createTheme({
  primary: '#00ff88',
  background: '#0a0a0f',
  danger: '#ff4444',
})
```

With Ink, you pass style objects per-component. At scale this means managing colors and spacing across dozens of files.

### Routing

Ink has no built-in router. You manage screen state manually. TermUI includes `@termuijs/router`, a file-based routing system with typed params, navigation guards, and transition hooks.

### Hot reload

TermUI restarts your app in under 200ms on every file save via `@termuijs/dev-server`. Ink has no built-in hot reload, you restart manually or wire up your own file watcher.

### VirtualList

TermUI's `VirtualList` widget renders only the visible rows in a list, regardless of total size. A list of 1,000,000 items performs the same as a list of 10. Ink has no built-in virtual list.

### Animations

TermUI includes `@termuijs/motion` with spring physics and easing-based transitions. Ink has no built-in animation system.

## When to use Ink

- Your team already uses React and wants identical mental models in the terminal
- You want the smallest possible dependency surface
- Your project is a simple CLI output tool with no interactive UI needs

## When to use TermUI

- You need theming, routing, or animations without wiring them yourself
- You are building a dashboard or interactive TUI with complex state
- You want hot reload and a test renderer that matches production behavior
- You want a VirtualList for large datasets

## Installing TermUI

```bash
bunx create-termui-app my-app
cd my-app
bun run dev
```

Or install packages directly:

```bash
bun add @termuijs/core @termuijs/widgets @termuijs/jsx
```

## Installing Ink

```bash
npm install ink react
```

## Frequently asked questions

### Does TermUI work with React?

No. TermUI uses its own JSX runtime (`@termuijs/jsx`). It does not depend on React. This means no React version conflicts and no browser-targeted abstractions in your terminal app.

### Is TermUI production-ready?

Yes. TermUI ships as 15 published packages at version 0.1.6, each with its own test suite.

### Does TermUI support Node.js 18?

Yes. TermUI requires Node.js 18 or later and any terminal with 256-color or truecolor support.

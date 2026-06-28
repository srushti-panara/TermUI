# Installation

Get TermUI running in your project. There are two paths: scaffold a new app with the CLI, or add packages to something you already have.

## Prerequisites

- **Bun** 1.3 or later for development
- **Node.js** 18+ if you only consume published `@termuijs/*` packages from npm
- A terminal with 256-color or truecolor support

## Create a new project

The scaffolding CLI sets up a ready-to-run project:

<PackageTabs
  bunx={`bunx create-termui-app my-app\ncd my-app\nbun install\nbun run dev`}
  bun="bun create termui-app my-app"
  npx="npx create-termui-app my-app"
/>

This gives you:

- TypeScript configuration
- Hot-reload dev server (`bun run dev`)
- Example app with Box, Text, and keyboard handling
- TSS theme setup with the default dark theme
- Vitest config for testing

## Add to an existing project

Install the packages you need:

<PackageTabs
  bun={`# Core framework (required)\nbun add @termuijs/core\n\n# UI building blocks\nbun add @termuijs/widgets\nbun add @termuijs/ui\nbun add @termuijs/jsx\n\n# Application features\nbun add @termuijs/tss\nbun add @termuijs/router\nbun add @termuijs/motion\nbun add @termuijs/store\nbun add @termuijs/data\n\n# Development tools\nbun add -D @termuijs/testing\nbun add -D @termuijs/dev-server`}
  npm={`# Core framework (required)\nnpm install @termuijs/core\n\n# UI building blocks\nnpm install @termuijs/widgets\nnpm install @termuijs/ui\nnpm install @termuijs/jsx\n\n# Application features\nnpm install @termuijs/tss\nnpm install @termuijs/router\nnpm install @termuijs/motion\nnpm install @termuijs/store\nnpm install @termuijs/data\n\n# Development tools\nnpm install --save-dev @termuijs/testing\nnpm install --save-dev @termuijs/dev-server`}
/>

## Verify it works

Create an `index.ts` to check your setup:

```ts

// Build a simple widget tree
const root = new Box({ border: 'round', padding: 1 })
root.addChild(new Text('Hello from TermUI!'))

// Create and mount the app
const app = new App(root, { fullscreen: true })
await app.mount()
```

Run it:

```bash
$ bun index.ts
```

You should see a rounded box with your text inside. Press `Ctrl+C` to exit.

## Package overview

| Package                | What it does                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `@termuijs/core`       | Screen buffer, input parsing, event system, layout engine                                              |
| `@termuijs/widgets`    | Box, Text, Table, ProgressBar, Spinner, Gauge, VirtualList, DataGrid, Calendar, Markdown, and 60+ more |
| `@termuijs/ui`         | Select, Tabs, Modal, Toast, Tree, MultiSelect, Drawer, Wizard, RadioGroup, MenuBar, and 25+ more       |
| `@termuijs/jsx`        | JSX runtime, useState, useEffect, useContext, memo, useAsync                                           |
| `@termuijs/tss`        | CSS-like theming with variables and selectors                                                          |
| `@termuijs/router`     | Screen routing with dynamic params and history                                                         |
| `@termuijs/motion`     | Spring physics and easing-based transitions                                                            |
| `@termuijs/store`      | Zustand-style state with selector subscriptions                                                        |
| `@termuijs/data`       | System monitoring: CPU, memory, disk, network, processes                                               |
| `@termuijs/quick`      | Rapid prototyping with reactive values and layout helpers                                              |
| `@termuijs/testing`    | In-memory test renderer with query and interaction API                                                 |
| `@termuijs/dev-server` | Process-based hot reload for development (uses Bun.spawn)                                              |

## Next steps

- **Quick start**: build a working app in a few minutes
- **Architecture**: how the packages fit together
- **Core overview**: the render engine in detail
- **Testing guide**: write your first component test

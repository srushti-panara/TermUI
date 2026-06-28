# Quick start

This walks you through building a small interactive app. Should take about five minutes.

## 1.

Scaffold your app

```bash
$ bunx create-termui-app my-dashboard
$ cd my-dashboard
```

## 2.

Hello world

Open `src/index.ts` and replace the contents:

```ts

const root = new Box({ border: 'round', padding: 1 })
root.addChild(new Text('Hello, TermUI!'))

const app = new App(root, { fullscreen: true })
await app.mount()

// Output:
// ╭─────────────────────╮
// │ Hello, TermUI!       │
// ╰─────────────────────╯
```

## 3.

Add keyboard input

Let's make it respond to key presses:

```ts

let count = 0
const label = new Text('Counter: 0')
const hint  = new Text('Press ↑/↓ to change, q to quit', { dim: true })

const root = new Box({ border: 'round', padding: 1, flexDirection: 'column' })
root.addChild(label)
root.addChild(hint)

const app = new App(root, { fullscreen: true })

app.events.on('key', (event) => {
    if (event.key === 'up')   { count++; label.setContent('Counter: ' + count); app.requestRender() }
    if (event.key === 'down') { count--; label.setContent('Counter: ' + count); app.requestRender() }
    if (event.key === 'q')    app.exit()
})

await app.mount()
```

## 4.

Add a theme

Use Terminal Style Sheets to define colors as variables, then apply them to widgets:

```ts

// 1. Define the theme
const engine = new ThemeEngine()
engine.load(`
  @theme ocean {
    --primary: #00d4ff;
    --bg: #0a0a1a;
    --border: #1a1a3a;
  }

  Box {
    border-color: var(--border);
  }

  Box:focused {
    border-color: var(--primary);
  }
`)
engine.setTheme('ocean')

// 2. Build the widget tree
const root = new Box({ border: 'round', padding: 1, flexDirection: 'column' })
const title = new Text('Ocean Dashboard', { bold: true })
root.addChild(title)

// 3. Apply theme styles to widgets
root.applyStyles(engine.resolveStyle('Box'))

// 4. Re-apply on theme change
engine.onChange(() => {
    root.applyStyles(engine.resolveStyle('Box'))
    app.requestRender()
})

// 5. Mount the app
const app = new App(root, { fullscreen: true })
await app.mount()
```

## Next steps

- [**Architecture**: how the 15 packages connect](/docs/getting-started/architecture)
- [**Widgets**: Box, Table, ProgressBar, VirtualList](/docs/widgets/overview)
- [**TSS**: Terminal Style Sheets in depth](/docs/tss/overview)
- [**Springs**: physics-based animations](/docs/motion/springs)

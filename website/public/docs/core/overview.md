# Core

Everything in TermUI sits on top of `@termuijs/core`. It handles the screen buffer, input decoding, layout computation, style data, events, and the application lifecycle.

If you only install one package, this is it.

## Installation

```bash
npm install @termuijs/core
```

## What's inside

| Export                                                        | What it does                                                                        |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `App`                                                         | Wires terminal, input, screen, and render loop together                             |
| `Screen`                                                      | Double-buffered cell grid with diff-based rendering                                 |
| `Renderer`                                                    | Diffs screen buffers and flushes changes to stdout                                  |
| `Terminal`                                                    | Raw mode, alt screen, cursor control, clipboard, bell, notifications, resize events |
| `InputParser`                                                 | Decodes raw stdin bytes into key, mouse, and paste events                           |
| `MouseGestures`                                               | Synthesizes double-click and drag events from raw mouse events                      |
| `ChordMatcher`                                                | Binds multi-key sequences (vim-style chords) to handlers                            |
| `EventEmitter`                                                | Type-safe publish/subscribe                                                         |
| `FocusManager`                                                | Tab-order focus cycling across widgets                                              |
| `createLayoutNode / computeLayout`                            | Flexbox-inspired layout engine                                                      |
| `resolveConstraints / Constraint`                             | Constraint-based axis splitting for dashboard-style layouts                         |
| `Pos / Dim / resolveLayoutVariables`                          | Position and dimension algebra for overlay and absolute layouts                     |
| `prefersReducedMotion / shouldUseColor / prefersHighContrast` | Environment capability helpers                                                      |
| `defaultStyle / mergeStyles`                                  | Style objects. colors, bold, dim, underline                                         |
| `parseColor`                                                  | Named, hex, and RGB color parsing                                                   |
| `stringWidth / truncate / wordWrap`                           | Unicode-aware string measurement and wrapping                                       |

## Quick example

```ts

const root = new Box({ border: 'round', padding: 1 })
root.addChild(new Text('Hello, TermUI!', { bold: true }))

const app = new App(root)

app.events.on('key', (event) => {
    if (event.key === 'q') app.exit()
})

await app.mount()
```

## How other packages use core

- `@termuijs/widgets` renders into the Screen buffer and uses the layout engine for positioning
- `@termuijs/tss` builds on top of the Style interface, adding CSS-like variables and themes
- `@termuijs/router` plugs into the App lifecycle for screen transitions
- `@termuijs/motion` animates style properties through the render loop

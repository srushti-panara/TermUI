# App lifecycle

The `App` class wires everything together. terminal setup, input parsing, screen buffering, focus management, and the render loop.

You give it a root widget and it handles the rest.

## Basic usage

```ts

// Your root widget implements render() and getLayoutNode()
const myWidget = new Box({ border: 'round', padding: 1 })
myWidget.addChild(new Text('Hello from TermUI'))

const app = new App(myWidget, {
    fullscreen: true,   // use alternate screen buffer
    fps: 30,            // render loop speed
    mouse: false,       // enable mouse events
    title: 'My App',    // terminal title bar
})

// Start the app. blocks until exit() is called
await app.mount()
```

## Options

| Option        | Type                              | Default       | What it does                                           |
| ------------- | --------------------------------- | ------------- | ------------------------------------------------------ |
| `fullscreen`  | `boolean`                         | `true`        | Enter the alternate screen buffer                      |
| `screenMode`  | `'alternate' | 'main' | 'inline'` | `'alternate'` | Controls which screen buffer is used (see below)       |
| `inlineRows`  | `number`                          | `0`           | Number of rows to render in inline mode                |
| `fps`         | `number`                          | `30`          | Render loop frequency                                  |
| `mouse`       | `boolean`                         | `false`       | Track mouse clicks and movement                        |
| `dockBorders` | `boolean`                         | `false`       | Merge adjacent widget borders into junction characters |
| `title`       | `string`                          | -             | Set the terminal window title                          |

## Screen modes

The `screenMode` option controls how the app occupies the terminal:

```ts
// Full-screen app on the alternate screen buffer (default)
new App(root, { screenMode: 'alternate' })

// Render into the main scrollback buffer (no alt screen)
new App(root, { screenMode: 'main' })

// Render only N rows at the current cursor position, inline
new App(root, { screenMode: 'inline', inlineRows: 10 })
```

Inline mode is useful for CLI tools that want a small interactive widget without taking over the whole terminal. The app renders the bottom `inlineRows` rows at the cursor position and scrollback is preserved above it.

## Handling input

Key and mouse events are dispatched through the app's `events` emitter. Keys bubble from the focused widget up to the root, then to the app level:

```ts
// Listen for keys at the app level
app.events.on('key', (event) => {
    if (event.key === 'q') app.exit()
    if (event.key === 'tab') app.focus.focusNext()
})

// Listen for mouse events (requires mouse: true)
app.events.on('mouse', (event) => {
    console.log(event.x, event.y, event.button)
})

// Listen for terminal resize
app.events.on('resize', ({ cols, rows }) => {
    console.log('Terminal resized to', cols, 'x', rows)
})
```

## Overlays

Overlays render above the normal widget tree. Use them for modals, dropdowns, and toasts:

```ts
app.addOverlay('modal', 200)    // higher zIndex = on top
app.removeOverlay('modal')
```

## API reference

| Method                    | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| `mount()`                 | Start the app. Returns a promise that resolves on exit. |
| `unmount()`               | Stop the app and restore the terminal.                  |
| `exit(code?)`             | Signal the app to shut down.                            |
| `requestRender()`         | Schedule a re-render on the next frame.                 |
| `addOverlay(id, zIndex?)` | Create a layer that renders above everything.           |
| `removeOverlay(id)`       | Remove an overlay layer.                                |

## Environment helpers

Three helpers let you adapt rendering to the user's environment. Import them from `@termuijs/core`:

```ts

// Skip animation frames when the user or CI has disabled motion
if (prefersReducedMotion()) {
    renderStaticFrame()
} else {
    startAnimation()
}

// Omit ANSI color codes when NO_COLOR or TERM=dumb is set
if (shouldUseColor()) {
    output += colorEscape
}

// Use more distinct color pairs when HIGH_CONTRAST=1 is set
if (prefersHighContrast()) {
    fg = 'white'
    bg = 'black'
}
```

| Helper                   | Returns true when                                                  |
| ------------------------ | ------------------------------------------------------------------ |
| `prefersReducedMotion()` | `NO_MOTION=1` is set or the process is running in CI (`CI=1`)      |
| `shouldUseColor()`       | Color is supported. Returns false when `NO_COLOR=1` or `TERM=dumb` |
| `prefersHighContrast()`  | `HIGH_CONTRAST=1` is set                                           |

Animated widgets must check `prefersReducedMotion()` and render their static end-state when it returns true.

## Clipboard

The app exposes clipboard access through the terminal's OSC 52 support:

```ts
// Write text to the system clipboard
app.writeClipboard('copied!')

// Read text from the system clipboard
const text = await app.readClipboard()
```

## What's inside

The app exposes its internals as read-only properties if you need them:

```ts
app.terminal   // Terminal. raw mode, alt screen, stdout writes
app.screen     // Screen. double-buffered cell grid
app.renderer   // Renderer. diff engine and render loop
app.input      // InputParser. stdin decoder
app.focus      // FocusManager. tab-order focus cycling
app.events     // EventEmitter. key, mouse, resize, mount, unmount
app.layers     // LayerManager. overlay z-ordering
```

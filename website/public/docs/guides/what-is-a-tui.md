# What is a TUI?

A TUI (terminal user interface) runs inside a terminal emulator and renders a persistent, interactive interface using text and ANSI escape codes. Unlike a one-shot CLI command, a TUI stays open, responds to keyboard input in real time, and updates parts of the screen without redrawing everything.

Examples you've likely used: `htop`, `lazygit`, `vim`, `ncdu`, `k9s`.

## TUI vs CLI

| | CLI | TUI |
|---|---|---|
| Output | Scrolling lines | Persistent, redrawn UI |
| Interaction | Arguments and flags | Keyboard navigation, forms |
| Rendering | stdout lines | ANSI cell grid |
| Use case | One-shot commands | Dashboards, editors, file managers |

A **CLI** (command-line interface) reads arguments, runs once, and prints output. A **TUI** takes over the terminal, manages a screen buffer, and handles real-time keyboard events. Both run in the same terminal window; the difference is in persistence and interaction.

## How a TUI renders

TUIs use ANSI escape codes to move the cursor, set colors, and clear regions. A double-buffered renderer compares the previous frame with the new one and writes only the changed cells. This is what makes 60fps updates possible without flickering.

```
ESC[2J       clear screen
ESC[1;1H     move cursor to row 1, col 1
ESC[32m      set foreground to green
ESC[0m       reset all attributes
```

In TermUI, `@termuijs/core` handles all of this. The `Screen` class manages the double buffer. The `Renderer` writes the diff. `InputParser` decodes raw stdin bytes into typed `KeyEvent` objects.

## TUI in Node.js

Node.js TUIs write to `process.stdout` using ANSI sequences and read from `process.stdin` in raw mode. Raw mode disables the terminal's line-buffering so each keypress arrives as it happens, not only after the user presses Enter.

```ts
process.stdin.setRawMode(true)
process.stdin.resume()
process.stdin.on('data', (buf) => {
  // buf contains raw bytes including escape sequences
})
```

Doing this manually is error-prone. Escape sequences vary by terminal emulator. Wide characters (CJK, emoji) span multiple columns. Cleanup on exit requires careful signal handling. Terminal UI frameworks handle all of it.

## TypeScript TUI frameworks compared

| Framework | JSX | Router | Theming | Animations | Hot reload |
|---|---|---|---|---|---|
| TermUI | Own runtime | Yes | TSS (CSS-like) | Spring + easing | Yes, under 200ms |
| Ink | React | No | Inline styles | No | No |
| Blessed | No | No | Manual | No | No |

TermUI ships 15 packages and zero C extensions. Ink reuses React directly. Blessed is JavaScript-only with no JSX.

## Build a TUI in TypeScript with TermUI

Scaffold a new project in one command:

```bash
bunx create-termui-app my-tui
cd my-tui
bun run dev
```

Or add packages to an existing project:

```bash
bun add @termuijs/core @termuijs/widgets @termuijs/jsx
```

A minimal interactive app:

```tsx

function Counter() {
  const [count, setCount] = useState(0)
  useInput((key) => {
    if (key === '+') setCount((c) => c + 1)
  })
  return (
    <Box border="round" padding={1}>
      <Text>Count: {count}</Text>
      <Text dim>Press + to increment, q to quit</Text>
    </Box>
  )
}

await render(<Counter />)
```

## Frequently asked questions

### Is a TUI the same as a CLI?

No. A CLI runs a command and exits. A TUI takes over the terminal and stays running, updating the display in response to keyboard input and data changes.

### Can I build a TUI in TypeScript without React?

Yes. TermUI uses its own JSX runtime (`@termuijs/jsx`) independent of React. You get `useState`, `useEffect`, `useContext`, and `memo()` with no React dependency and no browser-targeted abstractions.

### What terminals does a TUI run in?

Any terminal emulator that supports ANSI escape codes: iTerm2, Kitty, Alacritty, Windows Terminal, GNOME Terminal, tmux, and SSH sessions. TermUI requires 256-color support, which has been standard since 2010.

### How do I test a TUI?

Use `@termuijs/testing`. It renders your component tree into an in-memory screen buffer. Query with `t.getByText()`, fire keyboard events with `t.fireKey()`, and assert on ANSI output without a real terminal.

### What is a TUI used for?

Common uses include system monitoring dashboards (like htop), file managers, log viewers, database explorers, Git UIs, CI/CD status monitors, and interactive CLI tools that need multi-step input or real-time data display.

# Screen

The `Screen` class is a double-buffered grid of cells. It stores what's on screen now and what was there before.

On each frame, the `Renderer` diffs the two buffers and writes only the cells that changed.

## Constructor

```ts

// Create a buffer. typically your terminal dimensions
const screen = new Screen(80, 24)

// The Renderer handles stdout output; Screen just manages cells
```

## Writing to the buffer

```ts
// Write a string at (col, row)
screen.writeString(5, 2, 'Hello TermUI!')

// Write with style attributes (fg, bg, bold, etc.)
screen.writeString(5, 3, 'Bold text', { bold: true })

// Set a single cell
screen.setCell(0, 0, { char: '┌', fg: 'green' })

// Read a cell back
const cell = screen.getCell(0, 0)
// → { char: '┌', fg: 'green', bg: '', ... }
```

## Clipping regions

Push a clip rectangle to restrict where writes land. Anything outside the clip is silently ignored.

This is how bordered containers keep content inside their walls:

```ts
screen.pushClip({ x: 2, y: 2, width: 20, height: 10 })

// These writes only affect cells inside the clip
screen.writeString(0, 0, 'This is clipped')  // ignored. outside
screen.writeString(3, 3, 'This shows up')     // inside clip

screen.popClip()
```

## Buffer lifecycle

| Method                            | What it does                                              |
| --------------------------------- | --------------------------------------------------------- |
| `writeString(x, y, text, attrs?)` | Write text at a position with optional style              |
| `setCell(x, y, cell)`             | Set a single cell                                         |
| `getCell(x, y)`                   | Read a cell back                                          |
| `clear()`                         | Fill the entire buffer with empty cells                   |
| `resize(cols, rows)`              | Resize both buffers (clears content)                      |
| `swap()`                          | Swap front and back buffers after the renderer diffs them |
| `pushClip(rect)`                  | Restrict writes to a rectangular region                   |
| `popClip()`                       | Remove the most recent clip                               |

## How diffing works

The screen holds two buffers: **front** (what's visible) and **back** (what we're drawing). Widgets write to the back buffer.

The `Renderer` then walks both buffers cell by cell and emits ANSI escape sequences only for cells that differ. A full-screen update that touches 3 cells writes exactly 3 escape sequences.

## OSC 8 hyperlinks

Cells support an optional `link` field. Set it alongside any other style attribute to associate a URL with the rendered characters:

```ts
screen.setCell(5, 2, { char: 'D', link: 'https://example.com' })

// Or via writeString with the link style attribute
screen.writeString(5, 2, 'Docs', { link: 'https://example.com', underline: true })
```

The `link` field accepts `https://`, `http://`, and `file://` URLs. Other schemes are sanitized away. The renderer emits OSC 8 open and close sequences around runs of cells that share the same URL.

## Cursor shape

Call `setCursorShape` on the `Terminal` to change the cursor appearance via DECSCUSR:

```ts
app.terminal.setCursorShape('bar')         // blinking beam (default blink)
app.terminal.setCursorShape('block', false) // steady block
app.terminal.setCursorShape('underline')   // blinking underline
```

Valid shapes: `'block'`, `'bar'`, `'underline'`. Pass `false` as the second argument for a steady (non-blinking) cursor.

## Terminal bell and notifications

```ts
// Ring the audible bell (BEL)
app.terminal.bell()

// Send an OSC 9 desktop notification
app.terminal.notify('Build finished')
app.terminal.notify('Error', 'Compilation failed on line 42')
```

The `notify` call sends an OSC 9 escape sequence that iTerm2, WezTerm, and other compatible terminals display as a desktop notification.

## Clipboard

Read and write the system clipboard via OSC 52:

```ts
// Write to clipboard
app.terminal.writeClipboard('copied text')

// Read from clipboard (async)
const text = await app.terminal.readClipboard()
```

Or use the convenience methods on `App` directly:

```ts
app.writeClipboard('hello')
const text = await app.readClipboard()
```

Clipboard access requires a terminal that supports OSC 52 (iTerm2, xterm, Kitty, WezTerm, Alacritty, Windows Terminal).

## ANSI escape sanitization

`writeString` and `setCell` strip ANSI escape sequences and C0/C1 control characters from all user-supplied content before writing to the buffer. This prevents escape injection through untrusted data such as file names or network responses.

Safe characters (TAB, LF) are preserved. Everything else outside the printable range is removed silently.

## Test backend

For unit tests, use the in-memory test screen instead of a real terminal:

```ts

const ts = createTestScreen(30, 5)
testScreenSetString(ts, 0, 0, 'Hello!')
console.log(testScreenToString(ts))
// → "Hello!                        "
//   "                              "
//   ...
```

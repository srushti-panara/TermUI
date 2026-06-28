# Input parser

The `InputParser` sits between raw stdin and your app. It reads bytes off the stream, decodes escape sequences, and fires typed `KeyEvent` and `MouseEvent` callbacks.

The App creates one for you, but you have direct access if you need lower-level control.

## Usage

```ts

const parser = new InputParser(process.stdin)

parser.onKey((event) => {
    console.log(event.key, event.ctrl, event.shift, event.alt)
})

parser.onMouse((event) => {
    console.log(event.x, event.y, event.button)
})

// Start reading from stdin
parser.start()

// Later, stop reading
parser.stop()
```

## KeyEvent

```ts
interface KeyEvent {
    key: string        // 'a', 'enter', 'up', 'escape', etc.
    ctrl: boolean      // Ctrl was held
    shift: boolean     // Shift was held
    alt: boolean       // Alt/Option was held
    raw: Buffer        // The original bytes from stdin
}
```

## Supported keys

| Category   | Keys                                                               |
| ---------- | ------------------------------------------------------------------ |
| Printable  | All ASCII characters                                               |
| Navigation | `up`, `down`, `left`, `right`, `home`, `end`, `pageup`, `pagedown` |
| Control    | `enter`, `tab`, `escape`, `backspace`, `delete`, `space`           |
| Function   | `f1` through `f12`                                                 |
| Modifiers  | `ctrl+*`, `shift+*`, `alt+*`                                    |

## API

| Method                   | What it does                                                       |
| ------------------------ | ------------------------------------------------------------------ |
| `onKey(handler)`         | Register a key event callback. Returns unsubscribe function.       |
| `onMouse(handler)`       | Register a mouse event callback. Returns unsubscribe function.     |
| `onPaste(handler)`       | Register a bracketed-paste callback. Returns unsubscribe function. |
| `onFocusChange(handler)` | Register a terminal focus-in/focus-out callback.                   |
| `start()`                | Begin reading from stdin.                                          |
| `stop()`                 | Stop reading. Can be restarted later.                              |

## Bracketed paste

When bracketed paste mode is active, the terminal wraps pasted text in `\x1b[200~` and `\x1b[201~` markers. The parser detects those markers and fires a `paste` event with the raw text, instead of treating each character as a key press.

Enable it via the `Terminal` option or the `App` constructor, then subscribe:

```ts
const parser = new InputParser(process.stdin)

parser.onPaste((text) => {
    console.log('User pasted:', text)
})
```

The `App` forwards paste events through `app.events.on('paste', handler)`.

## Mouse gestures

`MouseGestures` synthesizes higher-level events from the raw `mousedown`, `mousemove`, and `mouseup` stream. Import and use it alongside `InputParser`:

```ts

const parser = new InputParser(process.stdin)
const gestures = new MouseGestures({ doubleClickMs: 300 })

parser.onMouse((event) => {
    const synthesized = gestures.feed(event)
    for (const e of synthesized) {
        // e.type is 'dblclick', 'drag', or 'dragend'
        console.log(e.type, e.x, e.y)
    }
})
```

Synthesized event types:

| Type       | When it fires                                                      |
| ---------- | ------------------------------------------------------------------ |
| `dblclick` | Two `mousedown` events at the same position within `doubleClickMs` |
| `drag`     | Every `mousemove` while a button is held                           |
| `dragend`  | The `mouseup` that ends a drag                                     |

## Mouse event modifiers

Raw `MouseEvent` objects now include modifier key state from the SGR escape sequence:

```ts
parser.onMouse((event) => {
    console.log(event.shift, event.alt, event.ctrl)
    // Horizontal scroll: event.scrollAxis === 'horizontal', event.scrollDeltaX
    // Vertical scroll:   event.scrollAxis === 'vertical',   event.scrollDelta
})
```

Horizontal scroll-wheel events are decoded from SGR button bits 6 and 7 and arrive as `type: 'scroll'` with `scrollAxis: 'horizontal'` and a `scrollDeltaX` of `-1` or `1`.

## Key chords

`ChordMatcher` lets you bind multi-key sequences, similar to vim-style bindings. Create one instance, bind sequences, then feed each `KeyEvent` to it:

```ts

const chords = new ChordMatcher({ timeoutMs: 800 })

// Bind 'g g' to jump to the top
const unsub = chords.bind(['g', 'g'], () => {
    scrollToTop()
})

parser.onKey((event) => {
    // Returns true if the event was consumed by a chord
    const consumed = chords.feed(event)
    if (!consumed) handleNormalKey(event)
})

// Remove the binding later
unsub()
```

Chords reset automatically if the next key doesn't match within `timeoutMs` milliseconds (default 800 ms).

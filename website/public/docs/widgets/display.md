# Display Widgets
Display widgets in `@termuijs/widgets` cover text visualization, AI output patterns, and decorative typography.
## StreamingText
Renders text character by character with a typewriter effect. When `NO_MOTION=1`, the full text is shown immediately.
```ts

const widget = new StreamingText(
    {
        text: 'Generating response...',
        speed: 30,                           // characters per second
        cursor: '▋',                         // blinking cursor (ASCII: '_')
        onComplete: () => console.log('done'),
    },
    { flexGrow: 1 }
)
```
| Option       | Type         | Default       | Description                                                                             |
| ------------ | ------------ | ------------- | --------------------------------------------------------------------------------------- |
| `text`       | `string`     | Required      | Text to stream                                                                          |
| `speed`      | `number`     | `40`          | Characters per second                                                                   |
| `cursor`     | `string`     | `'▋'` / `'_'` | Cursor character. Defaults to unicode block or ASCII underscore based on `caps.unicode` |
| `onComplete` | `() => void` | -             | Called when all characters have been rendered                                           |

## ChatMessage
A chat bubble with role-aware styling. Different roles get different colors and alignment:
```ts

const userMsg = new ChatMessage(
    { role: 'user', content: 'How do I sort an array in TypeScript?' },
    { flexGrow: 1 }
)

const assistantMsg = new ChatMessage(
    { role: 'assistant', content: 'Use `.sort()` with a comparator function...' },
    { flexGrow: 1 }
)
```
| Option      | Type                                | Description                                            |
| ----------- | ----------------------------------- | ------------------------------------------------------ |
| `role`      | `'user' \| 'assistant' \| 'system'` | Determines styling and alignment                       |
| `content`   | `string`                            | Message text (supports newlines)                       |
| `timestamp` | `string`                            | Optional timestamp shown in dim text below the message |

Role styling defaults:
- `user`, right-aligned, blue border
- `assistant`, left-aligned, green border
- `system`, centered, dimmed, gray border
## ToolCall
Displays an AI tool/function call with status indicator and collapsible details:
```ts

const widget = new ToolCall(
    {
        name: 'readFile',
        status: 'running',
        args: { path: '/etc/hosts' },
    },
    { flexGrow: 1 }
)

// Update status as the call progresses
widget.setStatus('done')
widget.setResult('127.0.0.1  localhost\n::1        localhost\n')
```
| Option   | Type                                          | Description                                  |
| -------- | --------------------------------------------- | -------------------------------------------- |
| `name`   | `string`                                      | Function/tool name                           |
| `status` | `'pending' \| 'running' \| 'done' \| 'error'` | Current state, drives the status icon        |
| `args`   | `Record`                                      | Arguments, shown in a collapsible section    |
| `result` | `unknown`                                     | Return value, shown after status is `'done'` |

## JSONView
A collapsible, navigable tree for displaying JSON data:
```ts

const widget = new JSONView(
    {
        data: { name: 'Alice', scores: [98, 87, 92], active: true },
        indent: 2,
        onSelect: (path, value) => console.log(path, value),
    },
    { flexGrow: 1 }
)
```
Users can expand/collapse objects and arrays with Enter. `onSelect` fires when a node is focused.
| Option     | Type                                       | Description                          |
| ---------- | ------------------------------------------ | ------------------------------------ |
| `data`     | `unknown`                                  | Any JSON-serializable value          |
| `indent`   | `number`                                   | Spaces per indent level (default: 2) |
| `onSelect` | `(path: string[], value: unknown) => void` | Fires when a node is selected        |

## DiffView
Renders a unified diff with colored `+` / `-` lines:
```ts

const lines: DiffLine[] = [
    { type: 'context', content: '  function greet(name: string) {' },
    { type: 'remove',  content: '    return "Hello " + name' },
    { type: 'add',     content: '    return `Hello, ${name}!`' },
    { type: 'context', content: '  }' },
]

const widget = new DiffView({ lines }, { flexGrow: 1 })
```
Or pass a raw unified diff string, use the `diffView()` quick builder which parses it automatically:
```ts

const w = diffView('+ added line\n- removed line\n  unchanged')
```
## BigText
Large ASCII art banner text using a built-in 5×3 character map. No external dependencies:
```ts

const banner = new BigText('HELLO', { flexGrow: 1 }, {
    color: { type: 'named', name: 'cyan' },
})
```
Supports uppercase A–Z, digits 0–9, and common punctuation. Unsupported characters are skipped.

| Option  | Type    | Description                      |
| ------- | ------- | -------------------------------- |
| `color` | `Color` | Color of the rendered characters |

## Gradient
Renders text with a smooth color gradient applied per character. Uses ANSI 256-color interpolation:
```ts

const header = new Gradient('Terminal Dashboard',
    { flexGrow: 1 },
    { startColor: '#ff6b6b', endColor: '#4ecdc4', align: 'center' }
)
```
| Option       | Type                            | Default     | Description                        |
| ------------ | ------------------------------- | ----------- | ---------------------------------- |
| `startColor` | `string`                        | `'#ff0000'` | Hex color at the start of the text |
| `endColor`   | `string`                        | `'#0000ff'` | Hex color at the end of the text   |
| `align`      | `'left' \| 'center' \| 'right'` | `'left'`    | Text alignment                     |

Gradient degrades gracefully in terminals without 256-color support, it falls back to the nearest available color.

## Markdown
Renders a Markdown string as formatted terminal output with bold, italic, inline code, and block-level elements.

| Prop | Type | Description |
|------|------|-------------|
| `content` | `string` | Markdown source to render |
| `width` | `number` | Maximum line width for wrapping |

```tsx

const widget = new Markdown({ flexGrow: 1 }, { content: '# Hello\n\nThis is **bold** text.' })
```

## Code
Displays a fenced code block with optional syntax label and line numbers.

| Prop | Type | Description |
|------|------|-------------|
| `source` | `string` | Code text to display |
| `language` | `string` | Language label shown in the header |
| `lineNumbers` | `boolean` | Show line numbers on the left |

```tsx

const widget = new Code({ flexGrow: 1 }, {
    source: 'const x = 1',
    language: 'typescript',
    lineNumbers: true,
})
```

## Highlight
Renders a string with specific substrings highlighted in a contrasting color, for search-result emphasis.

| Prop | Type | Description |
|------|------|-------------|
| `text` | `string` | Full text to display |
| `query` | `string` | Substring to highlight |
| `color` | `Color` | Color applied to matched ranges |

```tsx

const widget = new Highlight({ flexGrow: 1 }, { text: 'Hello world', query: 'world' })
```

## Typewriter
Streams text character by character with a configurable delay. Respects `NO_MOTION`, shows the full string immediately when motion is disabled.

| Prop | Type | Description |
|------|------|-------------|
| `text` | `string` | Text to animate |
| `delayMs` | `number` | Milliseconds per character |
| `onComplete` | `() => void` | Called when animation finishes |

```tsx

const widget = new Typewriter({ flexGrow: 1 }, { text: 'Loading...', delayMs: 40 })
```

## Digits
Renders a number as large ASCII art digits. Useful for clocks and counters.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string \| number` | Value to render |
| `color` | `Color` | Color of the digit segments |

```tsx

const widget = new Digits({ height: 5 }, { value: '12:34', color: { type: 'named', name: 'cyan' } })
```

## Marquee
Scrolls text horizontally in a loop. Respects `NO_MOTION`, shows the text static when motion is disabled.

| Prop | Type | Description |
|------|------|-------------|
| `text` | `string` | Text to scroll |
| `speed` | `number` | Columns per second |

```tsx

const widget = new Marquee({ height: 1, flexGrow: 1 }, { text: 'Breaking news: TermUI v0.1.6 released', speed: 8 })
```

## Callout
A bordered block for drawing attention to a note, warning, or tip.

| Prop | Type | Description |
|------|------|-------------|
| `message` | `string` | Text inside the callout |
| `variant` | `'info' \| 'warning' \| 'error' \| 'tip'` | Sets the icon and border color |

```tsx

const widget = new Callout({ flexGrow: 1 }, { message: 'Run with --debug for verbose output.', variant: 'tip' })
```

## Kbd
Renders a keyboard key in a bordered box, like `⌘K` or `Ctrl+S`.

| Prop | Type | Description |
|------|------|-------------|
| `keys` | `string[]` | Key labels to render |

```tsx

const widget = new Kbd({}, { keys: ['Ctrl', 'S'] })
```

## Hexdump
Displays raw binary data as a hex dump with offset, hex bytes, and ASCII columns.

| Prop | Type | Description |
|------|------|-------------|
| `data` | `Uint8Array \| Buffer` | Binary data to display |
| `bytesPerRow` | `number` | Bytes per row (default: 16) |

```tsx

const widget = new Hexdump({ flexGrow: 1 }, { data: Buffer.from('Hello, TermUI!') })
```

## Stat
Shows a single metric with a label and optional delta indicator.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Metric name |
| `value` | `string \| number` | Current value |
| `delta` | `string` | Optional change string, e.g. `'+12%'` |

```tsx

const widget = new Stat({}, { label: 'Requests', value: '4,821', delta: '+8%' })
```

## Avatar
Renders a user avatar as initials or a small pixel art block in the terminal.

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Name used to derive initials |
| `color` | `Color` | Background color |

```tsx

const widget = new Avatar({}, { name: 'Alice B', color: { type: 'named', name: 'blue' } })
```

## Badge
A compact inline label with a colored background, for status tags or counts.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Text inside the badge |
| `color` | `Color` | Background color |

```tsx

const widget = new Badge({}, { label: 'NEW', color: { type: 'named', name: 'green' } })
```

## Tag
A bordered inline label, similar to Badge but uses a border instead of a filled background.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Text inside the tag |
| `color` | `Color` | Border and text color |

```tsx

const widget = new Tag({}, { label: 'v0.1.6', color: { type: 'named', name: 'cyan' } })
```

## EmptyState
A centered placeholder shown when a list or view has no content.

| Prop | Type | Description |
|------|------|-------------|
| `message` | `string` | Primary message |
| `hint` | `string` | Secondary hint text |

```tsx

const widget = new EmptyState({ flexGrow: 1 }, { message: 'No results found', hint: 'Try a different search term.' })
```

## Placeholder
A fixed-size box with a label, used as a layout placeholder during development.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Text shown inside the box |

```tsx

const widget = new Placeholder({ width: 20, height: 5 }, { label: 'Chart goes here' })
```

## Watermark
Renders a faint watermark text centered in its container.

| Prop | Type | Description |
|------|------|-------------|
| `text` | `string` | Watermark text |

```tsx

const widget = new Watermark({ flexGrow: 1 }, { text: 'DRAFT' })
```

## See also

- [Layout Widgets](/docs/widgets/layout), Card, ScrollView, Sidebar for structuring content
- [Chart Widgets](/docs/widgets/charts), LineChart, HeatMap, BarChart
- [quick builders](/docs/guides/quick), `chatMessage()`, `toolCall()`, `streamingText()`, `jsonView()`, `diffView()`

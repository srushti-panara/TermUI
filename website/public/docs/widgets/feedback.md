# Feedback Widgets
Feedback widgets communicate loading state, progress, and user action availability.

All feedback widgets respect `caps.motion` (disables animations when `NO_MOTION=1`) and `caps.unicode` (uses ASCII characters when `NO_UNICODE=1`).
## Spinner
An animated indicator for indeterminate operations:
```ts

const spin = new Spinner({ height: 1 }, {
    label: 'Connecting to database...',
    color: { type: 'named', name: 'cyan' },
})
spin.mount()   // start animation
// ...later:
spin.unmount() // stop animation
```
When `NO_MOTION=1`, the spinner shows a static character instead of animating.
| Option   | Type       | Default         | Description                                                              |
| -------- | ---------- | --------------- | ------------------------------------------------------------------------ |
| `label`  | `string`   | -               | Text shown next to the spinner                                           |
| `color`  | `Color`    | white           | Spinner character color                                                  |
| `frames` | `string[]` | Unicode braille | Custom animation frames. Falls back to ASCII `|/-\` when `NO_UNICODE=1`. |

## ProgressBar
A determinate progress bar, use when you know the total:
```ts

const bar = new ProgressBar(
    { height: 1, flexGrow: 1 },
    {
        value: 0.0,
        fillColor: { type: 'named', name: 'green' },
        showLabel: true,
    }
)

// Update progress as work completes
bar.setValue(0.42)   // 42%
bar.setValue(1.0)    // done
```
| Option       | Type      | Default     | Description                  |
| ------------ | --------- | ----------- | ---------------------------- |
| `value`      | `number`  | `0`         | Progress 0.0–1.0             |
| `fillColor`  | `Color`   | green       | Filled portion color         |
| `emptyColor` | `Color`   | brightBlack | Empty portion color          |
| `showLabel`  | `boolean` | `true`      | Show percentage on the right |

Fill characters: `█` / `░` (unicode) → `#` / `.` (ASCII when `NO_UNICODE=1`).
## Skeleton
An animated loading placeholder, use while content is loading asynchronously:
```ts

const placeholder = new Skeleton({ flexGrow: 1, height: 3 }, {
    variant: 'shimmer',
    intervalMs: 80,
    color: { type: 'named', name: 'brightBlack' },
})
```
Two variants:
- `'pulse'`, alternates between two brightness levels
- `'shimmer'`, a moving highlight sweeps left to right

When `NO_MOTION=1`, skeleton renders as a static dimmed block.
| Option       | Type                   | Default     | Description              |
| ------------ | ---------------------- | ----------- | ------------------------ |
| `variant`    | `'pulse' \| 'shimmer'` | `'shimmer'` | Animation style          |
| `intervalMs` | `number`               | `100`       | Animation frame interval |
| `color`      | `Color`                | brightBlack | Base skeleton color      |

## MultiProgress
Multiple labeled progress bars in a single widget, useful for parallel downloads, batch operations, or multi-step processes:
```ts

const items: ProgressItem[] = [
    { label: 'Downloading assets', value: 0.72, color: { type: 'named', name: 'cyan' } },
    { label: 'Building bundle',    value: 0.31 },
    { label: 'Running tests',      value: 0.0,  color: { type: 'named', name: 'yellow' } },
]

const multi = new MultiProgress({ items }, { flexGrow: 1 })

// Update individual bars
items[0].value = 0.95
multi.setItems(items)
```
`ProgressItem`: `{ label: string, value: number, color?: Color }`
## CommandPalette
A searchable, filterable list of commands triggered by keyboard shortcut:
```ts

const commands: Command[] = [
    { id: 'new',     label: 'New File',        action: () => newFile() },
    { id: 'open',    label: 'Open File...',     action: () => openPicker() },
    { id: 'save',    label: 'Save',             action: () => save() },
    { id: 'search',  label: 'Find in Files',    action: () => openSearch(), description: 'Ctrl+Shift+F' },
    { id: 'theme',   label: 'Change Theme',     action: () => openThemePicker() },
]

const palette = new CommandPalette({ commands }, { flexGrow: 1 })
```
The palette shows a text filter at the top; typing narrows the list. Enter selects the highlighted command.

`Command`: `{ id: string, label: string, action: () => void, description?: string }`

## ProgressCircle
An arc-based circular progress indicator for determinate progress.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number` | Progress from 0.0 to 1.0 |
| `size` | `number` | Diameter in character rows |
| `color` | `Color` | Color of the filled arc |

```tsx

const widget = new ProgressCircle({ width: 7, height: 4 }, { value: 0.72, color: { type: 'named', name: 'cyan' } })
```

## ProgressString
Renders progress as a compact text string like `[=====>    ] 54%`.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number` | Progress from 0.0 to 1.0 |
| `width` | `number` | Total character width of the string |

```tsx

const widget = new ProgressString({ height: 1 }, { value: 0.54, width: 20 })
```

## LoadingDots
An animated ellipsis `...` that cycles dot count. Respects `NO_MOTION`.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Text shown before the dots |
| `intervalMs` | `number` | Animation tick interval in milliseconds |

```tsx

const widget = new LoadingDots({ height: 1 }, { label: 'Fetching data', intervalMs: 400 })
```

## Stepper
Displays a sequence of named steps with indicators for completed, current, and pending states.

| Prop | Type | Description |
|------|------|-------------|
| `steps` | `string[]` | Step labels in order |
| `current` | `number` | Index of the active step |
| `direction` | `'horizontal' \| 'vertical'` | Layout axis |

```tsx

const widget = new Stepper({ flexGrow: 1 }, {
    steps: ['Install', 'Configure', 'Deploy'],
    current: 1,
})
```

## Timer
Shows an elapsed or countdown time, updating every second.

| Prop | Type | Description |
|------|------|-------------|
| `mode` | `'stopwatch' \| 'countdown'` | Count up or count down |
| `durationMs` | `number` | Countdown target in milliseconds (countdown mode only) |
| `onComplete` | `() => void` | Called when a countdown reaches zero |

```tsx

const widget = new Timer({ height: 1 }, { mode: 'stopwatch' })
widget.start()
```

## Clock
Displays the current local time, updating every second.

| Prop | Type | Description |
|------|------|-------------|
| `format` | `string` | Time format string, e.g. `'HH:mm:ss'` |

```tsx

const widget = new Clock({ height: 1 }, { format: 'HH:mm:ss' })
```

## Meter
A horizontal gauge that fills proportionally to a value, with optional threshold coloring.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number` | Current value |
| `max` | `number` | Maximum value |
| `label` | `string` | Label shown beside the meter |
| `thresholds` | `Array<{ at: number, color: Color }>` | Color changes at given values |

```tsx

const widget = new Meter({ flexGrow: 1 }, {
    value: 72,
    max: 100,
    label: 'CPU',
    thresholds: [{ at: 80, color: { type: 'named', name: 'red' } }],
})
```

## NotificationBadge
A small badge overlaid on a parent widget to show a count or status dot.

| Prop | Type | Description |
|------|------|-------------|
| `count` | `number` | Number to display; hidden when 0 |
| `color` | `Color` | Badge background color |

```tsx

const widget = new NotificationBadge({}, { count: 3, color: { type: 'named', name: 'red' } })
```

## Tooltip
Shows a text tooltip when the widget has focus.

| Prop | Type | Description |
|------|------|-------------|
| `text` | `string` | Tooltip content |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | Where the tooltip appears |

```tsx

const widget = new Tooltip({}, { text: 'Press Enter to confirm', position: 'bottom' })
widget.addChild(confirmButton)
```

## ShortcutBar
Renders a row of labeled keyboard shortcuts at the bottom of the screen, similar to nano's help bar.

| Prop | Type | Description |
|------|------|-------------|
| `shortcuts` | `Array<{ key: string, label: string }>` | Shortcuts to display |

```tsx

const widget = new ShortcutBar({ height: 1, flexGrow: 1 }, {
    shortcuts: [
        { key: '^X', label: 'Exit' },
        { key: '^S', label: 'Save' },
        { key: '?', label: 'Help' },
    ],
})
```

## TaskList
Renders a list of tasks with done, pending, and in-progress states.

| Prop | Type | Description |
|------|------|-------------|
| `tasks` | `Array<{ label: string, status: 'pending' \| 'running' \| 'done' \| 'error' }>` | Task definitions |

```tsx

const widget = new TaskList({ flexGrow: 1 }, {
    tasks: [
        { label: 'Install dependencies', status: 'done' },
        { label: 'Build project', status: 'running' },
        { label: 'Run tests', status: 'pending' },
    ],
})
```

## Timeline
Displays a vertical list of timestamped events in chronological order.

| Prop | Type | Description |
|------|------|-------------|
| `events` | `Array<{ time: string, label: string, detail?: string }>` | Events to display |

```tsx

const widget = new Timeline({ flexGrow: 1 }, {
    events: [
        { time: '09:00', label: 'Deploy started' },
        { time: '09:04', label: 'Tests passed' },
        { time: '09:07', label: 'Deploy complete', detail: 'v0.1.6 live' },
    ],
})
```

## ThinkingBlock
Renders a collapsible "thinking" section for AI responses, with an animated indicator while content streams in.

| Prop | Type | Description |
|------|------|-------------|
| `content` | `string` | Reasoning text to display |
| `loading` | `boolean` | Show animated indicator instead of content |

```tsx

const widget = new ThinkingBlock({ flexGrow: 1 }, { content: '', loading: true })
// When the model finishes thinking:
widget.setContent(thinkingText)
widget.setLoading(false)
```

## See also

- [Layout Widgets](/docs/widgets/layout), Banner and StatusMessage for alerts
- [useAsync](/docs/jsx/use-async), combine with Skeleton for async data loading
- [Accessibility & caps flags](/docs/guides/accessibility), how all feedback widgets adapt to NO_MOTION and NO_UNICODE

# Layout Widgets
Layout widgets in `@termuijs/widgets` handle structural concerns, grouping, scrolling, centering, and status display.
## Card
A bordered container with an optional title embedded in the top border:
```ts

const card = new Card({ flexGrow: 1 }, { title: 'System Status' })
card.addChild(new Text('CPU: 42%', {}))
card.addChild(new Text('MEM: 58%', {}))
```
| Option        | Type     | Description                                |
| ------------- | -------- | ------------------------------------------ |
| `title`       | `string` | Text shown centered in the top border line |
| `borderColor` | `Color`  | Color of the border and title text         |

Card always has `border: 'single'` and `padding: 1` by default. Pass overrides in the style argument.
## ScrollView
A vertically scrollable container. Content that overflows the height can be scrolled with arrow keys:
```ts

const scroll = new ScrollView({ height: 20, flexGrow: 1 }, { scrollbar: true })
for (const line of logLines) {
    scroll.addChild(new Text(line, {}))
}
```
| Option      | Type      | Default | Description                        |
| ----------- | --------- | ------- | ---------------------------------- |
| `scrollbar` | `boolean` | `true`  | Show a scrollbar on the right edge |

**Keyboard:** `↑`/`↓` scroll one line; `PageUp`/`PageDown` scroll by half the visible height; `Home`/`End` jump to top/bottom.
## Center
Centers a single child widget within its available space:
```ts

const centered = new Center({ flexGrow: 1 }, {})
centered.addChild(new Text('Loading...', { bold: true }))
```
| Option | Type                   | Default  | Description             |
| ------ | ---------------------- | -------- | ----------------------- |
| `axis` | `'x' \| 'y' \| 'both'` | `'both'` | Which axes to center on |

## Columns
Evenly-split column layout from an array of widgets:
```ts

const cols = new Columns({ flexGrow: 1 }, { gap: 1 })
cols.addChildren([cpuGauge, memGauge, diskGauge, netGauge])
```
| Option | Type     | Default | Description              |
| ------ | -------- | ------- | ------------------------ |
| `gap`  | `number` | `0`     | Column gap in characters |

Each child gets an equal share of the available width. For unequal columns, use the `row` intrinsic with explicit `flexGrow` values.
## Sidebar
A navigable sidebar with items, optional badges, and active item highlighting:
```ts

const sidebar = new Sidebar({ width: 20 }, {
    items: [
        { id: 'dashboard', label: 'Dashboard', badge: '3' },
        { id: 'logs',      label: 'Logs' },
        { id: 'settings',  label: 'Settings' },
    ],
    activeId: 'dashboard',
    onSelect: (id) => navigate(id),
})
```
| Option      | Type                   | Description                                   |
| ----------- | ---------------------- | --------------------------------------------- |
| `items`     | `SidebarItem[]`        | List of navigation items                      |
| `activeId`  | `string`               | ID of the currently active item (highlighted) |
| `onSelect`  | `(id: string) => void` | Called when an item is selected with Enter    |
| `collapsed` | `boolean`              | Show only icons/initials (narrow mode)        |

`SidebarItem`: `{ id: string, label: string, badge?: string, icon?: string }`

**Keyboard:** `↑`/`↓` to navigate, `Enter` to select.
## KeyValue
Aligned key–value pairs, left-padded so all values line up in a column:
```ts

const info = new KeyValue({ flexGrow: 1 }, {
    data: {
        'Node version': process.version,
        'Platform':     process.platform,
        'Arch':         process.arch,
        'PID':          String(process.pid),
    },
    separator: ' : ',
})
```
| Option       | Type     | Default  | Description                  |
| ------------ | -------- | -------- | ---------------------------- |
| `data`       | `Record` | Required | Key–value pairs to display   |
| `separator`  | `string` | `' : '`  | String between key and value |
| `keyColor`   | `Color`  | -        | Color for the key column     |
| `valueColor` | `Color`  | -        | Color for the value column   |

## Definition
Term + definition stacked pairs, like a glossary or CLI man-page style reference:
```ts

const glossary = new Definition({ flexGrow: 1 }, {
    items: [
        { term: 'TUI', definition: 'Terminal User Interface — an interactive app that runs inside a terminal emulator.' },
        { term: 'Fiber', definition: 'Internal reconciler node tracking component state and hook calls.' },
    ],
})
```
Each term is rendered bold; the definition follows on the next line, indented.
## Banner
A full-width alert with a title and optional body text:
```ts

const alert = new Banner({ flexGrow: 1 }, {
    title: 'Deployment Failed',
    message: 'Build step exited with code 1. Check the logs for details.',
    variant: 'error',
})
```
| Option    | Type                                          | Description          |
| --------- | --------------------------------------------- | -------------------- |
| `title`   | `string`                                      | Bold header line     |
| `message` | `string`                                      | Body text (optional) |
| `variant` | `'info' \| 'success' \| 'warning' \| 'error'` | Sets border color    |

## StatusMessage
Compact single-line status with an icon and a message:
```ts

const msg = new StatusMessage({ height: 1 }, {
    message: 'Connected to database',
    variant: 'success',
})
```
Icons: `✓` / `[+]` for success, `✗` / `[x]` for error, `⚠` / `[!]` for warning, `ℹ` / `[i]` for info. ASCII fallbacks activate when `NO_UNICODE=1`.

## SplitPane
Divides its container into two resizable panes separated by a draggable divider.

| Prop | Type | Description |
|------|------|-------------|
| `direction` | `'horizontal' \| 'vertical'` | Axis of the split |
| `initialRatio` | `number` | Initial size of the first pane as a fraction of total (0–1) |
| `minSize` | `number` | Minimum size in characters for either pane |

```tsx

const pane = new SplitPane({ flexGrow: 1 }, { direction: 'horizontal', initialRatio: 0.3 })
pane.addChild(sidebar)
pane.addChild(mainContent)
```

## Stack
A flex container that lays out children in a single direction with optional gap and alignment.

| Prop | Type | Description |
|------|------|-------------|
| `direction` | `'row' \| 'column'` | Layout axis |
| `gap` | `number` | Space between children in characters |
| `align` | `'start' \| 'center' \| 'end'` | Cross-axis alignment |

```tsx

const stack = new Stack({ flexGrow: 1 }, { direction: 'column', gap: 1 })
stack.addChildren([header, body, footer])
```

## Masonry
Arranges children in a multi-column grid, filling columns from top to bottom.

| Prop | Type | Description |
|------|------|-------------|
| `columns` | `number` | Number of columns |
| `gap` | `number` | Gap between items in characters |

```tsx

const grid = new Masonry({ flexGrow: 1 }, { columns: 3, gap: 1 })
cards.forEach(c => grid.addChild(c))
```

## Fill
Fills its container with a repeated character or color, useful as a background layer.

| Prop | Type | Description |
|------|------|-------------|
| `char` | `string` | Character to fill with (default: space) |
| `color` | `Color` | Background fill color |

```tsx

const bg = new Fill({ flexGrow: 1 }, { char: '·', color: { type: 'named', name: 'brightBlack' } })
```

## AspectRatio
Constrains a child to a fixed aspect ratio, padding the remaining space.

| Prop | Type | Description |
|------|------|-------------|
| `ratio` | `number` | Width-to-height ratio, e.g. `2` for 2:1 |

```tsx

const frame = new AspectRatio({ flexGrow: 1 }, { ratio: 2 })
frame.addChild(preview)
```

## Dock
Pins child widgets to edges (top, bottom, left, right) while a central content area fills the rest.

| Prop | Type | Description |
|------|------|-------------|
| `top` | `Widget` | Widget docked to the top edge |
| `bottom` | `Widget` | Widget docked to the bottom edge |
| `left` | `Widget` | Widget docked to the left edge |
| `right` | `Widget` | Widget docked to the right edge |

```tsx

const layout = new Dock({ flexGrow: 1 }, { top: menuBar, bottom: statusBar })
layout.addChild(editorPane)
```

## Accordion
Groups multiple collapsible sections under labeled headers. Only one section is open at a time by default.

| Prop | Type | Description |
|------|------|-------------|
| `sections` | `AccordionSection[]` | Array of `{ title, content }` objects |
| `multiple` | `boolean` | Allow multiple sections open simultaneously |

```tsx

const widget = new Accordion({ flexGrow: 1 }, {
    sections: [
        { title: 'General', content: generalWidget },
        { title: 'Advanced', content: advancedWidget },
    ],
})
```

## Collapsible
A single collapsible section with a toggle header. Press Enter or Space to expand or collapse.

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Header text |
| `open` | `boolean` | Initial open state |
| `onToggle` | `(open: boolean) => void` | Called when the open state changes |

```tsx

const widget = new Collapsible({ flexGrow: 1 }, { title: 'Details', open: false })
widget.addChild(detailsWidget)
```

## Carousel
Displays one child at a time and lets the user cycle through them with arrow keys.

| Prop | Type | Description |
|------|------|-------------|
| `loop` | `boolean` | Wrap around from last to first slide |
| `showIndicator` | `boolean` | Show dot indicator below slides |

```tsx

const slides = new Carousel({ flexGrow: 1 }, { loop: true, showIndicator: true })
slides.addChildren([slide1, slide2, slide3])
```

## See also

- [Display Widgets](/docs/widgets/display), StreamingText, ChatMessage, BigText, Gradient
- [Chart Widgets](/docs/widgets/charts), LineChart, HeatMap, BarChart
- [Feedback Widgets](/docs/widgets/feedback), Spinner, ProgressBar, Skeleton, MultiProgress

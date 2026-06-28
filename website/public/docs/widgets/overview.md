# Widgets Overview
`@termuijs/widgets` gives you the building blocks for terminal UIs. Every widget extends the base `Widget`  class, manages its own render rectangle, and only repaints when something actually changes.
## Installation
```ts
npm install @termuijs/widgets
```
## All Widgets
| Widget              | Category | Description                                                          |
| ------------------- | -------- | -------------------------------------------------------------------- |
| `Box`               | Display  | Container with borders, padding, and flex layout                     |
| `Text`              | Display  | Styled text with color, bold, italic, dim, underline                 |
| `LogView`           | Display  | Scrollable log panel with auto-scroll and max buffer                 |
| `Tree`              | Display  | Collapsible tree for hierarchical data                               |
| `JSONView`          | Display  | Collapsible, navigable JSON tree viewer                              |
| `DiffView`          | Display  | Unified diff viewer with colored +/- lines                           |
| `StreamingText`     | Display  | Typewriter effect with configurable speed and cursor                 |
| `ChatMessage`       | Display  | Chat bubble with role-aware styling (user/assistant/system)          |
| `ToolCall`          | Display  | AI tool call display with status and collapsible args/result         |
| `BigText`           | Display  | Large ASCII art banner text, no external deps                        |
| `Gradient`          | Display  | Text with per-character 256-color gradient                           |
| `Markdown`          | Display  | Renders Markdown text with headings, bold, and code blocks           |
| `Code`              | Display  | Syntax-highlighted code block                                        |
| `Highlight`         | Display  | Inline text with highlight spans                                     |
| `Typewriter`        | Display  | Animated character-by-character text reveal                          |
| `Digits`            | Display  | Large ASCII-art digit display                                        |
| `Marquee`           | Display  | Horizontally scrolling text ticker                                   |
| `Callout`           | Display  | Styled callout block with icon and variant                           |
| `Kbd`               | Display  | Keyboard shortcut badge                                              |
| `Table`             | Data     | Data table with column alignment and headers                         |
| `Gauge`             | Data     | Percentage indicator with label and color thresholds                 |
| `Sparkline`         | Data     | Inline bar chart for time-series data                                |
| `BarChart`          | Data     | Horizontal or vertical bar chart with groups                         |
| `LineChart`         | Data     | ASCII line plot of a single series with optional X/Y axes            |
| `HeatMap`           | Data     | 2D matrix with color-scale shading and row/col labels                |
| `KeyValue`          | Data     | Aligned key–value pairs with configurable separator                  |
| `Definition`        | Data     | Term (bold) + definition stacked pairs                               |
| `StatusIndicator`   | Data     | Up/down status dot with label (green when up, red when down)         |
| `DataGrid`          | Data     | 2D-virtualized grid with sorting and filtering                       |
| `StackedBarChart`   | Data     | Stacked bar chart with series labels                                 |
| `Histogram`         | Data     | Frequency distribution chart                                         |
| `PieChart`          | Data     | Pie chart with labeled slices and a legend                           |
| `BulletChart`       | Data     | Bullet chart for performance-against-target display                  |
| `CandlestickChart`  | Data     | OHLC candlestick chart for financial data                            |
| `AreaChart`         | Data     | Filled area chart for time-series data                               |
| `ScatterPlot`       | Data     | XY scatter plot with configurable dot markers                        |
| `RadarChart`        | Data     | Spider/radar chart for multi-axis comparison                         |
| `GanttChart`        | Data     | Timeline chart for task and schedule display                         |
| `BrailleCanvas`     | Data     | High-resolution canvas using Unicode Braille characters              |
| `Stat`              | Data     | Large single metric with label and optional delta                    |
| `Hexdump`           | Data     | Hex + ASCII dump viewer for binary data                              |
| `TreeTable`         | Data     | Collapsible tree with sortable table columns                         |
| `Card`              | Layout   | Bordered container with optional title in the border                 |
| `ScrollView`        | Layout   | Height-bounded scrollable container with arrow-key navigation        |
| `Center`            | Layout   | Centers a single child horizontally, vertically, or both             |
| `Columns`           | Layout   | Evenly-split column layout from an array of widgets                  |
| `Grid`              | Layout   | CSS-grid-like layout: items flow left-to-right, wrap every N columns |
| `Sidebar`           | Layout   | Navigable sidebar with items, badges, and active highlight           |
| `Banner`            | Layout   | Full-width alert with title, body, and variant color                 |
| `StatusMessage`     | Layout   | Compact single-line status with icon and variant color               |
| `SplitPane`         | Layout   | Resizable split pane - horizontal or vertical                        |
| `Stack`             | Layout   | Evenly-spaced vertical or horizontal stack                           |
| `Masonry`           | Layout   | Variable-height masonry column layout                                |
| `Fill`              | Layout   | Fills remaining space in a flex container                            |
| `Rule`              | Layout   | Full-width horizontal or vertical rule with optional label           |
| `Divider`           | Layout   | Section separator - horizontal or vertical                           |
| `AspectRatio`       | Layout   | Constrains a child widget to a fixed aspect ratio                    |
| `DirectoryTree`     | Layout   | File system tree with icons and expand/collapse                      |
| `ProgressBar`       | Feedback | Horizontal progress indicator with customizable fill                 |
| `Spinner`           | Feedback | Animated loading spinner - respects NO_MOTION                        |
| `Skeleton`          | Feedback | Animated loading placeholder (pulse/shimmer)                         |
| `MultiProgress`     | Feedback | Multiple labeled progress bars in one widget                         |
| `CommandPalette`    | Feedback | Searchable, filterable command menu                                  |
| `Scrollbar`         | Feedback | Standalone scrollbar indicator (vertical or horizontal)              |
| `ProgressCircle`    | Feedback | Circular progress ring with percentage label                         |
| `LoadingDots`       | Feedback | Animated ellipsis loading indicator                                  |
| `Stepper`           | Feedback | Step-by-step progress display for sequential tasks                   |
| `Timer`             | Feedback | Countdown or elapsed time display                                    |
| `Clock`             | Feedback | Live clock display                                                   |
| `Meter`             | Feedback | Compact level meter with configurable thresholds                     |
| `NotificationBadge` | Feedback | Numeric badge overlaid on another widget                             |
| `Badge`             | Feedback | Inline status badge with variant color                               |
| `Tag`               | Feedback | Compact label tag with optional close action                         |
| `EmptyState`        | Feedback | Placeholder shown when a list or view has no content                 |
| `Placeholder`       | Feedback | Generic placeholder box for layout scaffolding                       |
| `Tooltip`           | Feedback | Hover or focus-triggered tooltip overlay                             |
| `ShortcutBar`       | Feedback | Bottom bar listing active keyboard shortcuts                         |
| `TaskList`          | Feedback | Checklist with status icons per item                                 |
| `Timeline`          | Feedback | Vertical event timeline with timestamps and labels                   |
| `Carousel`          | Feedback | Horizontally paged display widget                                    |
| `Watermark`         | Feedback | Background text watermark for overlays                               |
| `Avatar`            | Feedback | User avatar with initials or image fallback                          |
| `Collapsible`       | Feedback | Toggle-able collapsible content section                              |
| `Accordion`         | Feedback | Grouped collapsible sections with single-open mode                   |
| `ThinkingBlock`     | Feedback | Animated thinking indicator for AI streaming                         |
| `List`              | Input    | Keyboard-navigable list for small datasets                           |
| `TextInput`         | Input    | Single-line text input with cursor and placeholder                   |
| `VirtualList`       | Input    | Scroll-virtualized list; renders only visible rows, any dataset size |
| `RangeInput`        | Input    | Dual-handle range slider for selecting a min/max value               |
| `Knob`              | Input    | Circular dial for numeric value input                                |
| `PinInput`          | Input    | Discrete code entry for PINs and OTPs                                |
| `Calendar`          | Input    | Month calendar with keyboard date selection                          |
| `Canvas`            | Input    | 2D drawing canvas with pixel-level control                           |
| `Pty`               | Input    | Terminal multiplexer widget for embedded PTY sessions                |
| `OrderedList`       | Display  | Numbered list with configurable markers                              |
| `Dock`              | Layout   | Edge-anchored dock bar for persistent widget placement               |
## Quick Example
Build a simple dashboard by composing widgets and passing the root to `App`:
```ts

// Create widgets
const title = new Text('Dashboard', { bold: true, fg: 'cyan' })
const spinner = new Spinner({}, { preset: 'dots', color: { type: 'named', name: 'green' } })
const loadingText = new Text('Loading data...')
const cpuLabel = new Text('CPU Usage')
const cpuBar = new ProgressBar({ width: 30 }, { value: 0.73, fillColor: { type: 'named', name: 'green' } })

// Compose layout
const row = new Box({ flexDirection: 'row', gap: 2 })
row.addChild(spinner)
row.addChild(loadingText)

const column = new Box({ flexDirection: 'column', gap: 1 })
column.addChild(cpuLabel)
column.addChild(cpuBar)

const root = new Box({ border: 'round', padding: 1, flexDirection: 'column', gap: 1 })
root.addChild(title)
root.addChild(row)
root.addChild(column)

// Mount
const app = new App(root, { fullscreen: true })
await app.mount()
// ╭──────────────────────────────────╮
// │ Dashboard                        │
// │ ⠋ Loading data...               │
// │ CPU Usage                        │
// │ ████████████████████░░░░░ 73%    │
// ╰──────────────────────────────────╯
```
## VirtualList: handle any dataset size
`VirtualList` renders only the rows visible in the viewport. A list of 1,000,000 items renders as fast as a list of 10.
```ts

const list = new VirtualList({
    totalItems: 1_000_000,
    renderItem: (index) => `Log line \${index}: some message content`,
    onSelect:   (index) => console.log('Selected:', index),
})

const app = new App(list, { fullscreen: true })
app.events.on('key', (e) => {
    if (e.key === 'up')    list.selectPrev()
    if (e.key === 'down')  list.selectNext()
    if (e.key === 'enter') list.confirm()
    if (e.key === 'home')  list.selectFirst()
    if (e.key === 'end')   list.selectLast()
})
await app.mount()

// Handles 1M items. renders ~26 rows with scrollbar
```
## Common Patterns
### Status Dashboard
```ts

// Build a status row. Second arg is the up/down flag.
const apiStatus = new StatusIndicator('API', true)
const dbStatus = new StatusIndicator('DB', true)
const cacheStatus = new StatusIndicator('Cache', false)

const statusRow = new Box({ flexDirection: 'row', gap: 4 })
statusRow.addChild(apiStatus)
statusRow.addChild(dbStatus)
statusRow.addChild(cacheStatus)

// Resource gauges
const cpuBar = new ProgressBar({ width: 40 }, { value: 0.72, fillColor: { type: 'named', name: 'green' } })
const memBar = new ProgressBar({ width: 40 }, { value: 0.58, fillColor: { type: 'named', name: 'cyan' } })
const diskGauge = new Gauge('Disk')
diskGauge.setValue(0.45)

const panel = new Box({ flexDirection: 'column', gap: 1 })
panel.addChild(statusRow)
panel.addChild(new Text('Resource Usage', { dim: true }))
panel.addChild(cpuBar)
panel.addChild(memBar)
panel.addChild(diskGauge)
```
### Log Viewer
```ts

const logs = new LogView({
    maxLines: 1000,
    autoScroll: true,
})

logs.append({ text: '[INFO]  Server started', color: 'green' })
logs.append({ text: '[WARN]  Memory usage high', color: 'yellow' })
logs.append({ text: '[ERROR] Connection reset', color: 'red' })
```
### Data Table
```ts

const table = new Table({
    columns: [
{ key: 'pid',  header: 'PID',     width: 8  },
{ key: 'name', header: 'Process',  width: 20 },
{ key: 'cpu',  header: 'CPU%',     width: 8, align: 'right' },
{ key: 'mem',  header: 'Memory',   width: 10 },
    ],
    rows: processes,
})
```
## See also

- [Display Widgets](/docs/widgets/display) - StreamingText, ChatMessage, ToolCall, JSONView, DiffView, BigText, Gradient
- [Layout Widgets](/docs/widgets/layout) - Card, ScrollView, Center, Columns, Sidebar, KeyValue, Definition, Banner, StatusMessage
- [Chart Widgets](/docs/widgets/charts) - BarChart, LineChart, HeatMap, Sparkline
- [Feedback Widgets](/docs/widgets/feedback) - Spinner, ProgressBar, Skeleton, MultiProgress, CommandPalette
- **VirtualList**: Full reference for the virtualized list
- **@termuijs/ui**: Higher-level composites: Select, Tabs, Modal, Toast, Tree
- **Core Layout**: Flexbox properties that control widget positioning
- **TSS**: Style widgets with CSS-like theming and variables

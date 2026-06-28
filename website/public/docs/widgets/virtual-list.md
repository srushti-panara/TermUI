# VirtualList
A scroll-virtualized list that renders only the rows currently visible in the viewport. The rest of the dataset, whether 1,000 items or 10,000,000, never gets painted.

Scroll performance stays constant no matter how big the data gets.
Reach for this whenever a list could grow beyond what fits on screen: log viewers, process tables, file pickers, search results.
## Installation
```ts
npm install @termuijs/widgets
```
## Basic Usage
```ts

const list = new VirtualList({
    totalItems: 100_000,
    renderItem: (index) => `Row \${index}: some content`,
    onSelect:   (index) => console.log('Selected:', index),
})

const app = new App(list, { fullscreen: true })

app.events.on('key', (e) => {
    if (e.key === 'up')   list.selectPrev()
    if (e.key === 'down') list.selectNext()
    if (e.key === 'enter') list.confirm()
})

await app.mount()
// ┌──────────────────────────────────────────────────────────────┐
// │   Row 0: some content                                    ░   │
// │ ▸ Row 1: some content                                    █   │
// │   Row 2: some content                                    ░   │
// │   Row 3: some content                                    ░   │
// └──────────────────────────────────────────────────────────────┘
```
## Options
| Option          | Type                        | Default     | Description                                                                |
| --------------- | --------------------------- | ----------- | -------------------------------------------------------------------------- |
| `totalItems`    | `number`                    | -           | Total number of items in the dataset                                       |
| `renderItem`    | `(index: number) => string` | -           | Called for each visible item. Return its text content.                     |
| `itemHeight`    | `number`                    | `1`         | Rows each item occupies                                                    |
| `onSelect`      | `(index: number) => void`   | `undefined` | Called when the user presses Enter                                         |
| `overscan`      | `number`                    | `2`         | Extra items rendered above/below the viewport (prevents flicker on scroll) |
| `showScrollbar` | `boolean`                   | `true`      | Show a scrollbar indicator on the right                                    |
| `style`         | `Partial<Style>`            | `undefined` | Style overrides (color, background, etc.)                                  |
## Keyboard Navigation
Hook the list's methods to your key handler using  `app.events.on('key')`:
```ts

const list = new VirtualList({ totalItems: 1000, renderItem: (i) => `Item \${i}` })
const app = new App(list, { fullscreen: true })

app.events.on('key', (e) => {
    if (e.key === 'up')       list.selectPrev()
    if (e.key === 'down')     list.selectNext()
    if (e.key === 'pageup')   list.pageUp()
    if (e.key === 'pagedown') list.pageDown()
    if (e.key === 'home')     list.selectFirst()
    if (e.key === 'end')      list.selectLast()
    if (e.key === 'enter')    list.confirm()
})

await app.mount()
```
## Methods
### Navigation
| Method            | Description                               |
| ----------------- | ----------------------------------------- |
| `selectNext()`    | Move selection down by one item           |
| `selectPrev()`    | Move selection up by one item             |
| `selectFirst()`   | Jump to the first item                    |
| `selectLast()`    | Jump to the last item                     |
| `pageUp()`        | Move up by one viewport height            |
| `pageDown()`      | Move down by one viewport height          |
| `scrollTo(index)` | Jump to a specific index                  |
| `confirm()`       | Trigger `onSelect` with the current index |
### Data
| Method                 | Description                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `setTotalItems(count)` | Update the dataset size (e.g., after a filter or load). Clamps selection if needed. |
| `setRenderItem(fn)`    | Replace the render function (e.g., when data shape changes). Triggers a repaint.    |
### Properties
| Property        | Type     | Description                 |
| --------------- | -------- | --------------------------- |
| `totalItems`    | `number` | Current total item count    |
| `selectedIndex` | `number` | Current selection (0-based) |
| `scrollOffset`  | `number` | First visible item index    |
## Real-World Example: Filterable List
```ts

const ALL_PROCESSES = await getProcessList()   // 10,000+ items

let filtered = ALL_PROCESSES

const list = new VirtualList({
    totalItems: filtered.length,
    renderItem: (i) => {
const p = filtered[i]
return `\${p.pid.toString().padEnd(6)} \${p.name.padEnd(20)} \${p.cpu}%`
    },
    onSelect: (i) => inspectProcess(filtered[i]),
})

const searchInput = new TextInput({
    placeholder: 'Filter processes...',
    onChange: (query) => {
filtered = ALL_PROCESSES.filter((p) =>
p.name.toLowerCase().includes(query.toLowerCase())
)
list.setTotalItems(filtered.length)
list.selectFirst()
    },
})

const layout = new Box({ flexDirection: 'column' })
layout.addChild(searchInput)
layout.addChild(list)

const app = new App(layout, { fullscreen: true })

app.events.on('key', (e) => {
    if (e.key === 'up')    list.selectPrev()
    if (e.key === 'down')  list.selectNext()
    if (e.key === 'enter') list.confirm()
})

await app.mount()
```
## Loading Async Data
Start with a placeholder count and update as data arrives:
```ts
const items: Item[] = []

const list = new VirtualList({
    totalItems: 0,
    renderItem: (i) => items[i]?.name ?? 'Loading...',
})

const app = new App(list, { fullscreen: true })
await app.mount()

// Data comes in pages
async function loadPage(offset: number) {
    const page = await fetchItems(offset, 50)
    items.push(...page)
    list.setTotalItems(items.length)
}

loadPage(0)
```
## How Virtualization Works
On each render, `VirtualList` calculates which indices fall within the current viewport:
```ts
start = scrollOffset - overscan
end   = scrollOffset + visibleCount + overscan

// Anything outside [start, end] is never called or painted.
// totalItems only affects the scrollbar ratio and clamp logic.
```
The scrollbar position is computed as a ratio of  `scrollOffset / (totalItems - visibleCount)`. It uses block characters (`█` for thumb, `░` for track) and disappears when all items fit in the viewport.
## Performance
| Dataset size    | Items rendered per frame | Memory for item state |
| --------------- | ------------------------ | --------------------- |
| 100 items       | ~26 rows + 4 overscan    | O(viewport)           |
| 100,000 items   | ~26 rows + 4 overscan    | O(viewport)           |
| 1,000,000 items | ~26 rows + 4 overscan    | O(viewport)           |
The only work that scales with dataset size is your  `renderItem` function. keep it cheap. Derive display strings ahead of time if the computation is expensive.
## See also

- **List**: Simple non-virtualized list for small datasets (&lt;100 items)
- **Table**: Tabular data with column headers and alignment
- **TextInput**: Combine with VirtualList for search/filter UIs
- **@termuijs/store**: Manage filter/selection state outside the widget

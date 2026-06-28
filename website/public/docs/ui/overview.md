# UI Components
`@termuijs/ui` has 30+ interactive components built on top of `@termuijs/widgets`. Each one handles its own keyboard navigation, focus management, and rendering.

You wire up data, set callbacks, and let the widget do the rest.
## Installation
```ts
npm install @termuijs/ui
```
Peer dependencies: `@termuijs/core` and  `@termuijs/widgets` must be installed in the same project.
## Select
Single-choice dropdown with keyboard navigation. Up/Down to move, Enter to confirm, Escape to close.
```ts

const select = new Select(
    [
{ label: 'Development', value: 'dev' },
{ label: 'Staging',     value: 'staging' },
{ label: 'Production',  value: 'prod', disabled: true },
    ],
    {
label: 'Choose environment:',
onSelect: (option, index) => console.log('Picked:', option.value),
    }
)

const app = new App(select, { fullscreen: true })
app.events.on('key', (e) => {
    if (e.key === 'up')     select.selectPrev()
    if (e.key === 'down')   select.selectNext()
    if (e.key === 'enter')  select.confirm()
    if (e.key === 'escape') select.close()
})
await app.mount()
```
### Select Methods
| Method         | Description                       |
| -------------- | --------------------------------- |
| `open()`       | Expand the dropdown               |
| `close()`      | Collapse the dropdown             |
| `toggle()`     | Toggle open/closed                |
| `selectNext()` | Move cursor down (skips disabled) |
| `selectPrev()` | Move cursor up (skips disabled)   |
| `confirm()`    | Fire `onSelect` with current item |
## MultiSelect
Multi-choice selector. Space to toggle an item, Enter to submit the selection.
```ts

const multi = new MultiSelect(
    [
{ label: '@termuijs/core',    value: 'core' },
{ label: '@termuijs/widgets', value: 'widgets' },
{ label: '@termuijs/motion',  value: 'motion' },
{ label: '@termuijs/tss',     value: 'tss' },
    ],
    {
label: 'Select packages to install:',
onSubmit: (selected) => console.log('Chosen:', selected),
    }
)
```
### MultiSelect Methods
| Method            | Description                               |
| ----------------- | ----------------------------------------- |
| `selectNext()`    | Move cursor down (skips disabled)         |
| `selectPrev()`    | Move cursor up (skips disabled)           |
| `toggleCurrent()` | Toggle the item at the cursor             |
| `submit()`        | Fire `onSubmit` with all selected options |
| `selectedOptions` | Array of currently selected options       |
## Tabs
Tabbed content panels. Each tab holds a label and a content widget.

Arrow keys switch tabs.
```ts

const tabs = new Tabs(
    [
{ label: 'Overview', content: new Text('Overview content here') },
{ label: 'Logs',     content: new Text('Log output') },
{ label: 'Metrics',  content: new Text('Metrics data') },
    ],
)

const app = new App(tabs, { fullscreen: true })
app.events.on('key', (e) => {
    if (e.key === 'left')  tabs.prevTab()
    if (e.key === 'right') tabs.nextTab()
})
await app.mount()
```
### Tabs Methods
| Method         | Description                               |
| -------------- | ----------------------------------------- |
| `nextTab()`    | Switch to the next tab (wraps around)     |
| `prevTab()`    | Switch to the previous tab (wraps around) |
| `selectTab(i)` | Jump to tab at index `i`                  |
## Modal
Overlay dialog that can hold any widget as content. Call  `show()` and `hide()` to control visibility.
```ts

const modal = new Modal({
    title: 'Delete item?',
    width: 40,
    height: 8,
})
modal.setContent(new Text('This action cannot be undone.'))

// Show the modal when user presses 'd'
app.events.on('key', (e) => {
    if (e.key === 'd')      modal.show()
    if (e.key === 'escape') modal.hide()
})
```
### Modal Methods
| Method               | Description            |
| -------------------- | ---------------------- |
| `show()`             | Make the modal visible |
| `hide()`             | Hide the modal         |
| `toggle()`           | Toggle visibility      |
| `setContent(widget)` | Replace the modal body |
## Tree
Expandable tree for hierarchical data. Up/Down to navigate, Enter or Space to expand/collapse or select leaf nodes.
```ts

const tree = new Tree(
    [
{
label: 'src/',
expanded: true,
children: [
{
label: 'components/',
children: [
{ label: 'Button.tsx' },
{ label: 'Input.tsx' },
],
},
{ label: 'index.ts' },
],
},
    ],
    {
onSelect: (node, path) => console.log('Selected:', node.label),
    }
)

const app = new App(tree, { fullscreen: true })
app.events.on('key', (e) => {
    if (e.key === 'up')    tree.selectPrev()
    if (e.key === 'down')  tree.selectNext()
    if (e.key === 'enter') tree.confirm()
    if (e.key === 'space') tree.toggleExpand()
})
await app.mount()
```
## Toast
Timed notification. Push messages to a stack; they auto-expire after a timeout.
```ts

const toasts = new Toast({
    position: 'bottom-right',
    durationMs: 3000,
    maxVisible: 5,
})

// Push notifications from anywhere
toasts.success('File saved')
toasts.error('Network error')
toasts.warning('Disk usage at 90%')
toasts.info('Syncing...')
```
### Toast Methods
| Method              | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| `push(text, type?)` | Show a notification (`type`: info, success, warning, error) |
| `info(text)`        | Shortcut for `push(text, 'info')`                           |
| `success(text)`     | Shortcut for `push(text, 'success')`                        |
| `warning(text)`     | Shortcut for `push(text, 'warning')`                        |
| `error(text)`       | Shortcut for `push(text, 'error')`                          |
## Form
Form with fields, Tab/Shift+Tab navigation, and submission.
```ts

const form = new Form(
    [
{ name: 'user', label: 'Username', required: true },
{ name: 'pass', label: 'Password', required: true, masked: true },
    ],
    {
onSubmit: (values) => {
console.log('Submitted:', values)
// values is Map<string, string>
},
    }
)

const app = new App(form, { fullscreen: true })
app.events.on('key', (e) => {
    if (e.key === 'tab')   form.nextField()
    if (e.key === 'enter') form.submit()
})
await app.mount()
```
## CommandPalette
Fuzzy-search command launcher. Type to filter, Enter to run.
```ts

const palette = new CommandPalette(
    [
{ id: 'open',  label: 'Open file…',    action: openFile },
{ id: 'save',  label: 'Save',           shortcut: 'Ctrl+S', action: saveFile },
{ id: 'quit',  label: 'Quit',           shortcut: 'Ctrl+Q', action: () => app.exit() },
{ id: 'theme', label: 'Switch theme…',  action: pickTheme },
    ],
    { placeholder: 'Type a command…' }
)

// Toggle with Ctrl+P
app.events.on('key', (e) => {
    if (e.ctrl && e.key === 'p') palette.toggle()
})
```
### CommandPalette Methods
| Method     | Description                   |
| ---------- | ----------------------------- |
| `show()`   | Open the palette, reset query |
| `hide()`   | Close the palette             |
| `toggle()` | Open if closed, close if open |
## ConfirmDialog
Yes/No confirmation. A focused version of Modal that handles the confirm/cancel flow for you.
```ts

const dialog = new ConfirmDialog({
    title: 'Delete this item?',
    message: 'This cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    onConfirm: () => deleteItem(),
    onCancel: () => console.log('Cancelled'),
})
```
## Divider
A horizontal or vertical line to separate sections.
```ts

// Horizontal divider with a label
const divider = new Divider({ label: 'Settings', style: 'dashed' })
```
## Additional components

The following components were added in v0.1.6:

| Component | Description |
|---|---|
| `Drawer` | Slide-in panel from any edge with focus trap |
| `Wizard` | Multi-step form flow with back/next navigation |
| `RadioGroup` | Keyboard-navigable radio button group with disabled option support |
| `TreeSelect` | Hierarchical select with single and multi selection |
| `TextArea` | Multi-line text editor widget |
| `ButtonGroup` | Grouped button row with keyboard selection |
| `AppShell` | Full-screen app shell with header, sidebar, and content regions |
| `FilePicker` | File system browser for picking files and directories |
| `SegmentedControl` | Tab-style control for switching between a fixed set of options |
| `MenuBar` | Horizontal menu bar with dropdown submenus |
| `MaskedInput` | Text input with a configurable input mask |
| `Disclosure` | Toggle-able content section with unicode fallback |
| `TagInput` | Tag entry field with add and remove support |
| `Popover` | Anchored floating popover panel |
| `Combobox` | Searchable select with freeform text entry |
| `Listbar` | Horizontal item list with keyboard navigation |
| `Menu` | Context or dropdown menu |
| `Slider` | Single-handle range slider |
| `Switch` | Toggle switch with on/off state |
| `DateRangePicker` | Start and end date selection with calendar |
| `Transfer` | Dual-list transfer control for moving items between sets |
| `EmailInput` | Text input with email format validation |
| `Checkbox` | Single checkbox with label |
| `CheckboxGroup` | Multiple checkboxes with group state |
| `Rating` | Star rating input |
| `ThemeSwitcher` | Theme picker for switching TSS themes at runtime |
| `SearchInput` | Text input with search icon and clear button |
| `Pages` | Page container with slide transitions |
| `ContentSwitcher` | Toggles between content panels without tabs |
| `BasicAuthPrompt` | Username and password prompt widget |
| `SortPrompt` | Drag-order list for ranking items |
| `ScalePrompt` | Likert-scale rating prompt |
| `SnippetPrompt` | Code snippet selection prompt |
| `QuizPrompt` | Multiple-choice quiz widget |

## See also

- [Widgets. Box, Text, ProgressBar, Table](/docs/widgets/overview)
- [TSS. style UI components with themes](/docs/tss/overview)
- [Event Emitter. keyboard event handling](/docs/core/event-emitter)

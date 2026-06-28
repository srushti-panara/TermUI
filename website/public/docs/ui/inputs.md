# Specialized Inputs
`@termuijs/ui` extends the base `TextInput` with four purpose-built input components for common terminal UI patterns.
## PasswordInput
A text input that masks characters with `*`. Alt+V toggles visibility.
```ts

function LoginForm() {
    return (
        <PasswordInput
            placeholder="Password"
            onSubmit={(value) => authenticate(value)}
        />
    )
}
```
| Prop          | Type                      | Default | Description                            |
| ------------- | ------------------------- | ------- | -------------------------------------- |
| `placeholder` | `string`                  | `''`    | Hint text shown when empty             |
| `mask`        | `string`                  | `'*'`   | Replacement character for hidden input |
| `onSubmit`    | `(value: string) => void` | -       | Called when the user presses Enter     |
| `onChange`    | `(value: string) => void` | -       | Called on every keystroke              |

**Keyboard shortcuts:**
- Alt+V, toggle password visibility (show/hide)
- Enter, submit
- Escape, clear input
## NumberInput
Restricts input to digits and decimal points. Arrow keys increment/decrement by `step`.
```ts

function PortField() {
    return (
        <NumberInput
            value={8080}
            min={1}
            max={65535}
            step={1}
            onChange={(n) => setPort(n)}
        />
    )
}
```
| Prop       | Type                      | Default     | Description                                   |
| ---------- | ------------------------- | ----------- | --------------------------------------------- |
| `value`    | `number`                  | `0`         | Initial value                                 |
| `min`      | `number`                  | `-Infinity` | Minimum value, rejects `-` key when min ≥ 0   |
| `max`      | `number`                  | `Infinity`  | Maximum value                                 |
| `step`     | `number`                  | `1`         | Amount to increment/decrement with arrow keys |
| `decimals` | `number`                  | `0`         | Decimal places to allow                       |
| `onChange` | `(value: number) => void` | -           | Called whenever the value changes             |
| `onSubmit` | `(value: number) => void` | -           | Called on Enter                               |

**Keyboard shortcuts:**
- `↑`, increment by `step`
- `↓`, decrement by `step`
- Only digits, `.`, and `-` (when `min < 0`) are accepted
## PathInput
A text input with filesystem path completion. Press Tab to complete or cycle through suggestions.
```ts

function FileSelector() {
    return (
        <PathInput
            placeholder="/path/to/file"
            cwd={process.cwd()}
            onSubmit={(path) => openFile(path)}
        />
    )
}
```
| Prop          | Type                     | Default         | Description                            |
| ------------- | ------------------------ | --------------- | -------------------------------------- |
| `placeholder` | `string`                 | `''`            | Hint text                              |
| `cwd`         | `string`                 | `process.cwd()` | Base directory for relative paths      |
| `showHidden`  | `boolean`                | `false`         | Include `.dotfiles` in completions     |
| `onSubmit`    | `(path: string) => void` | -               | Called on Enter with the current value |

**Note:** PathInput has a fixed height of 4 rows minimum to show the completion list. Don't use it in height-constrained containers.

**Keyboard shortcuts:**
- Tab, complete to the longest common prefix, or show suggestions list
- Tab again, cycle through completions
- Shift+Tab, cycle backwards
- Enter, submit current value
- Escape, dismiss completions without clearing input
## KeyboardShortcuts
Renders a formatted reference card of keyboard bindings. Groups bindings by `category`, shows key names in bordered boxes.
```ts

const bindings: KeyBinding[] = [
    { key: 'q',      description: 'Quit',         category: 'General' },
    { key: 'ctrl+c', description: 'Force quit',    category: 'General' },
    { key: '?',      description: 'Show this help', category: 'General' },
    { key: 'up/down', description: 'Navigate',     category: 'Navigation' },
    { key: 'enter',  description: 'Select',        category: 'Navigation' },
    { key: 'tab',    description: 'Next panel',    category: 'Navigation' },
    { key: '/',      description: 'Search',        category: 'Actions' },
    { key: 'r',      description: 'Refresh',       category: 'Actions' },
]

function HelpScreen() {
    return <KeyboardShortcuts bindings={bindings} columns={2} />
}
```
| Prop             | Type           | Default  | Description                            |
| ---------------- | -------------- | -------- | -------------------------------------- |
| `bindings`       | `KeyBinding[]` | Required | The shortcuts to display               |
| `columns`        | `number`       | `1`      | Number of columns to lay out groups in |
| `showCategories` | `boolean`      | `true`   | Show group headers                     |

The `KeyBinding` type comes from `@termuijs/jsx`. Add a `category` field to group related shortcuts:
```ts

const binding: KeyBinding = {
    key: 'ctrl+s',
    description: 'Save file',
    category: 'File',         // optional grouping
}
```

## Drawer
A slide-in panel that opens from any screen edge and traps focus until dismissed.

| Prop | Type | Description |
|------|------|-------------|
| `edge` | `'top' \| 'bottom' \| 'left' \| 'right'` | Which edge the drawer slides from |
| `size` | `number` | Width (left/right) or height (top/bottom) in characters |
| `open` | `boolean` | Whether the drawer is visible |
| `onClose` | `() => void` | Called when Escape is pressed |

```tsx

function App() {
    const [open, setOpen] = useState(false)
    return <Drawer edge="right" size={40} open={open} onClose={() => setOpen(false)}>{settingsPanel}</Drawer>
}
```

## Wizard
A multi-step form with Next and Back navigation. Each step is a child component.

| Prop | Type | Description |
|------|------|-------------|
| `steps` | `string[]` | Step titles shown in the header |
| `onComplete` | `(data: Record<string, unknown>) => void` | Called when the last step is confirmed |

```tsx

function Setup() {
    return (
        <Wizard steps={['Account', 'Preferences', 'Confirm']} onComplete={handleDone}>

        </Wizard>
    )
}
```

## RadioGroup
A group of mutually exclusive radio options with keyboard navigation.

| Prop | Type | Description |
|------|------|-------------|
| `options` | `Array<{ label: string, value: string, disabled?: boolean }>` | Available choices |
| `value` | `string` | Currently selected value |
| `onChange` | `(value: string) => void` | Called when selection changes |

```tsx

function ThemePicker() {
    const [theme, setTheme] = useState('dark')
    return (
        <RadioGroup
            value={theme}
            onChange={setTheme}
            options={[{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }]}
        />
    )
}
```

## TreeSelect
A hierarchical select widget where options are nested in a collapsible tree.

| Prop | Type | Description |
|------|------|-------------|
| `nodes` | `TreeNode[]` | Nested option tree |
| `value` | `string \| string[]` | Selected value(s) |
| `multiple` | `boolean` | Allow multi-selection |
| `onChange` | `(value: string \| string[]) => void` | Called on selection change |

```tsx

function CategoryPicker() {
    return (
        <TreeSelect
            nodes={[{ label: 'Frontend', value: 'fe', children: [{ label: 'React', value: 'react' }] }]}
            onChange={setCategory}
        />
    )
}
```

## TextArea
A multi-line text editor with scrolling.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Initial content |
| `placeholder` | `string` | Hint text shown when empty |
| `onChange` | `(value: string) => void` | Called on every edit |
| `onSubmit` | `(value: string) => void` | Called on Ctrl+Enter |

```tsx

function NoteEditor() {
    return <TextArea placeholder="Write your note..." onSubmit={saveNote} />
}
```

## ButtonGroup
A horizontal row of buttons where one can be selected at a time.

| Prop | Type | Description |
|------|------|-------------|
| `buttons` | `Array<{ label: string, value: string }>` | Button definitions |
| `value` | `string` | Currently active button value |
| `onChange` | `(value: string) => void` | Called on selection |

```tsx

function ViewToggle() {
    return (
        <ButtonGroup
            buttons={[{ label: 'List', value: 'list' }, { label: 'Grid', value: 'grid' }]}
            value={view}
            onChange={setView}
        />
    )
}
```

## FilePicker
A file-system browser for selecting files or directories.

| Prop | Type | Description |
|------|------|-------------|
| `cwd` | `string` | Starting directory |
| `filter` | `(name: string) => boolean` | Function to exclude entries |
| `onSelect` | `(path: string) => void` | Called with the chosen path |

```tsx

function OpenDialog() {
    return <FilePicker cwd={process.cwd()} onSelect={openFile} />
}
```

## SegmentedControl
A compact row of labeled segments acting as a single-select control.

| Prop | Type | Description |
|------|------|-------------|
| `segments` | `string[]` | Segment labels |
| `value` | `string` | Active segment label |
| `onChange` | `(value: string) => void` | Called on selection |

```tsx

function SortControl() {
    return <SegmentedControl segments={['Name', 'Date', 'Size']} value={sort} onChange={setSort} />
}
```

## MenuBar
A horizontal menu bar with dropdown submenus and keyboard navigation.

| Prop | Type | Description |
|------|------|-------------|
| `menus` | `Array<{ label: string, items: MenuItem[] }>` | Top-level menus with their items |
| `onSelect` | `(id: string) => void` | Called with the item id on selection |

```tsx

function AppMenu() {
    return (
        <MenuBar
            menus={[
                { label: 'File', items: [{ id: 'new', label: 'New' }, { id: 'open', label: 'Open' }] },
                { label: 'Edit', items: [{ id: 'undo', label: 'Undo' }] },
            ]}
            onSelect={handleMenuAction}
        />
    )
}
```

## MaskedInput
A text input that enforces a character-by-character mask pattern, such as dates or phone numbers.

| Prop | Type | Description |
|------|------|-------------|
| `mask` | `string` | Pattern string where `9` = digit, `a` = letter, `*` = any character |
| `value` | `string` | Current value |
| `onChange` | `(value: string) => void` | Called on each valid keystroke |

```tsx

function DateField() {
    return <MaskedInput mask="99/99/9999" onChange={setDate} />
}
```

## Disclosure
A single toggle-able section with a header button. Similar to Collapsible but styled as an inline disclosure.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Header label |
| `open` | `boolean` | Initial open state |

```tsx

function AdvancedSection() {
    return (
        <Disclosure label="Advanced options">

        </Disclosure>
    )
}
```

## TagInput
A text input that converts each entered value into a removable tag.

| Prop | Type | Description |
|------|------|-------------|
| `tags` | `string[]` | Current tag values |
| `placeholder` | `string` | Hint text shown when empty |
| `onChange` | `(tags: string[]) => void` | Called when tags change |

```tsx

function LabelInput() {
    return <TagInput tags={labels} placeholder="Add a label..." onChange={setLabels} />
}
```

## Popover
A floating content panel anchored to a target widget, opened on demand.

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Whether the popover is visible |
| `onClose` | `() => void` | Called when the popover is dismissed |

```tsx

function InfoButton() {
    const [open, setOpen] = useState(false)
    return (
        <Popover open={open} onClose={() => setOpen(false)}>
            <Text>More details here.</Text>
        </Popover>
    )
}
```

## Combobox
A text input combined with a dropdown suggestion list.

| Prop | Type | Description |
|------|------|-------------|
| `options` | `string[]` | Available suggestions |
| `value` | `string` | Current input value |
| `onChange` | `(value: string) => void` | Called on value change |
| `onSelect` | `(value: string) => void` | Called when a suggestion is chosen |

```tsx

function CitySearch() {
    return <Combobox options={cities} value={query} onChange={setQuery} onSelect={setCity} />
}
```

## Slider
A horizontal slider for selecting a numeric value within a range. Arrow keys adjust the value.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number` | Current position |
| `min` | `number` | Minimum value |
| `max` | `number` | Maximum value |
| `step` | `number` | Step size per key press |
| `onChange` | `(value: number) => void` | Called on change |

```tsx

function VolumeControl() {
    return <Slider value={volume} min={0} max={100} step={5} onChange={setVolume} />
}
```

## Switch
A boolean toggle displayed as an on/off switch. Space or Enter toggles the state.

| Prop | Type | Description |
|------|------|-------------|
| `checked` | `boolean` | Current on/off state |
| `label` | `string` | Label shown beside the switch |
| `onChange` | `(checked: boolean) => void` | Called on toggle |

```tsx

function AutoSaveToggle() {
    return <Switch label="Auto-save" checked={autoSave} onChange={setAutoSave} />
}
```

## Rating
A star or block rating input. Arrow keys change the rating value.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number` | Current rating |
| `max` | `number` | Maximum rating (number of stars) |
| `onChange` | `(value: number) => void` | Called on change |

```tsx

function Feedback() {
    return <Rating value={rating} max={5} onChange={setRating} />
}
```

## SearchInput
A text input styled for search, with an inline search icon and optional clear button.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Current query string |
| `placeholder` | `string` | Hint text |
| `onChange` | `(value: string) => void` | Called on each keystroke |
| `onSubmit` | `(value: string) => void` | Called on Enter |

```tsx

function SearchBar() {
    return <SearchInput placeholder="Search..." value={query} onChange={setQuery} onSubmit={runSearch} />
}
```

## Checkbox
A single boolean checkbox. Space or Enter toggles.

| Prop | Type | Description |
|------|------|-------------|
| `checked` | `boolean` | Current state |
| `label` | `string` | Label beside the checkbox |
| `onChange` | `(checked: boolean) => void` | Called on toggle |

```tsx

function AgreementField() {
    return <Checkbox label="I agree to the terms" checked={agreed} onChange={setAgreed} />
}
```

## CheckboxGroup
A list of labeled checkboxes for selecting multiple values.

| Prop | Type | Description |
|------|------|-------------|
| `options` | `Array<{ label: string, value: string }>` | Available options |
| `value` | `string[]` | Currently checked values |
| `onChange` | `(value: string[]) => void` | Called when any checkbox changes |

```tsx

function FeatureFlags() {
    return (
        <CheckboxGroup
            options={[{ label: 'Hot reload', value: 'hmr' }, { label: 'Source maps', value: 'maps' }]}
            value={enabled}
            onChange={setEnabled}
        />
    )
}
```

## See also

- [Focus Management](/docs/jsx/focus), wire these inputs into a focus-managed form
- [Imperative Prompts](/docs/ui/prompts), overlay-style input dialogs

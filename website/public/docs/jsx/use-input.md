# useInput

`useInput` gives your component access to raw keyboard input. Your handler receives the pressed key as a string and a `KeyEvent` object with modifier flags.

Use `useInput` when you need custom per-key logic. For a list of named bindings, see [useKeymap](/docs/jsx/use-keymap). For arrow-key list navigation, see [useKeyboardNavigation](#usekeyboardnavigation) below.

## Installation

```bash
npm install @termuijs/jsx
```

## Signature

```ts
useInput(handler: (key: string, event: KeyEvent) => void): void
```

| Parameter | Type | Description |
|---|---|---|
| `handler` | `(key: string, event: KeyEvent) => void` | Called on every keypress |

The handler runs on each keypress while the component is mounted. No cleanup is needed; TermUI removes it automatically on unmount.

## KeyEvent properties

| Property | Type | Description |
|---|---|---|
| `key` | `string` | Key name, e.g. `'a'`, `'up'`, `'enter'`, `'escape'` |
| `ctrl` | `boolean` | True if Ctrl was held |
| `alt` | `boolean` | True if Alt/Option was held |
| `shift` | `boolean` | True if Shift was held |
| `sequence` | `string` | Raw terminal escape sequence |

Special keys use lowercase names: `'up'`, `'down'`, `'left'`, `'right'`, `'enter'`, `'escape'`, `'backspace'`, `'tab'`, `'space'`, `'pageup'`, `'pagedown'`, `'home'`, `'end'`, `'delete'`.

## Basic usage

```tsx

function QuitOnQ() {
    useInput((key) => {
        if (key === 'q') process.exit(0)
    })

    return <Text dim>Press q to quit</Text>
}
```

## Modifier combos

Check the `event` argument for modifier flags:

```tsx

function SearchPanel() {
    useInput((key, event) => {
        if (key === 'f' && event.ctrl) openSearch()
        if (key === 'r' && event.ctrl) refresh()
        if (key === 'escape')           closePanel()
    })

    return (
        <Box flexDirection="column">
            <Text dim>ctrl+f — search, ctrl+r — refresh, esc — close</Text>
        </Box>
    )
}
```

## Vim-style bindings

```tsx

type Mode = 'normal' | 'insert'

function VimEditor() {
    const [mode, setMode] = useState<Mode>('normal')
    const [text, setText] = useState('')

    useInput((key, event) => {
        if (mode === 'normal') {
            if (key === 'i') { setMode('insert'); return }
            if (key === 'q') process.exit(0)
        }

        if (mode === 'insert') {
            if (key === 'escape') { setMode('normal'); return }
            if (key === 'backspace') {
                setText((t) => t.slice(0, -1))
            } else if (!event.ctrl && !event.alt && key.length === 1) {
                setText((t) => t + key)
            }
        }
    })

    return (
        <Box flexDirection="column">
            <Text>{text || ' '}</Text>
            <Text dim>-- {mode.toUpperCase()} --</Text>
        </Box>
    )
}
```

## Multiple useInput calls

You can call `useInput` more than once in the same component. Both handlers fire on every keypress, in call order:

```tsx
function Panel() {
    useInput((key) => {
        if (key === 'q') process.exit(0)   // global quit
    })

    useInput((key) => {
        if (key === 'r') refresh()         // panel-level action
    })

    return <Box>...</Box>
}
```

## Interaction with the focus system

`useInput` fires on every keypress regardless of focus. To scope input to a focused component, pair it with `useFocus`:

```tsx

function FocusableItem({ id }: { id: string }) {
    const { isFocused } = useFocus({ id })

    useInput((key) => {
        if (!isFocused) return    // ignore input when not focused
        if (key === 'enter') activate()
    })

    return <Box borderColor={isFocused ? 'blue' : undefined}>...</Box>
}
```

See the [Focus](/docs/jsx/focus) page for the full focus system.

---

## useKeyboardNavigation

`useKeyboardNavigation` wires standard list-navigation keys to a selected index. It calls `useInput` internally, so you do not need to add `useInput` yourself for arrow-key navigation.

### Signature

```ts
useKeyboardNavigation(options: KeyboardNavigationOptions): KeyboardNavigationResult
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `itemCount` | `number` | required | Total number of items |
| `loop` | `boolean` | `true` | Wrap around at boundaries |
| `pageSize` | `number` | `10` | Items to skip on PageUp/PageDown |
| `onSelect` | `(index: number) => void` |, | Called when Enter is pressed |

### Returns

| Field | Type | Description |
|---|---|---|
| `selectedIndex` | `number` | Current selection (0-based) |
| `setSelectedIndex` | `setter` | Programmatically move the selection |

### Keys bound

| Key | Action |
|---|---|
| `up` | Move selection up by 1 |
| `down` | Move selection down by 1 |
| `home` | Jump to first item |
| `end` | Jump to last item |
| `pageup` | Move up by `pageSize` |
| `pagedown` | Move down by `pageSize` |
| `enter` | Call `onSelect` with current index |

### Example

```tsx

function FileList({ files }: { files: string[] }) {
    const { selectedIndex } = useKeyboardNavigation({
        itemCount: files.length,
        loop: false,
        onSelect: (i) => openFile(files[i]!),
    })

    return <List items={files} selectedIndex={selectedIndex} />
}
```

### Clamping instead of wrapping

Set `loop: false` to stop at the first and last items:

```tsx
const { selectedIndex } = useKeyboardNavigation({
    itemCount: items.length,
    loop: false,
    onSelect: handleSelect,
})
```

### Programmatic selection

Use `setSelectedIndex` to jump to a specific item from outside the hook:

```tsx
const { selectedIndex, setSelectedIndex } = useKeyboardNavigation({
    itemCount: results.length,
})

// Jump to top when search term changes
useEffect(() => {
    setSelectedIndex(0)
}, [searchTerm])
```

## See also

- [useKeymap](/docs/jsx/use-keymap), declarative named key bindings
- [Focus](/docs/jsx/focus), scope input to focused components
- [useMotion](/docs/jsx/use-motion), skip animations based on user preference

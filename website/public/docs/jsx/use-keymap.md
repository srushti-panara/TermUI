# useKeymap
`useKeymap` lets you declare keyboard shortcuts as a plain object. Handlers are registered when the component mounts and cleaned up automatically when it unmounts, no manual `useEffect` cleanup needed.
## Basic usage
```ts

function SearchPanel() {
    useKeymap({
        '/':         () => openSearch(),
        'escape':    () => closeSearch(),
        'ctrl+f':    () => openSearch(),
        'ctrl+c':    () => process.exit(0),
    })

    return <Box>...</Box>
}
```
## Modifier syntax
Prefix any key with `ctrl+`, `alt+`, `shift+`, or `meta+` separated by `+`:
| Binding        | Fires when        |
| -------------- | ----------------- |
| `'q'`          | q pressed         |
| `'ctrl+c'`     | Control + C       |
| `'alt+enter'`  | Alt + Enter       |
| `'shift+tab'`  | Shift + Tab       |
| `'ctrl+alt+d'` | Control + Alt + D |

Key names for special keys: `'enter'`, `'escape'`, `'tab'`, `'up'`, `'down'`, `'left'`, `'right'`, `'backspace'`, `'delete'`, `'home'`, `'end'`, `'pageup'`, `'pagedown'`, `'f1'`–`'f12'`.
## Multiple useKeymap calls
You can call `useKeymap` more than once in the same component. Each call adds to the map, later registrations don't overwrite earlier ones:
```ts
function Dashboard() {
    useKeymap({ 'q': quit })           // navigation
    useKeymap({ 'r': refreshData })    // actions

    // Both bindings are active
}
```
This is useful when combining a base keymap with conditionally-active shortcuts.
## Binding access to the key event
The handler receives the raw key string and the full `KeyEvent` object as arguments if you need the modifier flags:
```ts
useKeymap({
    'enter': (key, event) => {
        if (event.shift) {
            submitAndContinue()
        } else {
            submitAndClose()
        }
    },
})
```
## Scope and priority
`useKeymap` handlers fire for every key press unless a focused text input is consuming it. When a `TextInput`, `PasswordInput`, or `PathInput` has input focus, printable character keys and `backspace`/`enter` go to the input first, they won't reach `useKeymap` handlers unless no input is focused.

Global shortcuts using `ctrl+`, `alt+`, and function keys continue to fire regardless of input focus.
## Comparison with useInput
|                | useInput                    | useKeymap                         |
| -------------- | --------------------------- | --------------------------------- |
| API style      | Callback per key event      | Object map of key → handler       |
| Modifiers      | Manual `event.ctrl` check   | Declarative `'ctrl+c'` syntax     |
| Multiple calls | Chains automatically        | Additive, all bindings active     |
| Best for       | Raw input, text entry logic | Application shortcuts, navigation |

## See also

- [Focus Management](/docs/jsx/focus), combine with `useFocusTrap` for modal key scoping
- [useKeyboardNavigation](/docs/jsx/focus), standard list navigation built on `useKeymap`

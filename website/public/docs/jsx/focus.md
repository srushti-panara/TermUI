# Focus Management
TermUI ships four hooks for managing keyboard focus. Together they handle everything from basic input activation to fully accessible keyboard navigation.
## Hooks overview
| Hook                    | Role                                                     |
| ----------------------- | -------------------------------------------------------- |
| `useFocusManager`       | Owns focus state for a subtree, mount once near the root |
| `useFocus`              | Reads and controls focus for a single widget             |
| `useFocusTrap`          | Confines Tab/Shift+Tab to a list of IDs (for modals)     |
| `useKeyboardNavigation` | Arrow key navigation for lists and menus                 |

---

## useFocusManager
Provides the focus context for all descendant components. Returns `{ focused, focus, blur, FocusContext }`, wrap children in `FocusContext.Provider` to share state.
```ts

function Form() {
    const { focused, focus, blur, FocusContext } = useFocusManager()

    return (
        <FocusContext.Provider value={{ focused, focus, blur }}>

        </FocusContext.Provider>
    )
}
```
`focused` is the ID string of the currently focused widget, or `null` if nothing is focused.
### API
| Property       | Type                   | Description                                        |
| -------------- | ---------------------- | -------------------------------------------------- |
| `focused`      | `string \| null`       | ID of the focused widget                           |
| `focus(id)`    | `(id: string) => void` | Set focus to the given ID                          |
| `blur()`       | `() => void`           | Clear focus                                        |
| `FocusContext` | Context object         | Pass to `Provider` to share state with descendants |

---

## useFocus
Reads and controls focus for a single widget. Call inside any component that wants to participate in focus.
```ts

function NameField() {
    const { isFocused, focus, blur } = useFocus({ id: 'name-field', autoFocus: true })

    return (
        <Box border={isFocused ? 'double' : 'single'} borderColor={isFocused ? 'cyan' : 'brightBlack'}>
            <TextInput placeholder="Name" />
        </Box>
    )
}
```
### Options
| Option      | Type      | Default  | Description                            |
| ----------- | --------- | -------- | -------------------------------------- |
| `id`        | `string`  | Required | Unique ID within the focus manager     |
| `autoFocus` | `boolean` | `false`  | Immediately focus this widget on mount |

### Returns
| Property    | Type         | Description                             |
| ----------- | ------------ | --------------------------------------- |
| `isFocused` | `boolean`    | Whether this widget currently has focus |
| `focus()`   | `() => void` | Request focus                           |
| `blur()`    | `() => void` | Release focus                           |

---

## useFocusTrap
Traps Tab and Shift+Tab within a list of widget IDs. When Tab is pressed on the last item it wraps to the first; Shift+Tab on the first wraps to the last.

Use inside modals, dialogs, or any overlay that should capture all keyboard navigation.
```ts

function ConfirmModal() {
    useFocusTrap(['modal-yes', 'modal-no'])

    return (
        <Box border="double">
            <Text>Are you sure?</Text>
            <FocusableButton id="modal-yes" label="Yes" />
            <FocusableButton id="modal-no" label="No" />
        </Box>
    )
}
```
The trap is removed automatically when the component unmounts.
### API
```ts
useFocusTrap(ids: string[]): void
```
`ids` should be the ordered list of focusable widget IDs. Tab cycles forward through the list; Shift+Tab cycles backward.

---

## useKeyboardNavigation
Provides standard arrow-key navigation for lists and menus. Handles `↑`/`↓`, `Home`, `End`, `PageUp`, `PageDown`.
```ts

function Menu({ items }: { items: string[] }) {
    const { selectedIndex } = useKeyboardNavigation({
        itemCount: items.length,
        loop: true,
        pageSize: 10,
    })

    return (
        <col>
            {items.map((item, i) => (
                <Text key={item} bold={i === selectedIndex}>
                    {i === selectedIndex ? '▶ ' : '  '}{item}
                </Text>
            ))}
        </col>
    )
}
```
### Options
| Option      | Type                      | Default  | Description                             |
| ----------- | ------------------------- | -------- | --------------------------------------- |
| `itemCount` | `number`                  | Required | Total number of items to navigate       |
| `loop`      | `boolean`                 | `true`   | Wrap around at list boundaries          |
| `pageSize`  | `number`                  | `10`     | How many items `PageUp`/`PageDown` skip |
| `onSelect`  | `(index: number) => void` | -        | Called when Enter is pressed            |

### Returns
| Property           | Type                  | Description                         |
| ------------------ | --------------------- | ----------------------------------- |
| `selectedIndex`    | `number`              | Current position in the list        |
| `setSelectedIndex` | `(i: number) => void` | Programmatically move the selection |

---

## Full example: accessible form
```ts
function LoginForm() {
    const { focused, focus, blur, FocusContext } = useFocusManager()
    useFocusTrap(['login-user', 'login-pass', 'login-submit'])

    return (
        <FocusContext.Provider value={{ focused, focus, blur }}>
            <Box border="single" padding={1} flexDirection="column">
                <Text bold>Sign In</Text>
                <LabeledInput id="login-user" label="Username" autoFocus />
                <LabeledInput id="login-pass" label="Password" password />
                <SubmitButton id="login-submit" />
            </Box>
        </FocusContext.Provider>
    )
}
```

## See also

- [useKeymap](/docs/jsx/use-keymap), declarative key bindings per component
- [UI Inputs](/docs/ui/inputs), PasswordInput, NumberInput, PathInput built on this focus system

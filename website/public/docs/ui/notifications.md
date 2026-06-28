# Notifications
`@termuijs/ui` provides a `NotificationCenter` widget and `useNotifications` hook for in-app notifications. Notifications appear as auto-dismissing overlays and don't interrupt the user's current interaction.
## Setup
Mount `NotificationCenter` once at the app root. It renders notifications as a floating overlay in the top-right corner:
```ts

function App() {
    return (
        <col>

        </col>
    )
}
```
## Sending notifications
Use `useNotifications` from any component in the tree:
```ts

function SaveButton() {
    const { notify } = useNotifications()

    function handleSave() {
        try {
            saveData()
            notify('Saved successfully', { type: 'success' })
        } catch (err) {
            notify(`Save failed: ${err.message}`, { type: 'error', duration: 0 })
        }
    }

    useKeymap({ 's': handleSave })

    return <Text>Press s to save</Text>
}
```
## notify(message, options?)
| Parameter  | Type                                          | Default  | Description                                                |
| ---------- | --------------------------------------------- | -------- | ---------------------------------------------------------- |
| `message`  | `string`                                      | Required | Text to display                                            |
| `type`     | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Sets the icon and border color                             |
| `duration` | `number`                                      | `3000`   | Milliseconds before auto-dismiss. Pass `0` for persistent. |

Returns a `string` ID you can use to dismiss the notification programmatically.

## Notification types
| Type      | Icon (unicode) | Icon (ASCII fallback) | Border color |
| --------- | -------------- | --------------------- | ------------ |
| `info`    | ℹ              | [i]                   | cyan         |
| `success` | ✓              | [+]                   | green        |
| `warning` | ⚠              | [!]                   | yellow       |
| `error`   | ✗              | [x]                   | red          |

Icons automatically switch to ASCII fallbacks when `NO_UNICODE=1`.
## dismiss(id)
```ts
const { notify, dismiss } = useNotifications()

// Show a persistent notification
const id = notify('Uploading...', { type: 'info', duration: 0 })

// Later, when upload completes
dismiss(id)
notify('Upload complete', { type: 'success' })
```
## Reading all active notifications
```ts
const { notifications } = useNotifications()

// notifications: Array<{ id: string, message: string, type: string, createdAt: number }>
console.log(`${notifications.length} notifications visible`)
```
## Listbar
A horizontal scrollable bar of selectable list items, suitable for tab-like navigation.

| Prop | Type | Description |
|------|------|-------------|
| `items` | `string[]` | Labels to display |
| `value` | `string` | Currently active item |
| `onChange` | `(value: string) => void` | Called on selection |

```tsx

function NavBar() {
    return <Listbar items={['Overview', 'Logs', 'Metrics']} value={tab} onChange={setTab} />
}
```

## Menu
A vertical dropdown menu with keyboard navigation and optional separators.

| Prop | Type | Description |
|------|------|-------------|
| `items` | `Array<{ id: string, label: string } \| 'separator'>` | Menu items |
| `onSelect` | `(id: string) => void` | Called when an item is chosen |

```tsx

function ContextMenu() {
    return (
        <Menu
            items={[{ id: 'copy', label: 'Copy' }, 'separator', { id: 'paste', label: 'Paste' }]}
            onSelect={handleAction}
        />
    )
}
```

## Pages
A container that shows one child page at a time, switchable by index.

| Prop | Type | Description |
|------|------|-------------|
| `current` | `number` | Index of the visible page |

```tsx

function MultiPageApp() {
    return (
        <Pages current={page}>

        </Pages>
    )
}
```

## ContentSwitcher
A labeled tab bar connected to a Pages-style content area. Selecting a tab updates the visible content.

| Prop | Type | Description |
|------|------|-------------|
| `tabs` | `string[]` | Tab labels |
| `value` | `number` | Active tab index |
| `onChange` | `(index: number) => void` | Called on tab selection |

```tsx

function Dashboard() {
    const [tab, setTab] = useState(0)
    return (
        <>
            <ContentSwitcher tabs={['Charts', 'Logs', 'Config']} value={tab} onChange={setTab} />
            <Pages current={tab}><Charts /><Logs /><Config /></Pages>
        </>
    )
}
```

## AppShell
A full-screen layout component with slots for a header, sidebar, main content area, and footer.

| Prop | Type | Description |
|------|------|-------------|
| `header` | `Widget` | Widget rendered at the top |
| `sidebar` | `Widget` | Widget rendered on the left |
| `footer` | `Widget` | Widget rendered at the bottom |

```tsx

function App() {
    return (
        <AppShell header={<TitleBar />} sidebar={<NavSidebar />} footer={<StatusBar />}>

        </AppShell>
    )
}
```

## ThemeSwitcher
A selection widget that lists available themes and applies the chosen one at runtime.

| Prop | Type | Description |
|------|------|-------------|
| `themes` | `string[]` | Theme names to list |
| `current` | `string` | Active theme name |
| `onChange` | `(name: string) => void` | Called when a theme is selected |

```tsx

function ThemePanel() {
    return <ThemeSwitcher themes={['dark', 'light', 'dracula', 'tokyo-night']} current={theme} onChange={applyTheme} />
}
```

## See also

- [Imperative Prompts](/docs/ui/prompts), blocking input dialogs (confirm, text entry, select)
- [Accessibility](/docs/guides/accessibility), how icons adapt to NO_UNICODE environments

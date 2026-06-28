# Context API

Share state across your component tree without threading props through every level. Create a context, wrap your tree in a Provider, read the value anywhere below it.

Under the hood, `useContext()` walks up the fiber chain to find the nearest `Provider`. No match? It falls back to the default value from `createContext()`.

## Installation

```bash
npm install @termuijs/jsx
```

## Quick Example

```tsx

// 1. Create. define shape and default
const ThemeCtx = createContext({ fg: 'white', bg: 'black' })

// 2. Provide. supply a value to the subtree
function App() {
    return (
        <ThemeCtx.Provider value={{ fg: '#00ff88', bg: '#0a0a0f' }}>

        </ThemeCtx.Provider>
    )
}

// 3. Consume. read the nearest value
function StatusBar() {
    const theme = useContext(ThemeCtx)
    return <Text color={theme.fg}>Ready</Text>
}
```

## createContext(defaultValue)

Creates a new Context object. The `defaultValue` is used when a component reads the context outside of any Provider, useful for testing and for components that should work standalone.

```ts

// Primitive default
const CountCtx = createContext(0)

// Object default
const UserCtx = createContext({ name: 'Guest', role: 'viewer' })

// Nullable. when absence is meaningful
const RouterCtx = createContext<RouterState | null>(null)
```

### Return value

| Property       | Type               | Description                                             |
| -------------- | ------------------ | ------------------------------------------------------- |
| `Provider`     | `FC<{ value: T }>` | Wrap your subtree with this component to supply a value |
| `defaultValue` | `T`                | The fallback value when no Provider is in scope         |
| `_id`          | `symbol`           | Internal. used by the fiber engine for lookup           |

## useContext(context)

Reads the value from the nearest Provider ancestor. Must be called inside a functional component, same as any other hook.

```tsx

function StatusBar() {
    const theme = useContext(ThemeCtx)    // reads Provider value
    const user = useContext(UserCtx)      // falls back to defaultValue if no Provider
    
    return (
        <Box>
            <Text color={theme.fg}>{user.name}</Text>
        </Box>
    )
}
```

**Rule:** Like all hooks, `useContext` must be called at the top level of your component, never in a loop or conditional.

## Context.Provider

The `Provider` component makes a value available to the entire subtree it wraps. It takes a single `value` prop.

```tsx
function App() {
    const [theme, setTheme] = useState(darkTheme)

    return (
        <ThemeCtx.Provider value={theme}>

            <Main>

            </Main>

        </ThemeCtx.Provider>
    )
}
```

## Nested Providers

Providers can be nested. The **nearest** one wins.

This lets you override context for a specific subtree without touching the rest.

```tsx
// Global theme: dark
<ThemeCtx.Provider value={darkTheme}>
    <Header />          {/* reads darkTheme */}

    {/* A single panel with an override */}
    <ThemeCtx.Provider value={lightTheme}>
        <HelpPanel />   {/* reads lightTheme */}
    </ThemeCtx.Provider>

    <Footer />          {/* reads darkTheme again */}
</ThemeCtx.Provider>
```

## Multiple Contexts

Each context is completely independent. Use as many as you need; there's no performance penalty for additional contexts.

```tsx
const ThemeCtx = createContext(defaultTheme)
const UserCtx  = createContext<User | null>(null)
const RouterCtx = createContext<RouterState>(defaultRouter)

function App() {
    return (
        <ThemeCtx.Provider value={theme}>
            <UserCtx.Provider value={currentUser}>
                <RouterCtx.Provider value={router}>

                </RouterCtx.Provider>
            </UserCtx.Provider>
        </ThemeCtx.Provider>
    )
}
```

## Real-world example: theme system

A common pattern: manage theme switching at the top level, read it deep in the tree:

```tsx

// ── Types ──
interface Theme {
    primary: string
    bg: string
    border: string
}

const DARK: Theme  = { primary: '#00ff88', bg: '#0a0a0f', border: '#2a2a45' }
const LIGHT: Theme = { primary: '#007a3d', bg: '#f8f8f0', border: '#cccccc' }

// ── Context ──
const ThemeCtx = createContext<Theme>(DARK)

// ── Hook shortcut (optional. cleaner call sites) ──
export function useTheme() {
    return useContext(ThemeCtx)
}

// ── Root ──
function App() {
    const [dark, setDark] = useState(true)
    const theme = dark ? DARK : LIGHT

    return (
        <ThemeCtx.Provider value={theme}>
            <Shell onToggle={() => setDark(d => !d)} />
        </ThemeCtx.Provider>
    )
}

// ── Deep child ──
function Sidebar() {
    const theme = useTheme()   // no props needed
    return (
        <Box border="single" borderColor={theme.border}>
            <Text color={theme.primary}>Navigation</Text>
        </Box>
    )
}
```

## TypeScript

Context is fully generic. The type is inferred from the default value, but you can be explicit when needed (e.g., nullable types):

```ts
// Inferred from default
const CountCtx = createContext(0)
// CountCtx is Context<number>

// Explicit generic for nullable
const AuthCtx = createContext<{ token: string } | null>(null)
// AuthCtx is Context<{ token: string } | null>

// Reading a nullable context
function RequiresAuth() {
    const auth = useContext(AuthCtx)
    if (!auth) return <Text color="red">Not authenticated</Text>
    return <Text>Welcome, token: {auth.token}</Text>
}
```

## When to use context

Context works well when data needs to reach components at many different depths. For 1-2 levels of nesting, plain props are simpler and easier to trace.

| Good fit                     | Not ideal                              |
| ---------------------------- | -------------------------------------- |
| Active theme / color scheme  | Data only used by one child            |
| Current authenticated user   | Frequently-updating values (use store) |
| Router state / current route | Component-local UI state               |
| Feature flags or config      | Props that change every render         |

For global state that updates frequently (like a real-time data feed), reach for **@termuijs/store** instead; it has selector-based subscriptions that prevent unnecessary re-renders.

## See also

- **@termuijs/store**: Global state with selector subscriptions
- **useState**: Component-local state
- **memo()**: Skip re-renders when context-derived props haven't changed

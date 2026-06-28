# @termuijs/store
Global state for terminal apps. The idea is borrowed from Zustand: you create a store with a creator function, subscribe to slices in your components, and update from anywhere.

No context wrappers. No prop chains.
The performance model is simple. Each component picks the slice it cares about.

When something else in the store updates, that component doesn't re-render. Ten components sharing a store won't cause ten re-renders unless they're all reading the same field.
## Installation
```ts
npm install @termuijs/store
```
## Quick example
```ts

// 1. Create the store outside any component
const useCounter = createStore((set) => ({
    count: 0,
    increment: () => set((s) => ({ count: s.count + 1 })),
    decrement: () => set((s) => ({ count: s.count - 1 })),
    reset:     () => set({ count: 0 }),
}))

// 2. Use it in a component with a selector
function Counter() {
    const count     = useCounter((s) => s.count)
    const increment = useCounter((s) => s.increment)
    const decrement = useCounter((s) => s.decrement)

    useInput((key) => {
if (key === 'up')   increment()
if (key === 'down') decrement()
if (key === 'r')    useCounter.getState().reset()
    })

    return (
<Box border="round" padding={1}>
<Text bold>Count: {count}</Text>
<Text dim>↑ up  ↓ down  r reset</Text>
</Box>
    )
}
```
## createStore(creator)
The `creator` function receives `set` and  `get` and returns your initial state object, actions included.
```ts
const useAppStore = createStore((set, get) => ({
    // State fields
    todos:  [] as string[],
    filter: 'all' as 'all' | 'done' | 'active',

    // Actions
    addTodo:  (text: string) => set((s) => ({ todos: [...s.todos, text] })),
    setFilter: (filter: string) => set({ filter }),

    // Derived. using get() to read current state inside an action
    get activeTodos() {
return get().todos.filter((_, i) => !get().done[i])
    },
}))
```
### `set(partial)`
Merges partial state. Pass an object for simple overwrites, or an updater function when the new value depends on the old one:
```ts
// Object form. merges these keys
set({ filter: 'done' })

// Updater form. safe when you need the previous value
set((state) => ({ count: state.count + 1 }))
set((state) => ({ todos: [...state.todos, newTodo] }))
```
### `get()`
Reads state synchronously. Useful inside async actions where the state may have changed between `await` calls:
```ts
const useNetStore = createStore((set, get) => ({
    logs: [] as string[],
    endpoint: '',

    fetchLogs: async () => {
const { endpoint } = get()   // read current endpoint
const data = await fetch(endpoint).then(r => r.json())
set({ logs: data })
    },
}))
```
## Selectors
Pass a function to pick out the piece of state you need. Your component re-renders only when that piece changes.
```ts
// Read one field
const count  = useCounter((s) => s.count)
const filter = useAppStore((s) => s.filter)

// Derive a value inline
const activeTodos = useTodoStore((s) =>
    s.todos.filter((t) => !t.done)
)

// Read everything (re-renders on any change. use sparingly)
const { count, increment } = useCounter()
```
Watch out for selectors that create a new object every call (mapping an array, for example). They'll trigger a re-render every time because the reference is always different.

Either store the derived value in state or wrap the component in `memo()`.
## Reading and writing outside components
`createStore` attaches `getState`,  `setState`, `subscribe`, and `destroy`  directly to the hook. You don't need to be inside a component:
```ts
// One-off read
const current = useCounter.getState()
console.log('count:', current.count)

// Update from a timer or event handler
setInterval(() => {
    useNetStore.setState((s) => ({ requestCount: s.requestCount + 1 }))
}, 5000)

// Subscribe without JSX
const unsub = useCounter.subscribe((state, prev) => {
    if (state.count !== prev.count) {
console.log('count changed:', state.count)
    }
})
// later:
unsub()
```
## Async actions
Actions are plain functions. Use `async/await` like you would anywhere else:
```ts
const useDataStore = createStore((set, get) => ({
    items: [] as Item[],
    loading: false,
    error: null as string | null,

    fetch: async () => {
set({ loading: true, error: null })
try {
const items = await fetchItems()
set({ items, loading: false })
} catch (err) {
set({ error: (err as Error).message, loading: false })
}
    },
}))

// In a component:
function ItemList() {
    const { items, loading, error, fetch } = useDataStore()

    useEffect(() => { fetch() }, [])

    if (loading) return <Spinner />
    if (error)   return <Text color="red">{error}</Text>
    return <List items={items} renderItem={(item) => item.name} />
}
```
## Multiple stores
There's no "one store" rule. Create as many as your app needs.

Each one stays focused, re-renders stay minimal.
```ts
export const useThemeStore = createStore((set) => ({
    dark: true,
    toggle: () => set((s) => ({ dark: !s.dark })),
}))

export const useNavStore = createStore((set) => ({
    activeTab: 0,
    setTab: (i: number) => set({ activeTab: i }),
}))

export const useDataStore = createStore((set, get) => ({
    records: [] as Record[],
    load: async () => { /* ... */ },
}))
```
## TypeScript
Types are inferred from the creator function. You don't need to annotate anything:
```ts
const useCounter = createStore((set) => ({
    count: 0,
    increment: () => set((s) => ({ count: s.count + 1 })),
}))

const count: number         = useCounter((s) => s.count)
const inc: () => void       = useCounter((s) => s.increment)
const state: { count: number; increment: () => void } = useCounter.getState()
```
## Full reference
| Method                         | Description                                           |
| ------------------------------ | ----------------------------------------------------- |
| `createStore(creator)`         | Create a store. Returns a hook with selector support. |
| `useStore()`                   | Subscribe to the full state                           |
| `useStore(selector)`           | Subscribe to a derived slice                          |
| `useStore.getState()`          | Read state without subscribing                        |
| `useStore.setState(partial)`   | Update state from outside a component                 |
| `useStore.subscribe(listener)` | Listen for changes. returns an unsubscribe function   |
| `useStore.destroy()`           | Remove all subscribers (call this in test cleanup)    |
## When to use store vs useState
| useState                                      | createStore                               |
| --------------------------------------------- | ----------------------------------------- |
| Local UI state (open/closed, cursor position) | State shared across many components       |
| Lives inside one component                    | Global settings (theme, auth, config)     |
| Not needed outside the component              | Updated from outside JSX (timers, events) |
| Transient state cleared on unmount            | State that persists across route changes  |
## Batching multiple updates
When you call `setState` multiple times in the same event handler or timer callback, each call normally triggers a separate reconciler pass. Use `batch()` to collapse them into one:
```ts

// Without batch: three separate re-renders
store.setState({ step: 2 })
store.setState({ label: 'Processing' })
store.setState({ loading: true })

// With batch: one re-render
batch(() => {
    store.setState({ step: 2 })
    store.setState({ label: 'Processing' })
    store.setState({ loading: true })
})
```
`batch` uses `queueMicrotask` internally, all queued updates flush in the same microtask, after the current synchronous code finishes.

Batch is most valuable when updating stores from outside components: timers, socket handlers, file watchers.
## See also

- **Context API**: Share config that rarely changes
- **useAsync**: Async data loading in individual components
- **memo()**: Prevent re-renders when store selectors return stable values

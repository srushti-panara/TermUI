# Selectors & Subscriptions

A selector is a function you pass to a store hook. It picks the piece of state your component needs. The component re-renders only when that piece changes.

Without a selector, a component subscribes to the full store and re-renders on every update. With a selector, it re-renders only when its specific slice changes.

## Basic selectors

```ts
const useCounter = createStore((set) => ({
    count: 0,
    label: 'counter',
    increment: () => set((s) => ({ count: s.count + 1 })),
}))

function Counter() {
    // Re-renders only when count changes
    const count = useCounter((s) => s.count)

    // Re-renders only when label changes
    const label = useCounter((s) => s.label)

    // Re-renders only when increment reference changes (almost never)
    const increment = useCounter((s) => s.increment)

    return <Text>{label}: {count}</Text>
}
```

Each `useCounter(selector)` call sets up an independent subscription. Updating `count` does not re-render a component that only reads `label`.

## Subscribing to the full state

Call the hook with no argument to subscribe to the entire state object:

```ts
function DebugPanel() {
    const state = useCounter()  // re-renders on any change
    return <Text>{JSON.stringify(state)}</Text>
}
```

Use this sparingly. Components that read the full state re-render whenever anything in the store changes.

## Derived / computed selectors

Compute a value inline inside the selector:

```ts
const useTodoStore = createStore((set) => ({
    todos: [] as { text: string; done: boolean }[],
    addTodo: (text: string) => set((s) => ({ todos: [...s.todos, { text, done: false }] })),
    toggle: (i: number) => set((s) => {
        const todos = [...s.todos]
        todos[i] = { ...todos[i], done: !todos[i].done }
        return { todos }
    }),
}))

function ActiveCount() {
    // Re-renders when the active count changes, not on every todo update
    const activeCount = useTodoStore((s) => s.todos.filter((t) => !t.done).length)
    return <Text>Active: {activeCount}</Text>
}
```

The re-render check uses `Object.is`. Because `activeCount` is a number, `Object.is` compares it correctly. The component skips a re-render when the count stays the same, even if the `todos` array reference changed.

### Watch out for referential equality

Selectors that return a new object or array on every call always trigger a re-render:

```ts
// Problem: new array reference every render, even if contents are identical
const activeTodos = useTodoStore((s) => s.todos.filter((t) => !t.done))
```

Options to fix this:

1. **Select a primitive**, return a count or ID instead of the array.
2. **Store the derived value in state**, compute it once in an action and store the result.
3. **Wrap the component in `memo()`**, skip re-render when props haven't changed.

```ts
// Option 1: select the count, not the array
const activeCount = useTodoStore((s) => s.todos.filter((t) => !t.done).length)

// Option 2: keep derived state in the store
const useStore = createStore((set, get) => ({
    todos: [] as Todo[],
    activeTodos: [] as Todo[],
    toggle: (i: number) => {
        const todos = [...get().todos]
        todos[i] = { ...todos[i], done: !todos[i].done }
        set({ todos, activeTodos: todos.filter((t) => !t.done) })
    },
}))
```

## Computed selectors (outside React)

`store.computed(selector)` creates a memoized derived value that lives outside the component tree. It re-runs the selector on every state change but only notifies its subscribers when the derived value changes.

```ts
const useStore = createStore((set) => ({
    todos: [] as { text: string; done: boolean }[],
    toggle: (i: number) => set((s) => {
        const todos = [...s.todos]
        todos[i] = { ...todos[i], done: !todos[i].done }
        return { todos }
    }),
}))

// Create a computed value
const activeCount = useStore.computed((s) => s.todos.filter((t) => !t.done).length)

// Read the current value synchronously
console.log(activeCount.get())  // 3

// Subscribe to changes
const unsub = activeCount.subscribe((count) => {
    console.log('active count changed to', count)
})

// Clean up when done
unsub()
activeCount.dispose()  // removes the internal store subscription
```

Call `dispose()` when you no longer need the computed value. Without it, the internal store subscription stays active and leaks memory.

**`Computed<U>` interface**

| Method | Returns | Description |
|--------|---------|-------------|
| `get()` | `U` | Current memoized value |
| `subscribe(listener)` | `() => void` | Subscribe to value changes; returns an unsubscribe function |
| `dispose()` | `void` | Remove internal subscription and all computed listeners |

## Subscribing outside React

Use `store.subscribe(listener)` when you need to react to state changes outside a component, for example in a server loop, file watcher, or integration test.

```ts
const useNetStore = createStore((set) => ({
    connected: false,
    requestCount: 0,
}))

// Subscribe from anywhere
const unsub = useNetStore.subscribe((state, prevState) => {
    if (state.connected !== prevState.connected) {
        console.log('connection status:', state.connected ? 'online' : 'offline')
    }
})

// Remove the subscription later
unsub()
```

The listener receives both the new state and the previous state. You can diff them to respond only to the fields you care about.

## Reading state imperatively with getState()

`store.getState()` returns the current state synchronously without setting up a subscription:

```ts
const useCounter = createStore((set) => ({
    count: 0,
    increment: () => set((s) => ({ count: s.count + 1 })),
}))

// One-off read — no subscription, no re-render
const current = useCounter.getState()
console.log(current.count)

// Call an action from outside a component
useCounter.getState().increment()
```

This is useful in event handlers, timers, and tests where you need the current value once without subscribing.

## Performance comparison

Ten components sharing the same store, each with a fine-grained selector:

```ts
const useAppStore = createStore((set) => ({
    count: 0,
    label: '',
    theme: 'dark',
    // ...
    increment: () => set((s) => ({ count: s.count + 1 })),
}))

function Counter() {
    // Only this component re-renders when count changes
    const count = useAppStore((s) => s.count)
    return <Text>Count: {count}</Text>
}

function Label() {
    // Only this component re-renders when label changes
    const label = useAppStore((s) => s.label)
    return <Text>{label}</Text>
}

function Theme() {
    // Only this component re-renders when theme changes
    const theme = useAppStore((s) => s.theme)
    return <Box color={theme === 'dark' ? 'black' : 'white'} />
}
```

Calling `increment()` triggers one re-render, only `Counter`. `Label` and `Theme` see no change in their selected values and stay still.

Compare this to reading the full state:

```ts
function AllInOne() {
    // Re-renders whenever count, label, OR theme changes
    const { count, label, theme } = useAppStore()
    return <Text>{count} {label}</Text>
}
```

The selector-per-field approach keeps terminal UI fast, especially for stores that update frequently (keyboard input handlers, timers, streaming data).

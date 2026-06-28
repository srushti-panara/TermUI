# Store API Reference

This page covers every function and type exported from `@termuijs/store`. For concepts and patterns, see the [overview](/docs/store/overview), [selectors](/docs/store/selectors), and [middleware](/docs/store/middleware) pages.

## createStore

```ts
function createStore<T extends object>(
    creator: StateCreator<T>,
    options?: StoreOptions<T>
): UseStore<T>

function createStore<T extends object>(
    state: T,
    options?: StoreOptions<T>
): UseStore<T>
```

Creates a store and returns a hook. Pass either a creator function or a plain state object.

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `creator` | `StateCreator<T>` or `T` | A function `(set, get) => T` that returns the initial state, or a plain object. |
| `options` | `StoreOptions<T>` | Optional. Middleware array and persist configuration. |

**Returns** `UseStore<T>`, a hook function with store methods attached.

```ts
const useCounter = createStore((set, get) => ({
    count: 0,
    increment: () => set((s) => ({ count: s.count + 1 })),
    reset: () => set({ count: 0 }),
}))

// Plain object form
const useFlags = createStore({ darkMode: true, debug: false })
```

---

## UseStore hook

The value returned by `createStore` is a hook you call inside components. It also carries store methods as properties for use outside components.

### useStore()

```ts
function useStore(): T
function useStore<U>(selector: Selector<T, U>): U
```

Call with no argument to subscribe to the full state. Call with a selector to subscribe to a derived slice. The component re-renders only when the selected value changes (compared with `Object.is`).

```ts
// Full state — re-renders on any change
const state = useCounter()

// Derived slice — re-renders only when count changes
const count = useCounter((s) => s.count)
```

### useStore.getState()

```ts
getState: GetState<T>  // () => T
```

Returns the current state synchronously. Does not set up a subscription. Use this outside components for one-off reads and imperative updates.

```ts
const current = useCounter.getState()
console.log(current.count)

// Call an action directly
useCounter.getState().increment()
```

### useStore.setState()

```ts
setState: SetState<T>
// (partial: Partial<T> | ((state: T) => Partial<T>)) => void
```

Merges a partial update into the store state. Pass an object to overwrite specific keys, or a function to derive the next values from the current state.

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `partial` | `Partial<T>` | Object whose keys are merged into state |
| `partial` | `(state: T) => Partial<T>` | Updater function, receives current state, returns partial update |

```ts
// Object form
useCounter.setState({ count: 0 })

// Updater form — safe when the new value depends on the current value
useCounter.setState((s) => ({ count: s.count + 1 }))
```

Listeners are notified only when at least one value actually changes (`Object.is` comparison per key).

### useStore.subscribe()

```ts
subscribe(listener: Listener<T>): () => void
// Listener<T> = (state: T, prevState: T) => void
```

Registers a listener that runs on every state change. Returns an unsubscribe function. Call it when you no longer need the subscription.

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `listener` | `(state: T, prevState: T) => void` | Called after each state update with the new and previous state |

**Returns** `() => void`, unsubscribe function.

```ts
const unsub = useCounter.subscribe((state, prev) => {
    if (state.count !== prev.count) {
        console.log('count changed:', state.count)
    }
})

// Remove the listener later
unsub()
```

### useStore.destroy()

```ts
destroy(): void
```

Removes all listeners and cancels any pending persist write. Call this in test cleanup to prevent listener leaks between tests.

```ts
afterEach(() => {
    useCounter.destroy()
})
```

### useStore.computed()

```ts
computed<U>(selector: Selector<T, U>): Computed<U>
```

Creates a memoized derived value outside the component tree. The selector runs on every state change, but subscribers are notified only when the derived value changes.

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `selector` | `(state: T) => U` | Derives a value from state |

**Returns** `Computed<U>`.

```ts
const activeCount = useStore.computed((s) => s.todos.filter((t) => !t.done).length)

console.log(activeCount.get())  // current value

const unsub = activeCount.subscribe((count) => {
    console.log('active:', count)
})

// Clean up to prevent memory leaks
unsub()
activeCount.dispose()
```

**`Computed<U>` interface**

| Method | Returns | Description |
|--------|---------|-------------|
| `get()` | `U` | Current memoized value |
| `subscribe(listener)` | `() => void` | Subscribe to value changes; returns an unsubscribe function |
| `dispose()` | `void` | Remove the internal store subscription and all computed listeners |

Always call `dispose()` when finished. Without it, the internal store subscription stays active.

### useStore.reset()

```ts
reset(): void
```

Restores the state to the values captured at creation time (before any persist rehydration). Actions (functions) in state are not reset.

```ts
const useForm = createStore((set) => ({
    name: '',
    email: '',
    setName: (v: string) => set({ name: v }),
}))

useForm.getState().setName('Alice')
useForm.reset()
console.log(useForm.getState().name)  // ''
```

### useStore.getInitialState()

```ts
getInitialState(): T
```

Returns a deep clone of the state captured at creation (non-function values only). Useful for comparison or seeding a test fixture.

```ts
const initial = useCounter.getInitialState()
console.log(initial.count)  // 0
```

---

## batch

```ts
function batch<T>(fn: () => T): T
```

Coalesces multiple `setState` calls inside `fn` into a single listener notification. Without `batch`, each `setState` triggers a separate re-render. With `batch`, all updates flush together in a single microtask.

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `() => T` | Synchronous or async function containing multiple `setState` calls |

**Returns** The return value of `fn`. Also supports async functions, the flush happens after the returned promise resolves.

```ts

// Three updates, one re-render
batch(() => {
    store.setState({ step: 2 })
    store.setState({ label: 'Processing' })
    store.setState({ loading: true })
})
```

If `fn` throws, all updates inside the batch are rolled back. Listeners are not notified.

---

## shallow

```ts
function shallow<T>(a: T, b: T): boolean
```

Compares two values one level deep. Returns `true` when the top-level keys and their values match by `Object.is`. Pass it as the second argument to a selector to skip re-renders when a selected object holds the same fields.

```ts

// Re-renders only when name or email changes
const user = useStore((s) => ({ name: s.name, email: s.email }), shallow)
```

---

## Type exports

| Type | Description |
|------|-------------|
| `StateCreator<T>` | `(set: SetState<T>, get: GetState<T>) => T` |
| `SetState<T>` | `(partial: Partial<T> \| ((state: T) => Partial<T>)) => void` |
| `GetState<T>` | `() => T` |
| `Selector<T, U>` | `(state: T) => U` |
| `Listener<T>` | `(state: T, prevState: T) => void` |
| `Middleware<T>` | `(prevState: T, update: Partial<T>, next: (transformed: Partial<T>) => T) => void` |
| `Store<T>` | Raw store object interface (not the hook) |
| `UseStore<T>` | Hook function with store methods attached |
| `Computed<U>` | Return type of `store.computed()` |
| `EqualityFn<U>` | `(a: U, b: U) => boolean`. Selector equality function, as used by `shallow`. |
| `StoreOptions<T>` | `{ middleware?: Middleware<T>[]; persist?: PersistOptions }` |
| `PersistOptions` | `{ key?: string; file?: string; debounceMs?: number }` |

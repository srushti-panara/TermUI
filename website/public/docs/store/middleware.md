# Middleware

Middleware intercepts every `setState` call before it reaches the store. You can log changes, validate updates, transform data, or skip updates entirely.

Pass middleware as an array in `createStore`'s second argument:

```ts

const log: Middleware<{ count: number }> = (prev, update, next) => {
    next(update)
}

const useStore = createStore(
    (set) => ({ count: 0, increment: () => set((s) => ({ count: s.count + 1 })) }),
    { middleware: [log] }
)
```

Multiple middleware run left to right. Each one calls `next` to pass control to the next middleware in the chain. See [Writing custom middleware](#writing-custom-middleware) below.

## persist

Persist store state to the filesystem automatically. Pass a `persist` option to `createStore`:

```ts

const useSettings = createStore(
    (set) => ({
        theme: 'dark' as 'dark' | 'light',
        fontSize: 14,
        setTheme: (t: 'dark' | 'light') => set({ theme: t }),
    }),
    {
        persist: {
            key: 'app-settings',   // saves to <config-dir>/app-settings.json
            debounceMs: 200,       // wait 200ms after last change before writing
        },
    }
)
```

On startup the store reads the saved file and merges it over the initial state. Only non-function values are saved. Functions in the store (your actions) are never written to disk.

The config directory follows OS conventions:

| Platform | Path |
|----------|------|
| macOS | `~/Library/Application Support/` |
| Linux | `$XDG_CONFIG_HOME` or `~/.config/` |
| Windows | `%APPDATA%/` |

You can also pass an absolute `file` path directly:

```ts
const useStore = createStore(creator, {
    persist: {
        file: '/home/user/.myapp/state.json',
    },
})
```

**`PersistOptions`**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `key` | `string` |, | Filename stem; saves to `<config-dir>/<key>.json` |
| `file` | `string` |, | Absolute or relative path; takes precedence over `key` |
| `debounceMs` | `number` | `100` | Milliseconds to wait before writing after the last update |

## Writing custom middleware

A middleware is a function with this signature:

```ts
type Middleware<T> = (
    prevState: T,
    update: Partial<T>,
    next: (transformedUpdate: Partial<T>) => T,
) => void
```

- `prevState`: the state before this update
- `update`: the partial object being applied
- `next(transformedUpdate)`: call this to pass the update to the next middleware (or apply it to the store). You must call `next` or the update will be dropped.

The value returned by `next` is the new state after the update was applied.

### Example: block negative numbers

```ts

const clampPositive: Middleware<{ count: number }> = (prevState, update, next) => {
    const clamped = { ...update }
    if (typeof clamped.count === 'number' && clamped.count < 0) {
        clamped.count = 0
    }
    next(clamped)
}

const useCounter = createStore(
    (set) => ({
        count: 0,
        set: (n: number) => set({ count: n }),
    }),
    { middleware: [clampPositive] }
)
```

### Example: audit trail

```ts

const auditLog: string[] = []

const audit: Middleware<any> = (prevState, update, next) => {
    const nextState = next(update)
    auditLog.push(JSON.stringify({ ts: Date.now(), prev: prevState, next: nextState }))
}

const useStore = createStore(creator, { middleware: [audit] })
```

### Combining middleware

Pass multiple middleware in an array. They run left to right:

```ts
const useStore = createStore(creator, {
    middleware: [audit, clampPositive],
})
```

Each middleware calls `next` to hand off to the next one. The last call to `next` applies the update to the store.

## Notes

- Middleware that does not call `next` silently drops the update. This is intentional for some use cases (rate limiting, debouncing) but can be surprising.
- Middleware runs synchronously inside `setState`. Avoid blocking I/O inside middleware.
- The `persist` option works independently of the `middleware` array. Persistence happens after listeners are notified.

# useAsync

Load async data inside a component without writing the loading/error/data state yourself. `useAsync` fires the request when deps change, tracks loading state, stores the result, and cancels stale requests if a newer one comes in.

Think of it as a built-in `useQuery` for one-shot fetches. No external library needed.

## Installation

```bash
npm install @termuijs/jsx
```

## Basic usage

```tsx

function ProcessList() {
    const { data, loading, error, refetch } = useAsync(
        () => fetchProcesses(),
        []   // deps. empty means run once on mount
    )

    if (loading) return <Spinner label="Loading processes..." />
    if (error)   return <Text color="red">Error: {error.message}</Text>

    return (
        <Box flexDirection="column">
            {data.map((p) => (
                <Text key={p.pid}>{p.name}. {p.cpu}%</Text>
            ))}
        </Box>
    )
}
```

## Return value

| Field     | Type           | Description                           |
| --------- | -------------- | ------------------------------------- |
| `data`    | `T | null`     | Resolved value, or null while loading |
| `loading` | `boolean`      | True from call until resolve/reject   |
| `error`   | `Error | null` | Set if the async function threw       |
| `refetch` | `() => void`   | Manually trigger a new fetch          |

## Dependencies

The second argument is a dependency array with the same semantics as `useEffect`. The async function re-runs whenever any dep changes.

```tsx
function FileViewer({ path }) {
    // Re-loads whenever path changes
    const { data: content, loading } = useAsync(
        () => readFile(path),
        [path]
    )

    return loading
        ? <Spinner />
        : <Text>{content}</Text>
}
```

## Stale request prevention

`useAsync` uses an internal version counter. If deps change before the previous request finishes, the older response is silently discarded; only the latest request updates state.

This prevents race conditions when users navigate quickly.

```tsx
// Deps change rapidly. only the last response wins
function LogViewer({ filter }) {
    const { data: logs } = useAsync(
        () => searchLogs(filter),   // could be slow
        [filter]                     // changes as user types
    )
    // "loading" stays true until the current filter's request resolves.
    // Older, slower responses are thrown away.
}
```

## Manual refetch

Bind a key to `refetch` for refresh-on-demand:

```tsx
function Dashboard() {
    const { data, loading, refetch } = useAsync(fetchMetrics, [])

    useInput((key) => {
        if (key === 'r') refetch()
    })

    return (
        <Box>
            {loading && <Spinner />}
            <Text dim>Press r to refresh</Text>
            {data && <MetricsPanel data={data} />}
        </Box>
    )
}
```

## Polling (auto-refresh)

Combine `useAsync` with `useInterval` to poll at a fixed rate:

```tsx
function LiveMetrics() {
    const { data, loading, refetch } = useAsync(fetchMetrics, [])

    // Re-fetch every 2 seconds
    useInterval(refetch, 2000)

    return (
        <Box flexDirection="column">
            <Text dim>Updates every 2s {loading && '(refreshing...)'}</Text>
            {data && <MetricsPanel data={data} />}
        </Box>
    )
}
```

## Error handling

Any exception thrown inside the async function is caught and exposed as `error`. You can display it and offer a retry:

```tsx
function DataPanel() {
    const { data, loading, error, refetch } = useAsync(
        async () => {
            const res = await fetchData()
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            return res.json()
        },
        []
    )

    if (loading) return <Spinner label="Loading..." />
    if (error) {
        return (
            <Box flexDirection="column" gap={1}>
                <Text color="red">Failed: {error.message}</Text>
                <Text dim>Press r to retry</Text>
            </Box>
        )
    }

    return <DataView data={data} />
}
```

## TypeScript

The return type is inferred from the async function's resolved value. No explicit generics needed in most cases:

```ts
// Inferred: AsyncResult<Process[]>
const { data } = useAsync(() => fetchProcesses(), [])
//    data is Process[] | null

// Explicit if needed
const { data } = useAsync<Config>(() => loadConfig(), [])
//    data is Config | null
```

## How it works

Internally `useAsync` uses `useState` for the three state fields and `useEffect` to fire the async function when deps change.

A version counter ensures older responses are discarded if a newer request completes first.

```ts
// Simplified internals
function useAsync(fn, deps) {
    const [state, setState] = useState({ data: null, loading: true, error: null })
    const version = useRef(0)

    function run() {
        const myVersion = ++version.current
        setState(s => ({ ...s, loading: true, error: null }))
        fn().then(data => {
            if (version.current === myVersion)
                setState({ data, loading: false, error: null })
        }).catch(error => {
            if (version.current === myVersion)
                setState({ data: null, loading: false, error })
        })
    }

    useEffect(run, deps)
    return { ...state, refetch: run }
}
```

## See also

- **useEffect**: The hook useAsync builds on
- **useInterval**: Combine with useAsync for polling
- **@termuijs/data**: Reactive data streams for continuous updates
- **@termuijs/store**: Global state for shared async results

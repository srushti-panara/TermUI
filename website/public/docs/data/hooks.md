# Hooks

`@termuijs/data` exports a set of reactive hooks for fetching and streaming data inside TermUI components. Each hook manages its own lifecycle: it starts work on mount and cleans up on unmount. You never touch timers, sockets, or AbortControllers directly.

All hooks follow the same return shape:

```ts
{ data, error, loading }
```

`data` holds the latest result, `error` holds the last failure, and `loading` is true while the first result is in flight.

---

## useFetch

Fetches a URL and returns the parsed JSON. Subsequent calls to the same URL return a cached copy if the data is still fresh. Failed requests retry with exponential backoff.

```ts

function StatsPanel() {
    const { data, error, loading } = useFetch<{ users: number }>(
        'https://api.example.com/stats',
        { staleTime: 30_000, retry: 3, retryDelay: 500 }
    )

    if (loading) return <Text>Loading...</Text>
    if (error)   return <Text color="red">{error.message}</Text>

    return <Text>Users: {data.users}</Text>
}
```

### Signature

```ts
function useFetch<T = unknown>(
    url: string,
    options?: UseFetchOptions
): UseFetchResult<T>
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `staleTime` | `number` | `0` | How long (ms) a cached response stays fresh before a new request fires. |
| `retry` | `number` | `0` | Max retry attempts after the first failure. |
| `retryDelay` | `number` | `300` | Base backoff (ms). Delay doubles each attempt: `retryDelay * 2^attempt`. |
| `key` | `unknown` |, | When this value changes, a new fetch fires regardless of cache state. Useful for manual refresh buttons. |

### Return type

```ts
interface UseFetchResult<T> {
    data:    T | null;
    error:   Error | null;
    loading: boolean;
}
```

### Cache invalidation

Call `invalidate(url)` to clear the cache entry and trigger a fresh fetch on the next render:

```ts

invalidate('https://api.example.com/stats')
```

Or pass a changing `key` to the hook:

```ts
const [tick, setTick] = useState(0)
const { data } = useFetch('/api/data', { key: tick })

// In a key handler:
setTick(t => t + 1)  // triggers a new fetch
```

---

## useWebSocket

Connects to a WebSocket URL and returns the latest message, the connection state, and a `send` function. The hook reconnects automatically on close using exponential backoff, starting at 1s and capping at 10s.

```ts

function LiveFeed() {
    const { message, state, send } = useWebSocket('wss://stream.example.com/events')

    return (
        <col>
            <Text dim>Status: {state}</Text>
            <Text>{message ?? 'Waiting for data...'}</Text>
        </col>
    )
}
```

### Signature

```ts
function useWebSocket(url: string): UseWebSocketReturn
```

### Return type

```ts
type WebSocketState = 'connecting' | 'open' | 'closed' | 'error'

interface UseWebSocketReturn {
    message: string | null;     // Latest text message received
    state:   WebSocketState;    // Current connection state
    send:    (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
}
```

`send` is a no-op when the socket is not open, so you can call it without checking the state first.

### Reconnect behaviour

| Retry | Delay |
|---|---|
| 1st | 1s |
| 2nd | 2s |
| 3rd | 4s |
| 4th | 8s |
| 5th+ | 10s (cap) |

Retries reset to zero when the connection opens. Cleanup on unmount cancels any pending reconnect timer and closes the socket.

---

## useSSE

Subscribes to a Server-Sent Events endpoint and returns the latest event payload. The hook closes the `EventSource` on unmount or when the URL changes.

```ts

interface LogEvent { level: string; msg: string }

function LogStream() {
    const { data, error, loading } = useSSE<LogEvent>(
        '/api/log-stream',
        raw => JSON.parse(raw)   // optional parser
    )

    if (loading) return <Text dim>Connecting...</Text>
    if (error)   return <Text color="red">SSE error: {error.message}</Text>

    return <Text>[{data.level}] {data.msg}</Text>
}
```

### Signature

```ts
function useSSE<T = string>(
    url: string,
    parse?: (raw: string) => T
): UseSSEResult<T>
```

The `parse` function transforms the raw event string. When omitted, `data` is the raw string.

### Return type

```ts
interface UseSSEResult<T> {
    data:    T | null;
    error:   Error | null;
    loading: boolean;
}
```

`loading` stays `true` until the first message arrives. `error` is set if the `EventSource` fires an error event or if `EventSource` is unavailable in the environment.

---

## usePolling

Calls an async function on a fixed interval and exposes the result reactively. Unlike `useFetch`, you supply the function, so you can poll any async data source: a database, a local file, a CLI tool output, etc.

The hook supports pause, resume, and manual refresh without resetting state or restarting the timer.

```ts

async function fetchMetrics() {
    const res = await fetch('/api/metrics')
    return res.json() as Promise<{ rps: number }>
}

function MetricsPanel() {
    const { data, error, loading, paused, pause, resume, refresh } =
        usePolling(fetchMetrics, 3000)

    return (
        <col>
            <Text>RPS: {data?.rps ?? '--'}</Text>
            <Text dim>{paused ? 'Paused' : 'Live'}</Text>
        </col>
    )
}
```

### Signature

```ts
function usePolling<T>(
    fn:       () => Promise<T>,
    interval: number,
    deps?:    unknown[]
): UsePollingResult<T>
```

`deps` is an optional dependency array. When any value in `deps` changes, the hook re-runs `fn` immediately and restarts the interval. This works the same as the `deps` array in `useEffect`.

### Return type

```ts
interface UsePollingResult<T> {
    data:    T | null;
    error:   Error | null;
    loading: boolean;
    paused:  boolean;
    pause:   () => void;
    resume:  () => void;
    refresh: () => void;
}
```

`refresh()` fires `fn` immediately without waiting for the next interval tick and without affecting the timer schedule.

---

## useMutation

Sends data to an HTTP endpoint and tracks the in-flight state. Use this for POST, PUT, PATCH, or DELETE actions triggered by user input.

```ts

function CreateUserForm() {
    const { mutate, loading, error, data } = useMutation<{ id: string }>(
        '/api/users',
        'POST'
    )

    async function handleSubmit(name: string) {
        await mutate({ name })
    }

    return (
        <col>
            {error && <Text color="red">{error.message}</Text>}
            {data  && <Text color="green">Created user {data.id}</Text>}
        </col>
    )
}
```

### Signature

```ts
function useMutation<T = unknown>(
    url:    string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
): UseMutationReturn<T>
```

`method` defaults to `'POST'`.

### Return type

```ts
interface UseMutationReturn<T> {
    mutate:        (payload: unknown) => Promise<T>;
    reset:         () => void;
    data:          T | null;
    error:         Error | null;
    loading:       boolean;
    mutationCount: number;
}
```

`mutate` throws if the request fails, wrap it in try/catch if you want to handle the error imperatively. `reset()` clears `data`, `error`, and `loading` back to their initial values. `mutationCount` increments on each successful mutation, useful for triggering re-fetches in other hooks via the `key` option.

---

## useInfiniteQuery

Loads data page-by-page. The first page fetches on mount. You call `fetchNextPage()` to append the next page. When `getNextPageParam` returns `undefined`, `hasNextPage` becomes `false` and further calls are no-ops.

```ts

interface Page { items: string[]; cursor: string | null }

function LogList() {
    const { pages, loading, hasNextPage, fetchNextPage } = useInfiniteQuery<Page, string | null>({
        initialPageParam: null,
        queryFn: async (cursor) => {
            const url = cursor ? `/api/logs?cursor=${cursor}` : '/api/logs'
            const res = await fetch(url)
            return res.json()
        },
        getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
    })

    const allItems = pages.flatMap(p => p.items)

    return (
        <col>
            {allItems.map(item => <Text key={item}>{item}</Text>)}
            {hasNextPage && !loading && (
                <Text onPress={fetchNextPage}>Load more</Text>
            )}
        </col>
    )
}
```

### Signature

```ts
function useInfiniteQuery<T, P = number>(
    options: InfiniteQueryOptions<T, P>
): UseInfiniteQueryResult<T>
```

### Options

```ts
interface InfiniteQueryOptions<T, P> {
    queryFn:          (pageParam: P) => Promise<T>;
    initialPageParam: P;
    getNextPageParam: (lastPage: T, allPages: T[]) => P | undefined;
}
```

`getNextPageParam` receives the last fetched page and the full list of fetched pages. Return the param for the next page, or `undefined` to stop.

### Return type

```ts
interface UseInfiniteQueryResult<T> {
    pages:         T[];
    error:         Error | null;
    loading:       boolean;
    hasNextPage:   boolean;
    fetchNextPage: () => void;
}
```

Calling `fetchNextPage()` while a fetch is in flight is safe; it does nothing until the current request settles.

---

## useFileWatch

Watches a file or directory for changes using Node's `fs.watch`. The hook fires on every `rename` or `change` event and cleans up the watcher on unmount.

```ts

function ConfigWatcher() {
    const { data, error } = useFileWatch('/etc/myapp/config.json')

    return (
        <col>
            {error && <Text color="red">Watch error: {error.message}</Text>}
            {data  && <Text>File changed: {data.eventType} — {data.filename}</Text>}
        </col>
    )
}
```

### Signature

```ts
function useFileWatch(
    path:     string,
    options?: UseFileWatchOptions
): UseFileWatchResult
```

### Options

```ts
interface UseFileWatchOptions {
    persistent?: boolean;  // Keep process alive while watching (default: Node's default)
    recursive?:  boolean;  // Watch subdirectories (macOS and Windows only)
}
```

### Return type

```ts
interface FileWatchData {
    eventType: 'rename' | 'change';
    filename:  string | null;
}

interface UseFileWatchResult {
    data:    FileWatchData | null;
    error:   Error | null;
    loading: boolean;
}
```

`data` is `null` until the first change event. `loading` turns `false` after the first event or after an error.

---

## Quick reference

| Hook | Description | Default interval |
|---|---|---|
| `useFetch` | Fetch JSON with cache and retry | On mount |
| `useWebSocket` | Live WebSocket with auto-reconnect | Event-driven |
| `useSSE` | Server-Sent Events subscription | Event-driven |
| `usePolling` | Poll any async function | Your choice |
| `useMutation` | POST/PUT/PATCH/DELETE with state | On call |
| `useInfiniteQuery` | Page-by-page data loading | On demand |
| `useFileWatch` | Watch file or directory for changes | Event-driven |

## See also

- [System Monitoring](/docs/data/system-monitoring), CPU, memory, disk, network, processes, log tailing
- [Docker](/docs/data/docker), container list and live stats via `useDocker`
- [Database](/docs/data/database), connection health via `useDatabaseHealth`
- [@termuijs/data overview](/docs/data/overview), installation and the raw collector API

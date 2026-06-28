# memo() and batched updates

Two performance tools: `memo()` skips re-rendering a component when its props haven't changed. **Batched updates** collapse multiple `setState` calls into a single render cycle.

Most terminal apps won't need either. But if you're rendering big lists, polling data every second, or building deep component trees, they make a measurable difference.

## memo()

Wraps a component so it only re-renders when its props change. Under the hood it keeps a copy of the previous props and does a shallow comparison before each render.

If nothing changed, the cached output is returned immediately.

```tsx

// Basic. shallow prop comparison
const ProcessRow = memo(function ProcessRow({ pid, name, cpu, memory }) {
    return (
        <Box flexDirection="row" gap={2}>
            <Text dim>{pid}</Text>
            <Text>{name}</Text>
            <Text color={cpu > 0.8 ? 'red' : 'green'}>{(cpu * 100).toFixed(1)}%</Text>
            <Text>{memory}</Text>
        </Box>
    )
})
```

### Custom comparison

The second argument lets you supply your own equality check. Return `true` to skip the re-render, `false` to re-render.

```tsx
// Only re-render when the item's id changes
// (ignore expensive computed fields)
const ListItem = memo(
    function ListItem({ item }) {
        return <Text>{item.label}</Text>
    },
    (prev, next) => prev.item.id === next.item.id
)

// Skip re-render for expensive chart unless data version bumps
const CpuChart = memo(
    function CpuChart({ dataVersion, data }) {
        return <Sparkline data={data} />
    },
    (prev, next) => prev.dataVersion === next.dataVersion
)
```

### How shallow comparison works

The default comparison uses `Object.is` on each prop value. This means:

- Primitives (`string`, `number`, `boolean`): compared by value ✓
- Objects and arrays: compared by reference (same object = no re-render) ✓
- Inline objects `{ value: 1 }`: new reference every render → always re-renders ✗
- Inline arrow functions: same problem ✗

```tsx
// Bad. new object every render defeats memo
<Gauge options={{ showLabel: true }} />

// Good. stable reference
const GAUGE_OPTS = { showLabel: true }
<Gauge options={GAUGE_OPTS} />

// If dynamic, use useRef or useMemo to stabilize
function Dashboard() {
    const opts = useRef({ showLabel: true }).current
    return <Gauge options={opts} />
}
```

### API reference

| Argument    | Type                            | Description                             |
| ----------- | ------------------------------- | --------------------------------------- |
| `component` | `FC<P>`                         | The functional component to memoize     |
| `areEqual`  | `(prev: P, next: P) => boolean` | Optional. Return true to skip re-render |

`memo()` returns a new component with a `displayName` of `memo(YourComponent)` and an `_isMemo: true` flag. useful for debugging.

## Batched state updates

When multiple `setState` calls happen in the same event handler, TermUI batches them into a single re-render using `queueMicrotask`. This is automatic. you don't opt in, but you should understand it to reason about when renders happen.

```tsx
function Dashboard() {
    const [cpu, setCpu] = useState(0)
    const [memory, setMemory] = useState(0)
    const [net, setNet] = useState(0)

    useInterval(() => {
        const stats = getStats()

        // These three setState calls happen in the same tick.
        // Without batching: 3 renders.
        // With batching: 1 render. TermUI batches automatically.
        setCpu(stats.cpu)
        setMemory(stats.memory)
        setNet(stats.net)
    }, 1000)

    return (
        <Box flexDirection="column">
            <Gauge value={cpu} label="CPU" />
            <Gauge value={memory} label="MEM" />
            <Gauge value={net} label="NET" />
        </Box>
    )
}
```

### How it works

When any `setState` is called, TermUI schedules a flush via `queueMicrotask` rather than running the re-render synchronously.

Subsequent `setState` calls within the same microtask queue check whether a flush is already scheduled and skip scheduling another one.

The result: one render per "batch" no matter how many state updates triggered it.

```ts
// Internal mechanism. simplified
let flushScheduled = false

function scheduleRender() {
    if (!flushScheduled) {
        flushScheduled = true
        queueMicrotask(() => {
            flushScheduled = false
            runRender()    // single render pass
        })
    }
}
```

## Combining memo and batching

The two optimizations stack well. Batching reduces how often a component's parent re-renders; memo ensures that children only re-render when their specific slice of state changed.

```tsx
// Store slice: only update when cpu changes
const useCpuStore = createStore((set) => ({
    cpu: 0,
    memory: 0,
    updateAll: (stats) => set(stats),  // one set call, batched internally
}))

// Each widget only re-renders when its value changes
const CpuGauge = memo(function CpuGauge({ value }) {
    return <Gauge value={value} label="CPU" />
})

const MemGauge = memo(function MemGauge({ value }) {
    return <Gauge value={value} label="MEM" />
})

function Metrics() {
    const cpu = useCpuStore(s => s.cpu)
    const mem = useCpuStore(s => s.memory)

    // updateAll fires once per second.
    // Even if both values changed, each Memo child
    // only re-renders if its own prop changed.
    return (
        <Box flexDirection="column">
            <CpuGauge value={cpu} />
            <MemGauge value={mem} />
        </Box>
    )
}
```

## When to use memo()

Measure first, optimize second. That said, memo is worth adding when:

- The component does non-trivial work per render (e.g., data formatting)
- The component renders inside a high-frequency update loop (e.g., 10 Hz data refresh)
- The component is a list item rendered many times simultaneously
- You can guarantee stable prop references (no inline objects/arrays/functions)

Skip memo for simple, cheap components; the overhead of comparison exceeds the savings.

## Fiber identity reuse
The reconciler reuses existing fiber instances when a component type and position in the tree stay the same across re-renders. This is important for components with local state, they keep their `useState`, `useRef`, and effect state without any extra effort.
```ts
function Parent() {
    const [tick, setTick] = useState(0)
    useInterval(() => setTick(t => t + 1), 100)

    return (
        <col>
            {/* Spinner's fiber is reused on every tick — its animation frame
                doesn't reset even though Parent re-renders 10× per second */}
            <Spinner label={`Tick ${tick}`} />
        </col>
    )
}
```
Before fiber identity reuse, animated children (Spinner, Skeleton, StreamingText) would restart their animations on every parent re-render. Now they maintain their state as long as their position in the tree doesn't change.

This happens automatically, there's nothing to configure.
## See also

- **useState**: Hook fundamentals and update patterns
- **@termuijs/store**: Selectors that naturally limit re-renders
- **useAsync**: Async data loading without manual state
- **VirtualList**: Render 1M rows by only painting visible items

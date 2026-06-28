# Testing TermUI apps
TermUI ships a test renderer, `@termuijs/testing`, that lets you write fast, headless tests without a real terminal. This guide covers component tests, state, async, stores, context, and snapshots.
## Setup
```bash
bun add -d @termuijs/testing vitest
```
Vitest config:
```ts
// vitest.config.ts

export default defineConfig({
    test: {
globals: true,
    },
})
```
Add scripts to `package.json`:
```ts
{
    "scripts": {
"test": "vitest run",
"test:watch": "vitest"
    }
}
```
## The pattern
Render, query, interact, assert. Same four steps every time:
```ts

describe('MyComponent', () => {
    it('renders correctly', () => {
// 1. Render
const t = render(<MyComponent />)
// 2. Query
expect(t.getByText('Hello')).toBeTruthy()
// 3. Interact
t.fireKey('enter')
// 4. Assert
expect(t.getByText('Done')).toBeTruthy()
t.unmount()   // always clean up
    })
})
```
## State
Hook state persists between interactions within the same test, just like in a running app:
```ts
function Toggle() {
    const [on, setOn] = useState(false)
    useInput((key) => { if (key === 'space') setOn((v) => !v) })
    return <Text>{on ? 'ON' : 'OFF'}</Text>
}

it('toggles on space', () => {
    const t = render(<Toggle />)
    expect(t.getByText('OFF')).toBeTruthy()

    t.fireKey('space')
    expect(t.getByText('ON')).toBeTruthy()

    t.fireKey('space')
    expect(t.getByText('OFF')).toBeTruthy()

    t.unmount()
})
```
## Keyboard input
`fireKey` for special keys, `typeText` for strings:
```ts
// Special keys
t.fireKey('up')
t.fireKey('down')
t.fireKey('enter')
t.fireKey('escape')
t.fireKey('tab')
t.fireKey('backspace')
t.fireKey('delete')

// Modifiers
t.fireKey('c', { ctrl: true })   // Ctrl+C
t.fireKey('z', { ctrl: true })   // Ctrl+Z

// Typing
t.typeText('hello')
// same as:
['h','e','l','l','o'].forEach(ch => t.fireKey(ch))
```
## Lists and navigation
```ts
function Menu() {
    const [active, setActive] = useState(0)
    const items = ['Save', 'Open', 'Quit']

    useInput((key) => {
if (key === 'up')    setActive((i) => Math.max(0, i - 1))
if (key === 'down')  setActive((i) => Math.min(items.length - 1, i + 1))
    })

    return (
<Box flexDirection="column">
{items.map((label, i) => (
<Text key={i} inverse={i === active}>{label}</Text>
))}
</Box>
    )
}

it('navigates with arrow keys', () => {
    const t = render(<Menu />)
    const texts = t.getAllByType(Text)
    expect(texts).toHaveLength(3)

    t.fireKey('down')
    t.fireKey('down')
    t.fireKey('up')

    t.unmount()
})
```
## Async components
Let async effects settle before asserting. Use a small helper to flush the microtask queue:
```ts
// Helper. flush pending promises
const flushPromises = () => new Promise((r) => setTimeout(r, 0))

function DataPanel() {
    const { data, loading } = useAsync(() => fetchData(), [])
    if (loading) return <Text>Loading...</Text>
    return <Text>Items: {data.length}</Text>
}

it('shows data after load', async () => {
    vi.mocked(fetchData).mockResolvedValue([{ id: 1 }, { id: 2 }])

    const t = render(<DataPanel />)
    expect(t.getByText('Loading...')).toBeTruthy()

    // Let the promise resolve and state update
    await flushPromises()

    expect(t.getByText('Items: 2')).toBeTruthy()
    t.unmount()
})
```
## With @termuijs/store
Call `destroy()` in `afterEach` to reset subscribers between tests:
```ts
// counter.store.ts
export const useCounterStore = createStore((set) => ({
    count: 0,
    increment: () => set((s) => ({ count: s.count + 1 })),
}))

// counter.test.tsx

let t: TestInstance

beforeEach(() => {
    t = render(<CounterWidget />)
})
afterEach(() => {
    t.unmount()
    useCounterStore.destroy()
    useCounterStore.setState({ count: 0 })
})

it('increments via store', () => {
    useCounterStore.getState().increment()
    expect(t.getByText('Count: 1')).toBeTruthy()
})

it('reads initial state', () => {
    expect(t.getByText('Count: 0')).toBeTruthy()
})
```
## With context
Wrap the component in a Provider to test with different values:
```ts

function StatusBar() {
    const theme = useContext(ThemeCtx)
    return <Text color={theme.primary}>Ready</Text>
}

it('uses the provided theme', () => {
    const t = render(
<ThemeCtx.Provider value={{ primary: 'red', bg: 'black' }}>

</ThemeCtx.Provider>
    )
    expect(t.getByText('Ready')).toBeTruthy()
    t.unmount()
})

it('falls back to default without Provider', () => {
    const t = render(<StatusBar />)
    expect(t.getByText('Ready')).toBeTruthy()
    t.unmount()
})
```
## Snapshots
`lastFrame()` captures the full rendered grid: borders, padding, alignment. Good for catching unintended layout changes:
```ts
it('matches snapshot', () => {
    const t = render(<Dashboard />)
    expect(t.lastFrame()).toMatchSnapshot()
    t.unmount()
})

// Generated snapshot:
// [
//   "┌─────────────────────────────────┐",
//   "│ System Dashboard                │",
//   "│ CPU ████████████░░░░ 72%        │",
//   "│ MEM ████████░░░░░░░░ 58%        │",
//   "└─────────────────────────────────┘",
// ]
```
Update after intentional layout changes:
```ts
vitest --update-snapshots
```
## VirtualList
```ts

it('navigates through the list', () => {
    const onSelect = vi.fn()
    const list = new VirtualList({
totalItems: 100,
renderItem: (i) => `Item \${i}`,
onSelect,
    })

    expect(list.selectedIndex).toBe(0)

    list.selectNext()
    expect(list.selectedIndex).toBe(1)

    list.selectLast()
    expect(list.selectedIndex).toBe(99)

    list.confirm()
    expect(onSelect).toHaveBeenCalledWith(99)
})
```
## Tips
### Always unmount
Skipping `unmount()` leaves Fiber state behind. The next test might see stale hook values:
```ts
afterEach(() => t?.unmount())
```
### Query by text, not structure
`getByText` survives layout changes. Querying by widget type or index ties your tests to the implementation:
```ts
// Good
expect(t.getByText('5 items selected')).toBeTruthy()

// Fragile
const boxes = t.getAllByType(Box)
expect((boxes[2] as any)._children[0]).toBeTruthy()
```
### One behavior per test
If you're writing 10+ assertions in one test, split them up.
### Mock side effects
Network calls, file reads, timers. Mock them so tests stay fast and predictable:
```ts

vi.mock('./api', () => ({
    fetchData: vi.fn().mockResolvedValue([{ id: 1, name: 'test' }]),
}))

// Fake timers for interval components
vi.useFakeTimers()
t.fireKey('r')
vi.advanceTimersByTime(1000)
expect(t.getByText('Refreshed')).toBeTruthy()
vi.useRealTimers()
```
## See also

- **@termuijs/testing**: Full method reference
- **@termuijs/store**: destroy() for test cleanup
- **Vitest**: Mocking, fake timers, snapshots

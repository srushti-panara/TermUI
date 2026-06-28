# Testing
`@termuijs/testing` is a test renderer. It renders your JSX tree into an in-memory screen buffer, lets you query the output, simulate key presses, and check behavior.

No real terminal needed.
The design follows the same render → query → assert pattern as React Testing Library.
## Installation
```ts
npm install --save-dev @termuijs/testing vitest
```
## Quick start
```ts
// counter.test.tsx

function Counter() {
    const [count, setCount] = useState(0)
    useInput((key) => {
if (key === '+') setCount((c) => c + 1)
if (key === '-') setCount((c) => c - 1)
    })
    return <Text>Count: {count}</Text>
}

describe('Counter', () => {
    it('starts at zero', () => {
const t = render(<Counter />)
expect(t.getByText('Count: 0')).toBeTruthy()
t.unmount()
    })

    it('increments on +', () => {
const t = render(<Counter />)
t.fireKey('+')
expect(t.getByText('Count: 1')).toBeTruthy()
t.unmount()
    })

    it('decrements on -', () => {
const t = render(<Counter />)
t.fireKey('+')
t.fireKey('+')
t.fireKey('-')
expect(t.getByText('Count: 1')).toBeTruthy()
t.unmount()
    })
})
```
## render(element, options?)
Renders a JSX element into a virtual  `width × height` screen. Returns a `TestInstance`  with query and interaction methods.

Call `unmount()` when you're done to avoid hook state leaking between tests.
```ts

const t = render(<MyWidget />, {
    width:  80,   // default
    height: 24,   // default
})
```
### Options
| Option   | Default | Description    |
| -------- | ------- | -------------- |
| `width`  | `80`    | Screen columns |
| `height` | `24`    | Screen rows    |
## Querying
### getByText(text)
Finds the first widget whose text content includes the string. Returns `null` if nothing matches.
```ts
const widget = t.getByText('Hello')
expect(widget).not.toBeNull()

// Test absence
expect(t.getByText('Error')).toBeNull()
```
### getAllByText(text)
Returns all widgets containing the text. Useful when the same string shows up more than once:
```ts
const rows = t.getAllByText('active')
expect(rows).toHaveLength(3)
```
### getAllByType(Type)
Returns all widget instances of a given constructor:
```ts

const texts = t.getAllByType(Text)
expect(texts).toHaveLength(5)

const boxes = t.getAllByType(Box)
expect(boxes.length).toBeGreaterThan(0)
```
### lastFrame()
Returns the current screen as an array of strings (one per row). Trailing whitespace is trimmed. Works well with snapshot tests:
```ts
const frame = t.lastFrame()

// Check specific rows
expect(frame[0]).toBe('┌────────────┐')
expect(frame[1]).toContain('Dashboard')

// Snapshot test
expect(frame).toMatchSnapshot()
```
### toString()
Joins all non-empty screen rows into one string. For quick content checks when you don't care about line positions:
```ts
expect(t.toString()).toContain('Items: 5')
```
## Interaction
### fireKey(key, modifiers?)
Dispatches a key event to all `useInput` handlers.
```ts
// Basic keys
t.fireKey('enter')
t.fireKey('escape')
t.fireKey('tab')
t.fireKey('up')
t.fireKey('down')

// With modifiers
t.fireKey('c', { ctrl: true })    // Ctrl+C
t.fireKey('a', { shift: true })   // Shift+A
t.fireKey('f', { alt: true })     // Alt+F
```
### typeText(text)
Fires each character as a separate key event. Simulates typing:
```ts
const t = render(<SearchInput />)
t.typeText('hello world')
expect(t.getByText('hello world')).toBeTruthy()
```
## Lifecycle
### rerender(element?)
Re-renders the tree. Pass a new element to replace the root, useful for testing prop changes:
```ts
const t = render(<StatusBar status="loading" />)
expect(t.getByText('loading')).toBeTruthy()

t.rerender(<StatusBar status="done" />)
expect(t.getByText('done')).toBeTruthy()
expect(t.getByText('loading')).toBeNull()
```
### unmount()
Tears down all component instances and hook state. Call this at the end of each test.

With Vitest:
```ts

let t: TestInstance

beforeEach(() => { t = render(<MyWidget />) })
afterEach(() => t.unmount())
```
## Testing with @termuijs/store
Call `destroy()` on your stores in `afterEach` to clear subscribers between tests:
```ts

afterEach(() => {
    useCounterStore.destroy()
})
```
## Testing with context
Wrap the component in a Provider when it reads context:
```ts

const testTheme = { fg: 'white', bg: 'black' }

const t = render(
    <ThemeCtx.Provider value={testTheme}>

    </ThemeCtx.Provider>
)

expect(t.getByText('Ready')).toBeTruthy()
```
## Snapshot testing
Use `lastFrame()` with Vitest's `toMatchSnapshot` to lock in your terminal UI's visual output:
```ts
it('renders the dashboard layout', () => {
    const t = render(<Dashboard />)
    expect(t.lastFrame()).toMatchSnapshot()
    t.unmount()
})

// Snapshot file (auto-generated):
// [
//   "┌────────────────────────────────┐",
//   "│ System Dashboard               │",
//   "│ CPU ████████░░ 72%             │",
//   "│ MEM ██████░░░░ 58%             │",
//   "└────────────────────────────────┘",
// ]
```
## Async testing with waitFor
`waitFor` polls an assertion function until it stops throwing, or times out. Use it for components that update asynchronously:
```ts
it('shows result after async load', async () => {
    const t = render(<DataLoader />)

    // Poll until the text appears (default: 1s timeout, 10ms interval)
    await t.waitFor(() => {
        expect(t.getByText('42 records loaded')).toBeTruthy()
    })

    t.unmount()
})
```
| Option     | Default | Description                              |
| ---------- | ------- | ---------------------------------------- |
| `timeout`  | `1000`  | Max milliseconds to wait before throwing |
| `interval` | `10`    | How often to re-run the assertion (ms)   |

## Headless string snapshot with renderToString
`renderToString()` returns the current screen as a plain string with no ANSI escape codes. Use it for snapshot tests where you care about content but not position:
```ts
it('renders the header', () => {
    const t = render(<Dashboard />)
    const output = t.renderToString()

    expect(output).toContain('System Monitor')
    expect(output).toContain('CPU')
    expect(output).toMatchSnapshot()

    t.unmount()
})
```
Unlike `lastFrame()`, `renderToString()` is a flat string, lines are joined with newlines. It's easier to use in `toContain` assertions.
## Fiber-aware rerender
`rerender()` now preserves hook state across re-renders. It uses the reconciler's `reRenderComponent` internally, so `useState`, `useRef`, and context values survive:
```ts
it('keeps counter state on rerender', () => {
    const t = render(<Counter />)
    t.fireKey('+')
    t.fireKey('+')

    // State is preserved — count is still 2
    t.rerender()
    expect(t.getByText('Count: 2')).toBeTruthy()

    t.unmount()
})
```
Passing a new element to `rerender(el)` replaces the root component while still preserving any shared context state.
## fireKey dispatches to the full fiber tree
`fireKey` uses `collectInputHandlers` to walk the fiber tree and fire all registered `useInput` and `useKeymap` handlers, including ones in deeply nested child components:
```ts
it('child input handler fires', () => {
    const t = render(<ParentWithChildren />)

    // Fires handlers in Parent AND all children
    t.fireKey('enter')

    expect(t.getByText('submitted')).toBeTruthy()
    t.unmount()
})
```
## Full reference
| Method                  | Description                                                        |
| ----------------------- | ------------------------------------------------------------------ |
| `render(el, opts?)`     | Render into a virtual screen. Returns TestInstance.                |
| `t.getByText(text)`     | Find first matching widget, or null                                |
| `t.getAllByText(text)`  | Find all widgets containing the text                               |
| `t.getAllByType(Type)`  | Find all widgets of a constructor                                  |
| `t.lastFrame()`         | Screen rows as string[]                                            |
| `t.toString()`          | Screen as a single string                                          |
| `t.renderToString()`    | ANSI-free string snapshot of screen content                        |
| `t.fireKey(key, mods?)` | Simulate a key press, fires all handlers in fiber tree             |
| `t.typeText(text)`      | Type characters one by one                                         |
| `t.rerender(el?)`       | Re-render preserving hook state. Pass new element to replace root. |
| `t.waitFor(fn, opts?)`  | Poll assertion fn until it passes or times out                     |
| `t.unmount()`           | Clean up component state (only this instance, not the whole app)   |
| `t.container`           | The root Box widget                                                |
| `t.screen`              | The raw Screen buffer                                              |
## pressKey and pressKeys
`pressKey` is a cleaner alias for `fireKey`. `pressKeys` fires a sequence of keys one after another:
```ts
// Single key
t.pressKey('enter')
t.pressKey('c', { ctrl: true })

// Sequence of keys
t.pressKeys(['up', 'up', 'enter'])
```
Both accept the same modifier object as `fireKey`.

## getOutput
`getOutput()` returns the current screen content as a plain string. It is equivalent to `renderToString()`:
```ts
const t = render(<StatusBar status="ready" />)
expect(t.getOutput()).toContain('ready')
```

## Accessibility queries
### getByRole(role)
Finds the first widget whose `role` prop matches the given string. Returns `null` if nothing matches:
```ts
const btn = t.getByRole('button')
expect(btn).not.toBeNull()
```
### getByLabelText(label)
Finds the first widget whose `label` prop matches the given string. Returns `null` if nothing matches:
```ts
const input = t.getByLabelText('Search')
expect(input).not.toBeNull()
```

## Query variants
The query variants return `null` or an empty array instead of throwing when nothing matches. Use them when absence is a valid outcome:
### queryByText(text)
Returns the first matching widget, or `null`:
```ts
expect(t.queryByText('Error')).toBeNull()
```
### queryByType(Type)
Returns the first widget of a given constructor, or `null`:
```ts

expect(t.queryByType(ProgressBar)).toBeNull()
```
### queryAllByText(text)
Returns all matching widgets, or an empty array:
```ts
const warnings = t.queryAllByText('warning')
expect(warnings).toHaveLength(0)
```
### queryAllByType(Type)
Returns all widgets of a given constructor, or an empty array:
```ts

const texts = t.queryAllByType(Text)
expect(texts.length).toBeGreaterThan(0)
```

## frameSerializer
`frameSerializer` is a Vitest snapshot serializer. Register it once in your setup file to get bordered, readable snapshots from `lastFrame()`:
```ts
// vitest.setup.ts

expect.addSnapshotSerializer(frameSerializer)
```
After registration, snapshots of `lastFrame()` render as a bordered grid:
```
┌────────────────────────────────┐
│ System Dashboard               │
│ CPU ████████░░ 72%             │
│ MEM ██████░░░░ 58%             │
└────────────────────────────────┘
```
You can also call `formatFrame(frame)` directly to get the bordered string without going through the snapshot system.

## createFixture
`createFixture` returns a fixture object that tracks every `TestInstance` it creates. Call `cleanup()` in `afterEach` to unmount them all without repeating boilerplate:
```ts

const fix = createFixture({ width: 40, height: 10 })

afterEach(() => fix.cleanup())

it('shows loading state', () => {
    const t = fix.render(<DataLoader />)
    expect(t.getByText('Loading')).toBeTruthy()
})

it('shows result', async () => {
    const t = fix.render(<DataLoader />)
    await t.waitFor(() => {
        expect(t.getByText('Done')).toBeTruthy()
    })
})
```
Options passed to `createFixture` become the defaults for every `fix.render()` call. You can override them per-render.

## createVirtualClock
`createVirtualClock` gives you a software clock that advances only when you tell it to. Pair it with `timerPoolSubscribe` from `@termuijs/motion` to drive animations and intervals synchronously in tests:
```ts

const clock = createVirtualClock()
timerPoolSubscribe(clock) // replace real timers with the virtual clock

const t = render(<AnimatedSpinner />)

// Advance 500ms synchronously — fires all scheduled callbacks
clock.advance(500)

expect(t.getByText('Done')).toBeTruthy()

timerPoolUnsubscribeAll()
t.unmount()
```
The clock exposes three methods:

| Method              | Description                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `clock.now()`       | Current virtual time in milliseconds                                                          |
| `clock.advance(ms)` | Advance the clock by the given number of milliseconds, firing all due callbacks synchronously |
| `clock.tick()`      | Advance by 16ms (one animation frame)                                                         |

## fireResize
`fireResize(cols, rows)` replaces the screen buffer with a new one at the given dimensions and re-renders the widget tree. Use it to test components that respond to terminal size changes:
```ts
const t = render(<ResponsiveLayout />)

// Start at default 80×24
expect(t.getByText('full menu')).toBeTruthy()

// Shrink to a narrow terminal
t.fireResize(40, 20)
expect(t.getByText('compact menu')).toBeTruthy()
```

## See also

- **Vitest**: Recommended test runner
- **Guide: Testing**: Patterns for state, async, and snapshot tests
- **@termuijs/store**: Call `destroy()` in test cleanup

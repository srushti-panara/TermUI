

# Architecture

TermUI is a monorepo with 15 packages. Each one does one thing and can be used on its own or combined with the others.

Dependencies flow downward; nothing in the core layer imports from the layers above it.

## Package dependency graph

Four layers, each building on the one below:

```mermaid
graph TB
  subgraph L0["Application Layer"]
    ui["@termuijs/ui"]
    quick["@termuijs/quick"]
    create["create-termui-app"]
  end
  subgraph L1["Component Layer"]
    widgets["@termuijs/widgets"]
    jsx["@termuijs/jsx"]
    store["@termuijs/store"]
    testing["@termuijs/testing"]
    adapters["@termuijs/adapters"]
    store --> testing
  end
  subgraph L2["Feature Layer"]
    tss["@termuijs/tss"]
    router["@termuijs/router"]
    motion["@termuijs/motion"]
  end
  subgraph L3["Core Layer"]
    core["@termuijs/core\nScreen · Input · Events\nLayout · Style · App"]
    data["@termuijs/data\nCPU · Memory · Disk\nNetwork · Processes"]
  end
  L0 --> L1
  L1 --> L2
  L2 --> L3
```

## Render pipeline

Every frame follows this path:

### Layout

The layout engine computes positions and sizes using a flexbox algorithm. It handles `flexDirection`, `flexGrow`, `padding`, `margin`, `gap`, and alignment.

All computed values are rounded to integers since terminal cells are discrete.

### Style resolution

TSS variables and selectors are resolved. The theme engine substitutes `var(--name)` references and matches selectors against widget types and pseudo-classes like `:focus`.

### Buffer diff

The screen holds two buffers. The renderer diffs them cell by cell and only writes changed cells to stdout.

A full-screen update that touches 3 cells writes exactly 3 escape sequences.

## Event flow

`InputParser` decodes raw bytes into `KeyEvent` objects with key name, modifiers, and raw bytes. Events bubble from the focused widget up through its parents to the app level.

## Focus system
The focus system lives between `@termuijs/jsx` and `@termuijs/ui`. It provides a `FocusContext` that propagates the currently-focused widget ID down the tree via four hooks: `useFocusManager` (owns state), `useFocus` (reads/sets per widget), `useFocusTrap` (Tab capture for modals), and `useKeyboardNavigation` (arrow-key list navigation). See [Focus Management](/docs/jsx/focus) for details.

## State management

Three levels of state, each suited to different situations:

| Level           | API             | Good for                                                        |
| --------------- | --------------- | --------------------------------------------------------------- |
| Local           | `useState`      | State inside one component (cursor position, open/closed)       |
| Shared config   | `createContext` | Data that rarely changes and many components need (theme, user) |
| Global reactive | `createStore`   | Data that updates often and multiple components select from     |

## Dev server

The dev server runs your entry file in a child process via `Bun.spawn`. When a source file changes, it kills the old process and spawns a fresh one.

Clean slate on every reload, no stale module cache.


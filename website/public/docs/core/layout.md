# Layout engine

The layout engine computes positions and sizes for terminal widgets using a flexbox-inspired algorithm. You describe a tree of nodes with style constraints, and it figures out where everything goes.

## How it works

Build a tree with `createLayoutNode()`, then pass the root to `computeLayout()`. The engine modifies each node's `.computed` rect in place.

```ts

// Build the tree
const header  = createLayoutNode('header',  { height: 3 })
const content = createLayoutNode('content', { flexGrow: 1 })
const footer  = createLayoutNode('footer',  { height: 1 })

const root = createLayoutNode('root', {
    flexDirection: 'column',
    padding: 1,
}, [header, content, footer])

// Compute. mutates .computed on each node
computeLayout(root, 80, 24)

console.log(header.computed)
// → { x: 1, y: 1, width: 78, height: 3 }
console.log(content.computed)
// → { x: 1, y: 4, width: 78, height: 18 }
console.log(footer.computed)
// → { x: 1, y: 22, width: 78, height: 1 }
```

## Layout properties

| Property         | Type                                                                      | Default        | Description                                        |
| ---------------- | ------------------------------------------------------------------------- | -------------- | -------------------------------------------------- |
| `width`          | `number | string`                                                         | -              | Fixed width in columns, or percentage like `'50%'` |
| `height`         | `number | string`                                                         | -              | Fixed height in rows, or percentage                |
| `padding`        | `number | Edges`                                                          | `0`            | Inner spacing on all sides                         |
| `margin`         | `number | Edges`                                                          | `0`            | Outer spacing on all sides                         |
| `flexDirection`  | `'row' | 'column'`                                                        | `'column'`     | Main axis direction                                |
| `justifyContent` | `'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'` | `'flex-start'` | Main axis alignment                                |
| `alignItems`     | `'flex-start' | 'flex-end' | 'center' | 'stretch'`                        | `'stretch'`    | Cross axis alignment                               |
| `flexGrow`       | `number`                                                                  | `0`            | How much free space this node should absorb        |
| `flexShrink`     | `number`                                                                  | `1`            | How much this node shrinks when space is tight     |
| `gap`            | `number`                                                                  | `0`            | Space between children                             |
| `border`         | `BorderStyle`                                                             | `'none'`       | Border style (takes up space in the layout)        |
| `visible`        | `boolean`                                                                 | `true`         | Hidden nodes are skipped during layout             |

## Flex grow

Nodes with `flexGrow` split the remaining space proportionally. A node with `flexGrow: 2` gets twice the free space as a node with `flexGrow: 1`:

```ts
const left  = createLayoutNode('left',  { flexGrow: 1 })
const right = createLayoutNode('right', { flexGrow: 2 })
const row   = createLayoutNode('row', { flexDirection: 'row' }, [left, right])

computeLayout(row, 90, 10)
// left.computed.width  → 30  (1/3 of 90)
// right.computed.width → 60  (2/3 of 90)
```

All computed values are rounded to integers. Terminal cells can't have fractional positions.

## Constraint layout

For cases where flexbox isn't a good fit, `resolveConstraints` divides one axis into regions using explicit constraints. You pass the available length, a list of `Constraint` instances, an optional `Flex` alignment, and an optional gap. It returns one `{ offset, size }` per constraint:

```ts

const regions = resolveConstraints(
    80,
    [Constraint.Length(20), Constraint.Fill(), Constraint.Percentage(25)]
)
// → [{ offset: 0, size: 20 }, { offset: 20, size: 40 }, { offset: 60, size: 20 }]
```

Build a rectangle split by calling `resolveConstraints` once per axis. The result holds offsets and sizes along that axis. Constraint factories:

| Factory                    | What it produces                                                   |
| -------------------------- | ------------------------------------------------------------------ |
| `Constraint.Length(n)`     | Exactly n cells                                                    |
| `Constraint.Percentage(n)` | n% of available space (0 to 100)                                   |
| `Constraint.Min(n)`        | At least n cells                                                   |
| `Constraint.Max(n)`        | At most n cells                                                    |
| `Constraint.Fill(weight?)` | Fill remaining space. Multiple fill constraints share it by weight |

Pass a `Flex` value as the third argument to align regions when they don't fill the axis:

```ts

resolveConstraints(80, [Constraint.Length(20), Constraint.Length(20)], Flex.Center, 2)
```

`Flex` has `Start`, `Center`, `End`, `SpaceBetween`, and `SpaceAround`. The default is `Flex.Start`.

## Pos and Dim algebra

For overlay and dashboard layouts where elements need to express their own position relative to the parent, use the `Pos` and `Dim` helpers with `resolveLayoutVariables`:

```ts

const nodes = [
    {
        id: 'dialog',
        x: Pos.center(),
        y: Pos.center(),
        width: Dim.auto(),
        height: Dim.auto(),
        contentWidth: 40,
        contentHeight: 10,
        computed: { x: 0, y: 0, width: 0, height: 0 },
    }
]

resolveLayoutVariables(nodes, 80, 24)
// dialog.computed → { x: 20, y: 7, width: 40, height: 10 }
```

`Pos` factories:

| Factory                         | What it does                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------- |
| `Pos.center()`                  | Centers the element within its parent on the relevant axis                        |
| `Pos.anchorEnd(margin?)`        | Positions the element flush to the right or bottom edge, minus an optional margin |
| `Pos.align(alignment, groupId)` | Aligns multiple sibling elements as a group (`'start'`, `'center'`, or `'end'`)   |

`Dim` factories:

| Factory             | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `Dim.auto()`        | Sizes to the element's intrinsic content dimensions                 |
| `Dim.fill(margin?)` | Fills all available parent space, minus an optional margin          |
| `Dim.func(fn)`      | Calls a custom function with the layout context to compute the size |

`resolveLayoutVariables` detects dependency cycles and throws with the offending node ID.

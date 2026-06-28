# Springs
Spring animations in TermUI are physics-based. Instead of specifying a duration and easing curve, you describe how the spring feels: stiffness, damping, mass.

The math handles the rest. The result is motion that looks natural, with overshoot and settling that you don't have to hand-tune.
## Installation
```ts
npm install @termuijs/motion
```
## When to use springs
Springs shine in three scenarios:
- **Interrupted animations**: if a value is mid-flight when the target changes, a spring naturally continues from its current velocity.

Easing functions reset abruptly.
- **Physical UI**: panels that drag open, items that snap into place, progress bars that overshoot then correct.

The motion reads as intentional rather than programmed.
- **Chained motion**: one spring's output feeds another's input, producing cascaded motion without manual orchestration.
For fixed-duration, one-shot transitions (page reveals, fade-ins), [easings](/docs/motion/transitions) are simpler and more predictable.
## Basic usage
Springs work on a state machine. Each call to `stepSpring()` advances the simulation by one time step:
```ts

let state: SpringState = {
    value: 0,
    velocity: 0,
    target: 100,
    done: false,
}

// Advance one frame (dt in seconds, so 1/60 ≈ 16ms)
state = stepSpring(state, SPRING_PRESETS.default, 1 / 60)
console.log(state.value)  // → moving toward 100
console.log(state.done)   // → false (still animating)
```
## animateSpring helper
If you don't want to manage the loop yourself, `animateSpring()` runs the full animation and calls you on each frame:
```ts

animateSpring({
    from: 0,
    to: 40,
    config: SPRING_PRESETS.wobbly,
    onUpdate: (value) => {
screen.writeString(Math.round(value), 5, '●')
    },
    onComplete: () => {
console.log('settled')
    },
})
```
## Presets
| Preset     | Stiffness | Damping | How it feels                  |
| ---------- | --------- | ------- | ----------------------------- |
| `default`  | 170       | 26      | Balanced, general purpose     |
| `gentle`   | 120       | 14      | Soft and eased                |
| `wobbly`   | 180       | 12      | Bouncy, overshoots the target |
| `stiff`    | 210       | 20      | Snappy, settles fast          |
| `slow`     | 280       | 60      | Deliberate, smooth ramp       |
| `molasses` | 280       | 120     | Very slow, heavy feel         |
## Custom springs
Pass your own config instead of a preset. Higher stiffness = faster.

Higher damping = less bounce.
```ts
state = stepSpring(state, {
    stiffness: 300,
    damping: 10,
    mass: 2,
}, 1 / 60)
```
## Integration example
A progress bar that animates to real CPU load values using a spring:
```ts

const bar = new ProgressBar({ width: 30, label: 'CPU' })
let currentValue = 0

async function updateCpu() {
    const info = await cpu()
    const target = info.total / 100

    animateSpring({
from: currentValue,
to: target,
config: SPRING_PRESETS.stiff,
onUpdate: (v) => {
currentValue = v
bar.setValue(Math.max(0, Math.min(1, v)))
app.requestRender()
},
    })
}

const root = new Box({ padding: 1 })
root.addChild(new Text('System load', { bold: true }))
root.addChild(bar)

const app = new App(root, { fullscreen: true })
await app.mount()

setInterval(updateCpu, 1000)
```
## Spring presets reference
`springPreset(name)` returns a copy of a named preset so you can safely mutate it:
```ts

const cfg = springPreset('wobbly')
cfg.friction = 8   // more bounce, only affects this copy
```

If you pass an unknown name, it falls back to `'default'`.

## Layout transitions
`animateRect` animates a widget's position and size between two rectangles using spring physics. All four dimensions (x, y, width, height) run in parallel and call `onFrame` with a batched `Rect` on each tick.

```ts

const from: Rect = { x: 0, y: 0, width: 20, height: 5 }
const to: Rect   = { x: 10, y: 2, width: 40, height: 10 }

const cancel = animateRect(from, to, {
    config: 'stiff',
    onFrame: (rect) => {
        panel.setRect(rect)
        app.requestRender()
    },
    onComplete: () => console.log('layout settled'),
})

// Cancel early if needed
cancel()
```

`config` accepts a preset name string or a partial `SpringConfig` object.

## Additional spring presets (v0.1.6)
The table below reflects all presets in `SPRING_PRESETS` as of v0.1.6. The values use the internal field names (`tension`, `friction`, `mass`):

| Preset     | Tension | Friction | Mass | How it feels                  |
| ---------- | ------- | -------- | ---- | ----------------------------- |
| `default`  | 170     | 26       | 1    | Balanced, general purpose     |
| `gentle`   | 120     | 14       | 1    | Soft and eased                |
| `wobbly`   | 180     | 12       | 1    | Bouncy, overshoots the target |
| `stiff`    | 210     | 20       | 1    | Snappy, settles fast          |
| `slow`     | 280     | 60       | 1    | Deliberate, smooth ramp       |
| `molasses` | 280     | 120      | 1    | Very slow, heavy feel         |

Note: the `SpringConfig` type uses `tension` and `friction`, not `stiffness` and `damping`. Both control the same physics; the naming follows the internal Euler integration.

## See also

- [Transitions: easing functions, sequencing, and keyframes](/docs/motion/transitions)
- [Widgets: ProgressBar and other animatable components](/docs/widgets/overview)

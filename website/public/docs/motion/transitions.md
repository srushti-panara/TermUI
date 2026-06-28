# Easings & Transitions
Easing functions map a progress value (0 to 1) to a curved output. Pair them with a timer to animate position, opacity, or color interpolation.

Unlike springs, easing functions are time-based: you specify a duration and the curve does the rest.
## Usage
```ts

// All easings take a number 0–1 and return 0–1
easings.easeInOut(0.0)  // → 0
easings.easeInOut(0.5)  // → 0.5
easings.easeInOut(1.0)  // → 1
```
## Available easings
| Easing           | What it does                                    |
| ---------------- | ----------------------------------------------- |
| `linear`         | Constant speed. no curve                        |
| `easeIn`         | Starts slow, accelerates to end                 |
| `easeOut`        | Starts fast, decelerates to end                 |
| `easeInOut`      | Slow at both ends, fast in the middle           |
| `easeInQuad`     | Quadratic acceleration (t²)                     |
| `easeOutQuad`    | Quadratic deceleration                          |
| `easeInOutQuad`  | Quadratic ease in both directions               |
| `easeInCubic`    | Cubic acceleration curve (t³)                   |
| `easeOutCubic`   | Cubic deceleration curve                        |
| `easeInOutCubic` | Cubic ease in both directions                   |
| `easeInExpo`     | Exponential acceleration. very snappy start     |
| `easeOutExpo`    | Exponential deceleration. crisp landing         |
| `easeInBack`     | Slight overshoot at start before moving forward |
| `easeOutBack`    | Overshoots the target then settles back         |
## Guarantees
- `easing(0)` always returns `0`
- `easing(1)` always returns `1`
- Standard easings are monotonically increasing (no negative values)
- `easeInOut` variants are symmetric around `t = 0.5`
- `easeInBack` / `easeOutBack` may temporarily exceed `[0, 1]`
## Animation loop example
```ts

const duration = 500  // ms
const start = Date.now()

function animate() {
    const elapsed = Date.now() - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = easings.easeOutCubic(progress)

    // Move a dot across 40 columns
    const x = Math.round(eased * 40)
    screen.writeString(x, 5, '●')

    if (progress < 1) setTimeout(animate, 16)
}

animate()
```
## cubicBezier easing
`cubicBezier(x1, y1, x2, y2)` creates a custom easing function from two control points, the same format used by CSS `cubic-bezier()`. It returns an `EasingFn` you can pass anywhere an easing is accepted.

```ts

// CSS ease equivalent: cubic-bezier(0.25, 0.1, 0.25, 1)
const cssEase = cubicBezier(0.25, 0.1, 0.25, 1)

// Use it with transition()
transition({
    durationMs: 400,
    easing: cssEase,
    onFrame: (t) => bar.setValue(t),
})
```

## Sequencing animations
Three helpers in v0.1.6 let you chain and combine animations.

### sequence
Run animations one after another. Each runner receives a `done` callback; call it to start the next step.

```ts

const cancel = sequence([
    (done) => fadeIn(300, (t) => widget.setOpacity(t), done),
    (done) => slideIn(-20, 400, (offset) => widget.setX(offset), done),
], () => console.log('all done'))

// Cancel any time
cancel()
```

### parallel
Run animations at the same time. `onComplete` fires when the last one finishes.

```ts

const cancel = parallel([
    (done) => fadeIn(300, (t) => header.setOpacity(t), done),
    (done) => fadeIn(300, (t) => footer.setOpacity(t), done),
])
```

### repeat
Wrap any runner to repeat it a fixed number of times or forever. Pass `yoyo: true` to reverse direction on alternating passes.

```ts

const flashTwice = repeat(
    (done) => fadeIn(200, (t) => dot.setOpacity(t), done),
    { count: 2, yoyo: true }
)

// Use repeat() inside sequence() or parallel()
sequence([flashTwice])
```

Pass `count: Infinity` for an endless loop. Cancel by calling the function returned from `sequence` or `parallel`.

## Stagger
`stagger` starts a list of animations in parallel, each delayed by a fixed offset. Item 0 starts immediately, item 1 after `delayMs`, item 2 after `2 * delayMs`, and so on.

```ts

const rows = [row0, row1, row2]

const cancel = stagger(
    rows.map(row => (done) => fadeIn(300, (t) => row.setOpacity(t), done)),
    80,  // 80ms between each row
    () => console.log('all rows faded in'),
)
```

Returns a master cancel function that stops pending and active animations.

## interpolate and mapRange
Two helpers for mapping numeric values between ranges.

`mapRange` maps a value from one range to another, clamped by default:

```ts

// Map CPU percent (0–100) to a bar width (0–40 columns)
const width = mapRange(cpuPercent, 0, 100, 0, 40)

// Disable clamping to allow extrapolation
const extrapolated = mapRange(120, 0, 100, 0, 40, { clamp: false }) // → 48
```

`interpolate` is the same function with a tuple-based API:

```ts

const opacity = interpolate(scrollY, [0, 200], [1, 0])
```

## When to use springs instead
Easing functions are ideal for one-shot, fixed-duration transitions (page loads, reveals, progress fills). If your animation reacts to user input mid-flight or needs to look physical, use [springs](/docs/motion/springs) instead.

Springs handle interrupts gracefully; easing functions don't.
## See also

- [Springs: physics-based animation and layout transitions](/docs/motion/springs)
- [Widgets: animatable terminal components](/docs/widgets/overview)

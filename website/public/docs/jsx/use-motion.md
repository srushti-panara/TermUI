# useMotion
`useMotion` tells you whether animations are enabled in the current environment. Set `NO_MOTION=1` to disable all motion, useful for CI pipelines, screen readers, and accessibility.
## Usage
```ts

function LoadingBar() {
    const { reduced } = useMotion()

    if (reduced) {
        // Static fallback — no animation
        return <Text>[████████░░] Loading...</Text>
    }

    // Animated version
    return <ProgressBar value={progress} animated />
}
```
## Return value
| Property  | Type      | Description                      |
| --------- | --------- | -------------------------------- |
| `reduced` | `boolean` | `true` when `NO_MOTION=1` is set |

## The NO_MOTION flag
```bash
# Disable all animations
NO_MOTION=1 node app.js

# Enable (default)
node app.js
```
When `NO_MOTION=1`, the `caps.motion` property in `@termuijs/core` is `false`. All built-in animated widgets (`Spinner`, `Skeleton`, `StreamingText`) detect this and switch to their static rendering path automatically. `useMotion` is for your own custom animations.
## Pattern: guarding timer-based animations
```ts
function PulsingBadge() {
    const { reduced } = useMotion()
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        if (reduced) return   // no animation in reduced-motion mode

        const unsub = timerPoolSubscribe(500, () => {
            setVisible((v) => !v)
        })
        return unsub
    }, [reduced])

    return visible ? <Text bold>● LIVE</Text> : <Text dim>● LIVE</Text>
}
```
## How it interacts with @termuijs/motion
When `NO_MOTION=1`, `animateSpring()` and `transition()` from `@termuijs/motion` call their completion callbacks immediately instead of animating. The app reaches the final state in one frame:
```ts

// With NO_MOTION=1, this fires onFrame(100) then onComplete() immediately
animateSpring({ from: 0, to: 100 },
    (v) => setWidth(v),
    () => setAnimating(false)
)
```
You don't need to check `useMotion()` yourself when using `@termuijs/motion`, it handles the flag internally.
## See also

- [Springs](/docs/motion/springs), spring physics animations
- [Transitions](/docs/motion/transitions), fade, slide, and timing-based transitions
- [Accessibility & caps flags](/docs/guides/accessibility), full docs on NO_MOTION, NO_UNICODE, NO_COLOR

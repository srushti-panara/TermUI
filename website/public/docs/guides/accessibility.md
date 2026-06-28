# Accessibility & caps Flags
TermUI apps run in diverse environments, CI pipelines, remote SSH sessions, accessibility tools, and terminals that don't support unicode or colors. The `caps` object tells your app what the current environment supports.
## The caps object
```ts

caps.unicode  // boolean — false when NO_UNICODE=1
caps.motion   // boolean — false when NO_MOTION=1
caps.color    // boolean — false when NO_COLOR=1
```
These are read once at startup from environment variables. They're plain booleans, check them anywhere in your code.
## Environment variables
| Variable       | Sets                   | When to use                                                                                |
| -------------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| `NO_UNICODE=1` | `caps.unicode = false` | CI environments, PuTTY, Windows cmd.exe, any terminal with incomplete Unicode support      |
| `NO_MOTION=1`  | `caps.motion = false`  | Reduced motion preference, screen readers, recording terminal output                       |
| `NO_COLOR=1`   | `caps.color = false`   | Log files, piped output, color-blind users, any context where ANSI colors break the output |

```bash
# Run without unicode, motion, or colors (good for CI)
NO_UNICODE=1 NO_MOTION=1 NO_COLOR=1 bun app.ts

# Run your tests with the same constraints
NO_UNICODE=1 NO_MOTION=1 bun test
```
## Writing ASCII fallbacks
When you use custom unicode characters in your own widgets or components, guard them with `caps.unicode`:
```ts

// Common fallback pairs
const check  = caps.unicode ? '✓'  : '[OK]'
const cross  = caps.unicode ? '✗'  : '[X]'
const warn   = caps.unicode ? '⚠'  : '[!]'
const info   = caps.unicode ? 'ℹ'  : '[i]'
const bullet = caps.unicode ? '●'  : '*'
const arrow  = caps.unicode ? '▶'  : '>'
const bar    = caps.unicode ? '█'  : '#'
const empty  = caps.unicode ? '░'  : '.'
```
The same pattern applies to box-drawing characters used in custom borders or dividers.
## Writing motion fallbacks
For animations built with `setInterval` or `timerPoolSubscribe`:
```ts

function startAnimation() {
    if (!caps.motion) {
        // Render final state immediately
        setFrame(FINAL_FRAME)
        return () => {}   // no-op cleanup
    }

    const unsub = timerPoolSubscribe(100, tick)
    return unsub
}
```
Alternatively, use the `useMotion` hook in JSX components:
```ts

function Indicator() {
    const { prefersReducedMotion } = useMotion()

    useEffect(() => {
        if (prefersReducedMotion) return
        const unsub = timerPoolSubscribe(500, blink)
        return unsub
    }, [prefersReducedMotion])

    return <Text>●</Text>
}
```
## Built-in widget support
All built-in TermUI widgets respect the caps flags automatically, you don't need to add guards when using them:
| Widget        | NO_UNICODE                     | NO_MOTION                      |
| ------------- | ------------------------------ | ------------------------------ |
| Spinner       | ASCII frames `|/-\`            | Static char, no animation      |
| ProgressBar   | `#` / `.` instead of `█` / `░` | N/A (static)                   |
| Skeleton      | Static block                   | Static block, no pulse/shimmer |
| Gauge         | `#` / `.` bar chars            | N/A                            |
| Sparkline     | `1`–`8` digits                 | N/A                            |
| StreamingText | `_` cursor                     | Full text shown immediately    |
| HeatMap       | `. : # @` shading              | N/A                            |
| LineChart     | `* / \ -` plot chars           | N/A                            |
| StatusMessage | `[OK]`/`[X]` icons             | N/A                            |
| Banner        | Plain border chars             | N/A                            |

## WCAG color contrast utilities
`@termuijs/core` includes utilities for checking WCAG color contrast ratios:
```ts

const fg = parseColor('#ffffff')
const bg = parseColor('#0a0a0f')

const ratio = contrastRatio(fg, bg)   // → 18.1 (a good ratio)
wcagLevel(ratio)                      // → 'AAA' (≥ 7:1 for normal text)
```
WCAG levels:
| Level | Normal text | Large text (≥ 18pt bold) |
| ----- | ----------- | ------------------------ |
| AA    | ≥ 4.5:1     | ≥ 3:1                    |
| AAA   | ≥ 7:1       | ≥ 4.5:1                  |

Use `validateThemeContrast` to check a theme's color pairs before shipping. It returns the pairs that fall below AA:
```ts

const failures = validateThemeContrast(nordTheme)
console.log('Nord contrast failures:', failures)
```
## Recommended CI configuration
Add this to your test script to catch unicode/motion regressions early:
```bash
# package.json
{
  "scripts": {
    "test:a11y": "NO_UNICODE=1 NO_MOTION=1 vitest run"
  }
}
```
This runs your full test suite with the most restrictive caps settings, the same environment a developer might use over SSH or in a bare Linux container.
## See also

- [useMotion](/docs/jsx/use-motion), hook for guarding custom animations
- [Core: String Utilities](/docs/core/unicode), `caps` object reference and string width helpers

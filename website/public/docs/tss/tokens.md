# Theme Tokens
Theme tokens are plain JavaScript objects, `Record<string, string>`, mapping CSS variable names to values. They're the lightweight alternative to TSS strings when you want to read colors programmatically rather than apply them through selectors.
## Available token sets
`@termuijs/tss` exports a predefined token object for each named theme:
| Export            | Theme                   |
| ----------------- | ----------------------- |
| `draculaTheme`    | Dracula palette         |
| `nordTheme`       | Nord arctic blues       |
| `catppuccinTheme` | Catppuccin warm pastels |
| `monokaiTheme`    | Monokai syntax colors   |
| `solarizedTheme`  | Solarized classic       |
| `tokyoNightTheme` | Tokyo Night deep blues  |
| `oneDarkTheme`    | One Dark by Atom        |

```ts

// Read individual color values
const primaryColor = draculaTheme['--primary']   // '#bd93f9'
const bgColor      = nordTheme['--bg']           // '#2e3440'
```
## ThemeTokens type
```ts

const myTokens: ThemeTokens = {
    '--primary': '#7c3aed',
    '--bg': '#0a0a0f',
    '--text': '#f1f5f9',
    '--border-color': '#1e293b',
    '--border-focus': '#7c3aed',
    '--error': '#ef4444',
    '--success': '#10b981',
    '--warning': '#f59e0b',
}
```
## tokensToTSS
Converts a token object into a TSS `@theme` block string. Use this when you want to define colors in JavaScript and then load them into the `ThemeEngine` for selector-based styling:
```ts

const engine = new ThemeEngine()

// Convert token object → TSS string, then load
const nordTSS = tokensToTSS('nord', nordTheme)
engine.load(nordTSS)
engine.setTheme('nord')

// Now widgets using var(--primary) get Nord's cyan
```
The output is a valid TSS string:
```ts
@theme nord {
  --primary: #88c0d0;
  --bg: #2e3440;
  --text: #eceff4;
  ...
}
```
## When to use tokens vs TSS strings
| Use case                                         | Approach                                  |
| ------------------------------------------------ | ----------------------------------------- |
| Read a color value in component code             | Token object, `draculaTheme['--primary']` |
| Style widgets through selectors (`.btn:focused`) | TSS string, load with `engine.load()`     |
| Define colors in JS, use in TSS selectors        | `tokensToTSS()` to bridge both worlds     |
| Pass colors to a widget's `color` prop directly  | Token object, extract the hex string      |

## Detecting system dark/light
The `detectDark()` utility returns `true` when the terminal reports a dark background color (via OSC query):
```ts

const tokens = detectDark() ? draculaTheme : solarizedTheme
engine.load(tokensToTSS('auto', tokens))
engine.setTheme('auto')
```
`AutoThemeProvider` does this automatically if you'd rather not wire it up manually.

## See also

- [Built-in Themes](/docs/tss/themes), full list of themes + `AutoThemeProvider`
- [TSS Overview](/docs/tss/overview), selector syntax and ThemeEngine API

# Built-in Themes
`@termuijs/tss` ships twelve built-in themes and a runtime theme switcher. All themes use the same CSS variable names so widgets styled against `var(--primary)` work with every theme.
## Available themes
| Name             | Character                                                                            | Primary Color |
| ---------------- | ------------------------------------------------------------------------------------ | ------------- |
| `default`        | Dark background, cyan/green accents, clean terminal aesthetic                        | cyan          |
| `cyberpunk`      | Neon magenta and cyan on deep navy, high contrast                                    | #ff00ff       |
| `nord`           | Arctic blues and muted grays, easy on the eyes                                       | #88c0d0       |
| `dracula`        | Deep purple background with pastel pink, green, and yellow accents                   | #bd93f9       |
| `gruvbox`        | Warm earthy browns with muted greens, blues, and yellows                             | #458588       |
| `catppuccin`     | Warm pastels on dark, soft and legible                                               | #cba6f7       |
| `solarized`      | Ethan Schoonover's classic: yellow, orange, blue on warm base                        | #268bd2       |
| `tokyo-night`    | Soft blues and purples on a near-black background                                    | #7aa2f7       |
| `solarizedLight` | Solarized palette on a warm light base                                               | #268bd2       |
| `highContrast`   | Pure black background with white text and vivid accent colors for maximum legibility | #00ffff       |
| `everforest`     | Muted greens and soft accents on a dark base                                         | #a7c080       |
| `rose-pine`      | Dusty rose, pine green, and gold on a deep indigo base                               | #c4a7e7       |

## Loading a built-in theme
```ts

const engine = new ThemeEngine()
engine.load(BUILTIN_THEMES['dracula'])
engine.setTheme('dracula')
```
`BUILTIN_THEMES` is a `Record<string, string>` mapping theme names to TSS strings. You can load multiple at once:
```ts
// Load all built-ins at once

engine.load(getAllBuiltinThemes())
```
## useTheme hook
`useTheme` gives JSX components access to the active theme and the ability to switch:
```ts

function ThemeSelector() {
    const { theme, setTheme, availableThemes } = useTheme()

    return (
        <col>
            <Text>Active: {theme}</Text>
            {availableThemes.map((name) => (
                <Text key={name} bold={name === theme} onClick={() => setTheme(name)}>
                    {name}
                </Text>
            ))}
        </col>
    )
}
```
### Return value
| Property          | Type                     | Description              |
| ----------------- | ------------------------ | ------------------------ |
| `theme`           | `string`                 | Name of the active theme |
| `setTheme`        | `(name: string) => void` | Switch themes at runtime |
| `availableThemes` | `string[]`               | All loaded theme names   |

## AutoThemeProvider
`AutoThemeProvider` detects the terminal's background color via an OSC escape query and picks the closest built-in theme automatically. Useful when you don't want to force a specific theme on users with custom terminal colors.
```ts

function Root() {
    return (
        <AutoThemeProvider fallback="dracula">

        </AutoThemeProvider>
    )
}
```
### Props
| Prop       | Type          | Default      | Description                                                       |
| ---------- | ------------- | ------------ | ----------------------------------------------------------------- |
| `fallback` | `string`      | `'default'`  | Theme to use if detection fails                                   |
| `engine`   | `ThemeEngine` | Auto-created | Provide an existing engine if you've already loaded custom themes |

The provider wraps all descendant components in a `ThemeContext`, so `useTheme()` works anywhere below it.
## Defining a custom theme
Write a TSS string with your own `@theme` block:
```ts
const mytheme = `
@theme midnight {
  --primary: #a78bfa;
  --bg: #0f0f1a;
  --surface: #1a1a2e;
  --text: #e2e8f0;
  --text-muted: #64748b;
  --border: single;
  --border-color: #334155;
  --border-focus: #a78bfa;
  --error: #f87171;
  --success: #34d399;
  --warning: #fbbf24;
}
`

engine.loadAll([getAllBuiltinThemes(), mytheme])
engine.setTheme('midnight')
```
## CSS variable reference
All built-in themes define these variables. Widgets use them via `var(--name)`:
| Variable         | Purpose                                               |
| ---------------- | ----------------------------------------------------- |
| `--primary`      | Main accent color, borders, highlights, active states |
| `--secondary`    | Secondary accent                                      |
| `--bg`           | Application background                                |
| `--surface`      | Panel and card backgrounds                            |
| `--text`         | Primary text color                                    |
| `--text-muted`   | Dimmed text, placeholders, hints                      |
| `--border`       | Border style (`single`, `double`, `round`)            |
| `--border-color` | Inactive border color                                 |
| `--border-focus` | Border color when focused                             |
| `--error`        | Error state                                           |
| `--success`      | Success state                                         |
| `--warning`      | Warning state                                         |

## See also

- [TSS Overview](/docs/tss/overview), selector syntax, pseudo-classes, engine API
- [Theme Tokens](/docs/tss/tokens), programmatic token objects and the tokensToTSS bridge

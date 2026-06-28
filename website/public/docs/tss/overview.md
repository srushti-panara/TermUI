# TSS: Terminal Style Sheets
`@termuijs/tss` brings CSS-like theming to terminal apps. Define variables in named themes, write selectors with pseudo-classes, and swap themes at runtime without restarting the app.
## Installation
```ts
npm install @termuijs/tss
```
## Syntax
TSS files look like CSS but target terminal widgets instead of HTML elements:
```ts
@theme default {
  --primary: #00ff88;
  --bg: #0a0a0f;
  --text: #e8e8f0;
  --border: #2a2a45;
}

.container {
  border-color: var(--border);
  padding: 1;
}

.container:focused {
  border-color: var(--primary);
}
```
## Selector syntax
TSS supports a subset of CSS selectors adapted for terminal widget trees:
| Selector         | Matches                            |
| ---------------- | ---------------------------------- |
| `.name`          | Widget with `className="name"`     |
| `Box`            | All Box widget instances           |
| `Box {'>'} Text` | Text that is a direct child of Box |
| `.panel Text`    | Text anywhere inside `.panel`      |
| `.btn:hover`     | Widget in hover state              |
| `.btn:focused`   | Widget with keyboard focus         |
| `.btn:disabled`  | Widget with `disabled: true`       |
| `.btn:active`    | Widget being pressed               |
`resolveStyle(widgetType, className?, pseudo?)` takes the widget type, an optional class name, and an optional pseudo state string:
```ts
engine.resolveStyle('Box', 'btn', 'focused')
// → { borderColor: '#00ff88', ... }
```
## Color formats
TSS accepts any terminal-compatible color notation:
```ts
@theme custom {
  --a: #00ff88;           /* hex */
  --b: rgb(0, 255, 136);  /* rgb() */
  --c: green;             /* ANSI named color */
  --d: 46;                /* 256-color index */
}
```
Named colors map to ANSI 16-color codes. The terminal renderer picks the closest match when the terminal doesn't support truecolor.
## ThemeEngine
```ts

const engine = new ThemeEngine()

// Load from a TSS string
engine.load(tssString)

// Or load multiple sources at once
engine.loadAll([baseTheme, customOverrides])

// Switch the active theme
engine.setTheme('cyberpunk')

// Read a variable
engine.getVariable('--primary')  // → '#ff00ff'

// Resolve styles for a widget type, class, and pseudo state
const styles = engine.resolveStyle('Box', 'container', 'focused')
// → { borderColor: '#ff00ff', padding: 1 }

// Apply resolved styles to a widget
widget.applyStyles(styles)

// React to theme changes
engine.onChange(() => {
    // re-resolve and re-apply styles here
    widget.applyStyles(engine.resolveStyle('Box', 'container'))
    app.requestRender()
})
```
## Error handling
TSS is forgiving by design; unknown selectors and missing variables degrade gracefully:

- A selector that matches no widget produces an empty style object; no error is thrown.- A `var(--unknown)` reference resolves to `undefined`. The property is omitted from the resolved style object.- If `setTheme(name)` is called with a name that doesn't exist, the engine keeps the previous theme active and emits a warning to stderr.- Parse errors in a `load()` call throw a `TSSParseError` with a line number and message.

Subsequent `load()` calls continue to work.
```ts
try {
    engine.load(userTSSInput)
} catch (err) {
    if (err instanceof TSSParseError) {
console.error('Theme parse error on line', err.line, ':', err.message)
    }
}
```
## Built-in themes
Twelve themes ship with the package as TSS strings in `BUILTIN_THEMES`.
```ts

engine.load(BUILTIN_THEMES.default)
```
| Theme            | Description                                     |
| ---------------- | ----------------------------------------------- |
| `default`        | Dark background with cyan accents               |
| `cyberpunk`      | Neon magenta and cyan on deep navy              |
| `nord`           | Arctic, muted blues and grays                   |
| `dracula`        | Deep purple with pastel accents                 |
| `gruvbox`        | Warm earthy browns with muted accents           |
| `catppuccin`     | Warm pastel palette                             |
| `solarized`      | Ethan Schoonover's solarized colors             |
| `tokyo-night`    | Soft blues and purples on near-black            |
| `solarizedLight` | Solarized palette on a warm light base          |
| `highContrast`   | Pure black with white text and vivid accents    |
| `everforest`     | Muted greens on a soft dark base                |
| `rose-pine`      | Dusty rose, pine green, and gold on deep indigo |

See [Built-in Themes](/docs/tss/themes) for the full theme guide including `AutoThemeProvider` and runtime switching with `useTheme()`.
## Hot-reload with TSSWatcher
During development, the watcher picks up `.tss` file changes and reloads automatically:
```ts

const watcher = new TSSWatcher(engine, {
    dir: './themes',
    onReload: (filename) => console.log('Reloaded', filename),
})
watcher.start()
```
## Mixins
Mixins let you extract reusable property groups and include them in any rule. Define a mixin with `@mixin`, then pull it in with `@include`. Rule-level properties override mixin properties when names conflict.
```ts
@mixin focused-border {
  border-color: var(--primary);
  border-style: bold;
}

.panel {
  border-color: var(--border);
}

.panel:focused {
  @include focused-border;
}
```
A rule can include multiple mixins. The engine expands all includes at load time, so `resolveStyle()` sees a flat property map.

## calc() expressions
Use `calc()` to compute numeric property values from variables and arithmetic. Supports `+`, `-`, `*`, `/`, and nested parentheses.
```ts
.sidebar {
  width: calc(var(--sidebar-width) - 2);
}

.content {
  width: calc(var(--total-width) - var(--sidebar-width) - 4);
}
```
Variables used inside `calc()` must resolve to numbers. The engine throws at resolution time if a variable is non-numeric.

## @import
Split large theme files into partials and import them. Paths are relative to the importing file. Circular imports are detected and skipped.
```ts
@import './base.tss';
@import './tokens.tss';
```
Supported extensions: `.tss`, `.json`, `.yaml`, `.yml`. Path traversal outside the base directory is blocked automatically.

## Size media queries
Wrap rules in `@media` blocks to apply styles only when the terminal meets a size condition. Units are character columns and rows.
```ts
@media (min-width: 120) {
  .panel { width: 60; }
}

@media (min-width: 80) and (max-height: 40) {
  .sidebar { width: 20; }
}
```
Supported features: `min-width`, `max-width`, `min-height`, `max-height`. An unrecognized feature causes that block to not apply.

## Nested rules
Write child selectors inside a parent block using `&`. The `&` expands to the parent selector at compile time.
```ts
.card {
  border-color: var(--border);

  &:focused {
    border-color: var(--primary);
  }

  & Text {
    color: var(--text);
  }
}
```
Nesting is single-level. Deeply nested blocks are not supported.

## Runtime variable overrides
Override a theme variable at runtime without reloading the full theme. The engine re-resolves dependent rules and fires `onChange` listeners.
```ts
engine.setVariable('--primary', '#ff0000')

// Restore the theme-defined value
engine.clearVariable('--primary')
```
Overrides persist until cleared or until `setTheme()` is called, which resets all overrides to the new theme's values.

## Color functions
Three color manipulation functions are available inside `@theme` variable definitions: `lighten`, `darken`, and `alpha`.
```ts
@theme custom {
  --primary: #336699;
  --primary-dim: alpha(#336699, 0.5);
  --primary-light: lighten(#336699, 0.2);
  --primary-dark: darken(#336699, 0.2);
}
```
Amounts accept a plain decimal (`0.2`) or a percentage string (`20%`). `alpha()` returns an `rgba()` string; `lighten` and `darken` return hex.

## See also

- [Built-in Themes](/docs/tss/themes), full theme list, AutoThemeProvider, useTheme hook
- [Theme Tokens](/docs/tss/tokens), JS token objects and tokensToTSS bridge
- [Getting Started. installation and setup](/docs/getting-started/installation)
- [Core / Style & Colors. built-in color utilities](/docs/core/style)

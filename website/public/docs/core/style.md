# Style and colors

Styles in TermUI are plain objects that describe how text looks: colors, bold, dim, and so on. There are no class instances to manage.

You build a default, merge overrides in, and the renderer takes care of ANSI output.

## The basics

```ts

// Start with defaults (column layout, no decorations)
const base = defaultStyle()
// base.flexDirection === 'column'
// base.bold === false

// Override specific fields
const heading = mergeStyles(base, { bold: true, fg: parseColor('cyan') })
// heading.bold === true, heading.fg === { type: 'named', name: 'cyan' }
```

## Colors

Colors go through `parseColor()`, which accepts named colors, hex strings, or RGB triples.

```ts

// Named
parseColor('red')
// → { type: 'named', name: 'red' }

// Hex
parseColor('#ff6600')
// → { type: 'hex', hex: '#ff6600' }

// RGB
parseColor('rgb(255, 102, 0)')
// → { type: 'rgb', r: 255, g: 102, b: 0 }
```

## Named colors

Standard ANSI colors that work in every terminal:

```ts
'black' | 'red' | 'green' | 'yellow' | 'blue' |
'magenta' | 'cyan' | 'white' | 'gray' |
'brightRed' | 'brightGreen' | 'brightYellow' |
'brightBlue' | 'brightMagenta' | 'brightCyan' | 'brightWhite'
```

## Style properties

| Property        | Type      | What it does            |
| --------------- | --------- | ----------------------- |
| `fg`            | `Color`   | Foreground (text) color |
| `bg`            | `Color`   | Background color        |
| `bold`          | `boolean` | Bold text               |
| `dim`           | `boolean` | Dimmed text             |
| `italic`        | `boolean` | Italic text             |
| `underline`     | `boolean` | Underlined text         |
| `strikethrough` | `boolean` | Strikethrough text      |
| `inverse`       | `boolean` | Swap fg/bg colors       |

## Composing styles

`mergeStyles()` does a shallow merge. the second argument wins for any conflicting property:

```ts
const base = mergeStyles(defaultStyle(), { fg: parseColor('white') })
const bold = mergeStyles(base, { bold: true })
// bold has both fg: white and bold: true

// You can chain as many as you need
const final = mergeStyles(
    mergeStyles(base, { dim: true }),
    { underline: true }
)
```

## Rendering to cells

When the renderer writes to the screen buffer, it converts a `Style` into cell attributes using `styleToCellAttrs()`. You rarely call this yourself, but it's there if you need it:

```ts

const attrs = styleToCellAttrs(heading)
// → { fg: '\x1b[36m', bg: '', attrs: '\x1b[1m' }
```

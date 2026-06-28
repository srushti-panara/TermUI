# Chart Widgets
Data visualization widgets in `@termuijs/widgets` render charts entirely in the terminal using Unicode block characters, with ASCII fallbacks for CI environments.
## BarChart
Grouped horizontal or vertical bar chart. Pass the data as the first argument:
```ts

const data: BarGroup[] = [
    { label: 'Jan', bars: [{ value: 42, color: { type: 'named', name: 'cyan' } }] },
    { label: 'Feb', bars: [{ value: 67 }] },
    { label: 'Mar', bars: [{ value: 55 }] },
]

const chart = new BarChart(data, { flexGrow: 1 }, {
    direction: 'vertical',
    max: 100,
})
```
For grouped bars, include multiple items in the `bars` array:
```ts
const grouped: BarGroup[] = [
    {
        label: 'Q1',
        bars: [
            { value: 42, color: { type: 'named', name: 'cyan' }   },  // read
            { value: 31, color: { type: 'named', name: 'green' }  },  // write
        ],
    },
]
```
| BarGroup field | Type     | Description        |
| -------------- | -------- | ------------------ |
| `label`        | `string` | Group label        |
| `bars`         | `Array`  | One bar per series |

| BarChart option | Type                         | Default            | Description                            |
| --------------- | ---------------------------- | ------------------ | -------------------------------------- |
| `direction`     | `'horizontal' \| 'vertical'` | `'vertical'`       | Direction bars grow                    |
| `max`           | `number`                     | Auto (max of data) | Top of the scale                       |
| `barWidth`      | `number`                     | `1`                | Width of each bar in cells             |
| `barGap`        | `number`                     | `1`                | Gap between bars in a group            |
| `groupGap`      | `number`                     | `2`                | Gap between groups                     |
| `barColor`      | `Color`                      | `cyan`             | Color for bars without a per-bar color |

## Sparkline
A compact inline trend line for time-series data. Fits in a single row:
```ts

const spark = new Sparkline('CPU', { height: 1, flexGrow: 1 }, {
    color: { type: 'named', name: 'green' },
})
spark.setData([12, 24, 18, 45, 67, 52, 41])
```
The widget auto-scales to fit the data range into the available width. Set `marker` to `'block'` or `'braille'`. Set `showRange` to label the min and max.
## LineChart
An ASCII line plot for a single series of numbers. Pass the data array first, then style, then options:
```ts

const chart = new LineChart([10, 20, 35, 28, 42, 38, 55], { flexGrow: 1 }, {
    color: { type: 'named', name: 'cyan' },
    showYAxis: true,
    showXAxis: true,
    yLabel: 'Count',
})

chart.setData([12, 18, 30, 25, 40])
chart.pushValue(48)
```
The widget normalizes data to the available height and samples to fit the width. It plots points with vertical connectors between adjacent points.

When `NO_UNICODE=1`, the point character falls back from `●` to `*`.
| LineChart option | Type      | Default | Description                           |
| ---------------- | --------- | ------- | ------------------------------------- |
| `color`          | `Color`   | `cyan`  | Color of the plotted points and lines |
| `showYAxis`      | `boolean` | `false` | Show Y-axis labels                    |
| `showXAxis`      | `boolean` | `false` | Show X-axis line                      |
| `yLabel`         | `string`  | `''`    | Label for the Y axis                  |
| `min`            | `number`  | Auto    | Force Y axis minimum                  |
| `max`            | `number`  | Auto    | Force Y axis maximum                  |

## HeatMap
A 2D matrix visualization with a low-to-high color gradient. Pass the matrix first:
```ts

// 24-hour × 7-day activity grid
const data = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => Math.random() * 100)
)

const map = new HeatMap(data, { flexGrow: 1 }, {
    rowLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    colLabels: Array.from({ length: 24 }, (_, i) => `${i}h`),
})

map.setMatrix(data)
```
| HeatMap option | Type       | Description                    |
| -------------- | ---------- | ------------------------------ |
| `rowLabels`    | `string[]` | Label for each row (left side) |
| `colLabels`    | `string[]` | Label for each column (top)    |
| `lowColor`     | `Color`    | Color for minimum-value cells  |
| `highColor`    | `Color`    | Color for maximum-value cells  |

## StackedBarChart
A bar chart where each bar is divided into segments representing different series. Build the widget, then call `setSeries`.

| Option | Type | Description |
|------|------|-------------|
| `categories` | `string[]` | Category labels along the axis |
| `barWidth` | `number` | Width of each bar in cells (default 2) |

```tsx

const chart = new StackedBarChart({ flexGrow: 1 }, {
    categories: ['Jan', 'Feb'],
})
chart.setSeries([
    { label: 'read',  data: [30, 45], color: { type: 'named', name: 'cyan' } },
    { label: 'write', data: [20, 15], color: { type: 'named', name: 'green' } },
])
```
`StackedSeries` has `label: string`, `data: number[]`, and optional `color: Color`.

## Histogram
Renders a frequency distribution as vertical bars over a continuous range. Pass raw values through `setData`.

| Option | Type | Description |
|------|------|-------------|
| `bins` | `number` | Number of histogram bins (default 10) |
| `barColor` | `Color` | Bar color |
| `xLabel` | `string` | X axis label |

```tsx

const chart = new Histogram({ flexGrow: 1 }, { bins: 20 })
chart.setData(samples)
```

## PieChart
Draws a pie chart with a legend using block characters. The constructor takes a single options object.

| Option | Type | Description |
|------|------|-------------|
| `slices` | `Array<{ label: string, value: number, color: string \| Color }>` | Pie segments |
| `style` | `Partial<Style>` | Widget style |
| `showLegend` | `boolean` | Render the legend below the pie (default true) |

```tsx

const chart = new PieChart({
    style: { width: 20, height: 10 },
    slices: [
        { label: 'TypeScript', value: 68, color: { type: 'named', name: 'blue' } },
        { label: 'JavaScript', value: 22, color: { type: 'named', name: 'yellow' } },
        { label: 'Other', value: 10, color: { type: 'named', name: 'brightBlack' } },
    ],
})
```

## BulletChart
A compact horizontal bar that shows a primary measure against a target and comparative ranges. Set the value and target with methods.

| Option | Type | Description |
|------|------|-------------|
| `max` | `number` | Scale maximum (default 100) |
| `ranges` | `Array<{ to: number, color?: Color }>` | Background range bands, by upper bound |
| `label` | `string` | Label on the left |

```tsx

const chart = new BulletChart({ height: 1, flexGrow: 1 }, {
    label: 'Revenue',
    max: 300,
    ranges: [
        { to: 200, color: { type: 'named', name: 'red' } },
        { to: 300, color: { type: 'named', name: 'green' } },
    ],
})
chart.setValue(270)
chart.setTarget(260)
```

## CandlestickChart
Renders OHLC candlestick data for financial time series. Pass candles through `setData`.

| Option | Type | Description |
|------|------|-------------|
| `upColor` | `Color` | Color for bullish candles (close > open) |
| `downColor` | `Color` | Color for bearish candles (close < open) |
| `wickColor` | `Color` | Color for the high/low wicks |

```tsx

const chart = new CandlestickChart({ flexGrow: 1 }, {
    upColor: { type: 'named', name: 'green' },
    downColor: { type: 'named', name: 'red' },
})
chart.setData([
    { open: 100, high: 115, low: 98, close: 110 },
    { open: 110, high: 112, low: 102, close: 105 },
])
```

## AreaChart
A line chart with the area below the line filled in. Pass data through `setData`.

| Option | Type | Description |
|------|------|-------------|
| `lineColor` | `Color` | Color of the line |
| `fillColor` | `Color` | Color of the filled area |
| `showLine` | `boolean` | Draw the line on top of the fill (default true) |
| `xLabel` | `string` | X axis label |
| `yLabel` | `string` | Y axis label |

```tsx

const chart = new AreaChart({ flexGrow: 1 }, {
    lineColor: { type: 'named', name: 'cyan' },
    yLabel: 'Visitors',
})
chart.setData([5, 20, 15, 40, 30, 55])
```

## ScatterPlot
Renders individual data points on a 2D axis. Pass points through `setData`.

| Option | Type | Description |
|------|------|-------------|
| `xLabel` | `string` | X axis label |
| `yLabel` | `string` | Y axis label |
| `marker` | `string` | Point marker character (default `•`, ASCII `.`) |
| `pointColor` | `Color` | Point color |

```tsx

const chart = new ScatterPlot({ flexGrow: 1 }, {})
chart.setData([{ x: 1, y: 2 }, { x: 3, y: 5 }, { x: 4, y: 3 }])
```

## RadarChart
A spider/radar chart that plots multiple variables on radial axes. Set the axes in options, then call `setSeries`. Each series value is in the range [0, 1].

| Option | Type | Description |
|------|------|-------------|
| `axes` | `string[]` | Axis labels, one per spoke |
| `lineColor` | `Color` | Default series color |

```tsx

const chart = new RadarChart({ width: 30, height: 15 }, {
    axes: ['Speed', 'Reliability', 'Security', 'DX', 'Perf'],
})
chart.setSeries([
    { label: 'TermUI', values: [0.9, 0.85, 0.78, 0.95, 0.88], color: { type: 'named', name: 'cyan' } },
])
```

## GanttChart
Displays tasks on a timeline grid for project or process scheduling views. Pass tasks as the first argument. Each task has a numeric `start` and `duration`.

| Option | Type | Description |
|------|------|-------------|
| `minTime` | `number` | Left edge of the timeline |
| `maxTime` | `number` | Right edge of the timeline |
| `barColor` | `Color` | Task bar color |
| `labelColor` | `Color` | Task label color |

```tsx

const chart = new GanttChart(
    [
        { label: 'Design', start: 0, duration: 1 },
        { label: 'Build', start: 1, duration: 2 },
        { label: 'Test', start: 2, duration: 1 },
    ],
    { flexGrow: 1 },
    { maxTime: 4 },
)
```

## BrailleCanvas
A free-form drawing canvas that uses Unicode Braille characters to achieve 2x4 sub-character resolution. The first argument is an options object with `width` and `height`.

| Option | Type | Description |
|------|------|-------------|
| `width` | `number` | Canvas width in pixels |
| `height` | `number` | Canvas height in pixels |
| `color` | `Color` | Pixel color |

```tsx

const canvas = new BrailleCanvas({ width: 80, height: 80 }, { flexGrow: 1 })
// Draw a diagonal line
for (let i = 0; i < 80; i++) {
    canvas.drawPixel(i, Math.floor(i / 2))
}
```

## See also

- [@termuijs/data](/docs/data/overview), reactive hooks for live CPU, memory, and network metrics
- [Accessibility & caps flags](/docs/guides/accessibility), how charts adapt to NO_UNICODE environments

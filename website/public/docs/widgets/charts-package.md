# Chart widgets package

There is no separate `@termuijs/charts` package. The chart widgets ship inside `@termuijs/widgets`. Import them from there.

## Installation

```bash
npm install @termuijs/widgets
```

## Importing chart widgets

```ts

    LineChart,
    AreaChart,
    PieChart,
    BarChart,
    Sparkline,
    HeatMap,
    Gauge,
} from '@termuijs/widgets'

    LineChartOptions,
    AreaChartOptions,
    PieChartOptions,
    PieSlice,
    BarChartOptions,
    GaugeOptions,
} from '@termuijs/widgets'
```

## Example

```ts

const chart = new AreaChart({ width: 40, height: 10 }, {
    lineColor: { type: 'named', name: 'cyan' },
})
chart.setData([10, 40, 20, 80, 60])

const pie = new PieChart({
    style: { width: 20, height: 10 },
    slices: [
        { label: 'User',   value: 60, color: { type: 'named', name: 'cyan' } },
        { label: 'System', value: 25, color: { type: 'named', name: 'yellow' } },
        { label: 'Idle',   value: 15, color: { type: 'named', name: 'brightBlack' } },
    ],
})

const gauge = new Gauge('CPU', { height: 1, flexGrow: 1 })
gauge.setValue(0.73)

const root = new Box({ flexDirection: 'column', padding: 1 })
root.addChild(chart)
root.addChild(pie)
root.addChild(gauge)

const app = new App(root, { fullscreen: true })
await app.mount()
```

## See also

- [Chart widgets](/docs/widgets/charts), full reference for every chart widget
- [Widgets overview](/docs/widgets/overview)

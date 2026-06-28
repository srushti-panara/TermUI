# Input Widgets

`@termuijs/widgets` includes focusable input widgets for collecting numeric values, PIN codes, and dates in terminal UIs. Each widget handles its own keyboard controls and calls a callback when its value changes.

All input widgets extend `Widget` and are focusable by default. Attach them to a layout, give them focus with your focus manager, and they handle the rest.

---

## Numeric inputs

### RangeInput

A dual-handle slider for selecting a numeric range with a low and high value. The track renders between the two handles. Press `Tab` to switch the active handle.

```ts

const range = new RangeInput('Price', { width: 40 }, {
    min: 0,
    max: 500,
    step: 10,
    showValue: true,
    onChange: (low, high) => {
        console.log(`Range: ${low} – ${high}`)
    },
})
```

**Constructor**

```ts
new RangeInput(label: string, style?: Partial<Style>, opts?: RangeInputOptions)
```

**`RangeInputOptions`**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Amount to increment or decrement per keypress |
| `color` | `Color` | `cyan` | Track fill color |
| `showValue` | `boolean` | `true` | Display `low – high` values at the end of the track |
| `onChange` | `(low: number, high: number) => void` |, | Called when either handle moves |

**Methods**

| Method | Description |
|--------|-------------|
| `getLow(): number` | Current low handle value |
| `getHigh(): number` | Current high handle value |
| `setLow(value: number): void` | Set the low handle; clamped to `[min, high]` |
| `setHigh(value: number): void` | Set the high handle; clamped to `[low, max]` |
| `setRange(low: number, high: number): void` | Set both handles at once |

**Keyboard controls**

| Key | Action |
|-----|--------|
| `Tab` | Switch active handle between low and high |
| `Right` | Increase active handle by `step` |
| `Left` | Decrease active handle by `step` |

---

### Knob

A circular knob that sweeps 270 degrees from bottom-left to bottom-right. The current value renders in the center of the knob when there is enough room. The knob is highlighted when focused.

```ts

const volume = new Knob('Volume', { width: 9, height: 5 }, {
    min: 0,
    max: 100,
    step: 5,
    showValue: true,
    onChange: (value) => {
        console.log('volume:', value)
    },
})
```

**Constructor**

```ts
new Knob(label?: string, style?: Partial<Style>, opts?: KnobOptions)
```

**`KnobOptions`**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value (clamped to `>= min`) |
| `step` | `number` | `1` | Amount to change per keypress (must be positive) |
| `color` | `Color` | `cyan` | Arc fill color when not focused |
| `showValue` | `boolean` | `true` | Render the numeric value in the center of the knob |
| `onChange` | `(value: number) => void` |, | Called whenever the value changes |

**Methods**

| Method | Description |
|--------|-------------|
| `value: number` (getter) | Current knob value |
| `setValue(value: number): void` | Set the value; clamped to `[min, max]` |

**Keyboard controls**

| Key | Action |
|-----|--------|
| `Up` or `Right` | Increase by `step` |
| `Down` or `Left` | Decrease by `step` |

**Sizing tip**, the knob fills the widget's bounding box. Give it equal or close width and height for a round shape. A minimum of `4 × 3` is needed to show the center value.

---

## Text inputs

### PinInput

A fixed-length PIN entry field. Each character occupies a labeled block (`[ x ]`). The active block is highlighted with inverse colors. The `onComplete` callback fires when every slot is filled.

```ts

const pin = new PinInput({}, {
    length: 6,
    masked: true,
    onChange: (value) => {
        console.log('current:', value)
    },
    onComplete: (value) => {
        console.log('PIN entered:', value)
    },
})
```

**Constructor**

```ts
new PinInput(style?: Partial<Style>, opts?: PinInputOptions)
```

**`PinInputOptions`**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `length` | `number` | `4` | Number of character slots |
| `masked` | `boolean` | `false` | Replace visible characters with `•` (or `*` on ASCII-only terminals) |
| `onChange` | `(value: string) => void` |, | Called after each character change with the current partial value |
| `onComplete` | `(value: string) => void` |, | Called when all slots are filled |

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `value` | `string` (getter) | Current input value joined from all slots |

**Keyboard controls**

| Key | Action |
|-----|--------|
| Any printable character | Fill the current slot and advance the cursor |
| `Right` | Move cursor right |
| `Left` | Move cursor left |
| `Backspace` or `Delete` | Clear the current slot; if already empty, move left and clear |

Each slot renders as 6 columns (`[ x ] `), so set the widget width to at least `length × 6`.

---

## Form composition

`@termuijs/widgets` does not ship a dedicated `Form` widget. Use the numeric and text widgets above together with layout primitives from `@termuijs/widgets` and focus management from `@termuijs/ui` to build form-like interfaces. For a date field, `@termuijs/widgets` exports a `Calendar` widget with keyboard date selection.

A typical pattern for a multi-field form:

```ts

function SettingsForm() {
    const [pinValue, setPinValue] = useState('')
    const [low, setLow] = useState(0)
    const [high, setHigh] = useState(100)

    return (
        <box flexDirection="column" gap={1} padding={1}>
            <text bold>Configure</text>

            <box flexDirection="column">
                <text>Access PIN</text>
                <PinInput
                    opts={{
                        length: 4,
                        masked: true,
                        onComplete: (v) => setPinValue(v),
                    }}
                />
            </box>

            <box flexDirection="column">
                <text>Allowed range</text>
                <RangeInput
                    label="Range"
                    opts={{
                        min: 0,
                        max: 100,
                        onChange: (l, h) => { setLow(l); setHigh(h) },
                    }}
                />
            </box>
        </box>
    )
}
```

For the `form-wizard` starter (multi-step forms), scaffold with:

```bash
npx create-termui-app my-app --template form-wizard
```

This generates a working `Wizard` component with step navigation built in.

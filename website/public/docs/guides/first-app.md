# Build your first app
This tutorial walks through building a system monitoring dashboard. By the end you'll have gauges, a process table, log output, and keyboard navigation between panels.
## What we're building- CPU and memory usage gauges- A process list table- A log viewer with auto-scroll- Tab to switch between panels, q to quit
## Step 1: create the project
```bash
$ bunx create-termui-app my-dashboard
$ cd my-dashboard
$ bun add @termuijs/widgets @termuijs/tss @termuijs/data
```
## Step 2: set up a theme
Create `src/theme.tss` with your dashboard color palette:
```ts
@theme dashboard {
  --primary: #00ff88;
  --secondary: #00d4ff;
  --bg: #0a0a0f;
  --border: #2a2a45;
  --text: #e8e8f0;
  --dim: #55557a;
}

Box {
  border-color: var(--border);
}

Box:focused {
  border-color: var(--primary);
}

Text {
  color: var(--text);
}

Text.dim {
  color: var(--dim);
}
```
Then load it in your app entry point:
```ts

const engine = new ThemeEngine()
engine.load(readFileSync('./src/theme.tss', 'utf8'))
engine.setTheme('dashboard')
```
## Step 3: build the layout
Build the widget tree and immediately mount the app so the screen is live while data loads:
```ts

// Header
const header = new Box({ padding: 1, border: 'single' })
header.addChild(new Text('System Dashboard', { bold: true }))

// Gauge panel
const gaugePanel = new Box({ flexDirection: 'column', padding: 1 })
const cpuBar = new ProgressBar({ width: 25, label: 'CPU' })
const memBar = new ProgressBar({ width: 25, label: 'MEM' })
gaugePanel.addChild(cpuBar)
gaugePanel.addChild(memBar)

// Process panel
const processPanel = new Box({ flexGrow: 1, padding: 1, border: 'single' })
processPanel.addChild(new Text('Processes', { dim: true, className: 'dim' }))

// Log panel
const logPanel = new Box({ height: 8, padding: 1, border: 'single' })
logPanel.addChild(new Text('Logs', { dim: true, className: 'dim' }))

// Assemble the layout
const content = new Box({ flexDirection: 'row', flexGrow: 1 })
content.addChild(gaugePanel)
content.addChild(new Box({ flexDirection: 'column', flexGrow: 1 }, [processPanel, logPanel]))

const root = new Box({ flexDirection: 'column' })
root.addChild(header)
root.addChild(content)

// Apply theme to the tree
engine.onChange(() => {
    root.applyStyles(engine.resolveStyle('Box'))
    app.requestRender()
})
root.applyStyles(engine.resolveStyle('Box'))

// Mount. app is now live
const app = new App(root, { fullscreen: true })
await app.mount()
```
## Step 4: add real data
Start the data polling loop after `app.mount()` resolves:
```ts

setInterval(async () => {
    const cpuInfo = await cpu()
    const memInfo = await memory()

    cpuBar.setValue(cpuInfo.total / 100)
    memBar.setValue(memInfo.usedPercent / 100)
    app.requestRender()
}, 1000)
```
## Step 5: add keyboard navigation
```ts
app.events.on('key', (event) => {
    if (event.key === 'tab')  focusNext()
    if (event.key === 'q')    app.exit()
})
```
## Next steps
- [**TSS**: advanced selector syntax and runtime theme switching](/docs/tss/overview)
- [**Springs**: animate the gauge values with physics](/docs/motion/springs)
- [**VirtualList**: handle large process lists efficiently](/docs/widgets/virtual-list)

# Dev server and hot reload
The `@termuijs/dev-server` package runs your app in a child process and automatically restarts it whenever a source file changes.

It pairs with the `dev` script in every project created by  `create-termui-app`.
Changes are reflected in under 200ms in most cases; the old process exits, a fresh one starts, and your terminal is live again.
## Usage
```bash
# From a create-termui-app project
bun run dev

# Or directly with the CLI
termui dev --entry src/index.tsx
```
## CLI Flags
| Flag             | Default       | Description                              |
| ---------------- | ------------- | ---------------------------------------- |
| `--entry <path>` | Auto-detected | Entry file to run (e.g. `src/index.tsx`) |
## Auto entry detection
If you don't pass `--entry`, the server looks for these files in order:
```ts
src/index.tsx
src/index.ts
src/main.tsx
src/main.ts
index.tsx
index.ts
```
## How it works
The dev server uses `Bun.spawn` to run your entry file as a separate process. Bun runs TypeScript natively, so no extra loader is needed. On file change:
```ts
// Schematic
1. File change detected (debounced 200ms)
2. Send SIGTERM to old process
3. If still alive after 2s → send SIGKILL
4. Spawn a new process with the same entry
5. New process starts rendering immediately
```
The child process runs with `TERMUI_DEV=1` and  `NODE_ENV=development` in its environment. you can check these to enable dev-only features like verbose logging.
## DevTools integration
When the dev server is running, it communicates with the child process over IPC. The DevTools panel (if enabled) receives timing metrics and render traces from the child without polluting your terminal output.
```ts
// In your app. check if dev server is present
if (process.env.TERMUI_DEV === '1') {
    // Enable verbose logging, performance overlays, etc.
}
```
## Graceful shutdown
The dev server handles `SIGTERM` and `SIGINT`  (Ctrl+C). When it receives one, it first forwards SIGTERM to the child process, waits up to 2 seconds, then kills the child if necessary before exiting cleanly.
## Environment variables
| Variable     | Value           | Description                                     |
| ------------ | --------------- | ----------------------------------------------- |
| `TERMUI_DEV` | `"1"`           | Signals the app is running under the dev server |
| `NODE_ENV`   | `"development"` | Standard Node env flag                          |
## ThemeWatcher
`ThemeWatcher` watches `.tss` files in your theme directories and sends a hot-reload signal to the running app over IPC. The app receives the signal and reloads its theme without a full process restart.

By default the server watches the `themes/` directory in your project root. You can override this:

```ts

const watcher = new ThemeWatcher({ watchDirs: ['src/themes', 'shared/tokens'] })

watcher.onChange((change) => {
    console.log(`Theme file changed: ${change.filename}`)
})

watcher.start()

// Stop watching
watcher.stop()
```

When used inside `DevServer`, `ThemeWatcher` is wired automatically. The child process receives a `{ type: 'theme-reload', filename }` IPC message. In your app you can listen for it:

```ts
process.on('message', (msg: any) => {
    if (msg?.type === 'theme-reload') {
        // Re-apply theme from disk
    }
})
```

The watcher debounces rapid saves (100ms window) and coalesces multiple saves to the same file into a single event.

## Error overlay
When the child process exits with a non-zero code and has written to stderr, the dev server renders a full-screen `ErrorOverlay` instead of leaving the terminal blank.

The overlay shows:
- Error name and message on a red banner
- The source file, line, and column of the first user-land stack frame
- The full stack trace, with `node_modules` and Node internals dimmed

The overlay stays visible until you save a file. The next reload clears it and spawns a fresh child process.

No configuration is needed. The overlay appears automatically on crash.

## Reload notification banner
When the dev server respawns the child after a file change, it sets an internal `banner` property to `'Reloaded'` for a configurable duration (default: 1500ms). Your app can read this to show a status indicator during reload.

You can control the banner duration with `bannerMs`:

```ts

const server = new DevServer({
    rootDir: process.cwd(),
    bannerMs: 2000,  // Show banner for 2 seconds after each reload
})

server.start()
```

The `DevServer` instance exposes the current banner text via `server.banner` (`string | null`). It returns to `null` after the timeout.

## See also

- **create-termui-app**: Scaffold a new project with dev server pre-configured
- **Architecture**: How the render pipeline runs inside the child process

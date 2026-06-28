# Storage Adapters

`@termuijs/adapters` ships two storage adapters. `useLocalStorage` is a zero-dependency JSON file store. `useConf` wraps the `conf` library for typed, structured app config with schema defaults.

Both adapters persist data to `~/.config/<name>/` on the user's machine.

---

## useLocalStorage

A simple key-value store backed by a JSON file. No peer dependencies required.

### API

```ts
function useLocalStorage(service: string): LocalStorageAdapter

interface LocalStorageAdapter {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  clear(): void
}
```

- `service`, the store name. Data is written to `~/.config/termui/<service>.json`.
- `get<T>`, returns the stored value typed as `T`, or `null` if absent.
- `set<T>`, writes a value. Accepts any JSON-serializable type.
- `remove`, deletes a single key.
- `clear`, wipes the entire store for this service.

### Read and write

```ts

const store = useLocalStorage('my-app')

// Write
store.set('theme', 'dark')
store.set('history', ['cmd1', 'cmd2', 'cmd3'])

// Read
const theme = store.get<string>('theme')       // 'dark'
const history = store.get<string[]>('history') // ['cmd1', 'cmd2', 'cmd3']
const missing = store.get<string>('nope')      // null

// Delete
store.remove('theme')

// Wipe
store.clear()
```

### TypeScript types

```ts

function withStore(store: LocalStorageAdapter) {
  const count = store.get<number>('count') ?? 0
  store.set('count', count + 1)
}
```

### Storage location

Files are stored at `~/.config/termui/<service>.json`. The directory is created automatically if it does not exist.

---

## useConf

A typed persistent config store backed by the [`conf`](https://github.com/sindresorhus/conf) library. Supports default values, schema merging, and a functional update API.

### Peer dependency

```bash
npm install conf@^10.2.0
```

### API

```ts
function useConf<T extends Record<string, unknown>>(
  appName: string,
  defaults: T
): UseConfResult<T>

type UseConfResult<T extends Record<string, unknown>> = readonly [T, SetConfValue<T>]

type SetConfValue<T extends Record<string, unknown>> =
  (value: T | ((current: T) => T)) => T
```

- `appName`, your app's name. Config is stored at `~/.config/<appName>/config.json`.
- `defaults`, the initial config shape. Merged into the store on first run.
- Returns a tuple: the current config object and a setter function.
- The setter accepts a new value or an updater function, matching the React `setState` pattern.
- Calls with the same `appName` share the same cached store instance within a process.

### Read and write

```ts

interface AppConfig {
  theme: 'light' | 'dark'
  fontSize: number
  recentFiles: string[]
}

const defaults: AppConfig = {
  theme: 'dark',
  fontSize: 14,
  recentFiles: [],
}

const [config, setConfig] = useConf('my-app', defaults)

// Read
console.log(config.theme)     // 'dark'
console.log(config.fontSize)  // 14

// Replace the whole config
setConfig({ theme: 'light', fontSize: 16, recentFiles: [] })

// Update with a function (merges safely)
setConfig((current) => ({
  ...current,
  recentFiles: ['/path/to/file', ...current.recentFiles].slice(0, 10),
}))
```

### TypeScript types

```ts

interface Config { volume: number; muted: boolean }

function applyMute(setter: SetConfValue<Config>) {
  setter((c) => ({ ...c, muted: true }))
}
```

### Storage location

Config files are stored at `~/.config/<appName>/config.json`. The directory is created automatically.

---

## Choosing between the two

| | `useLocalStorage` | `useConf` |
|---|---|---|
| Peer dependency | None | `conf@^10.2.0` |
| Typed defaults | No | Yes |
| Functional updates | No | Yes |
| Best for | Session data, caches, history | App settings and user preferences |

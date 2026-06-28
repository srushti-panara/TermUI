# CLI Tools Adapters

`@termuijs/adapters` ships three adapters for common CLI tooling: `chalkToTermUI` passes chalk-styled strings through the terminal, `useExeca` runs subprocesses and streams their output line by line, and `useGit` wraps `simple-git` with a typed interface for common git operations.

---

## chalkToTermUI

Passes chalk-styled strings through to the terminal unchanged. When the `NO_COLOR` environment variable is set, strips all ANSI escape codes so the output is plain text.

### Peer dependency

```bash
npm install chalk
```

### API

```ts
function chalkToTermUI(input: string): string
```

- `chalkToTermUI`, returns the input string as-is, or with ANSI codes removed if `NO_COLOR` is set.

### Strip ANSI when NO_COLOR is set

```ts

const styled = chalk.green.bold('Build succeeded')

// Outputs the green bold string in color-capable terminals.
// Outputs plain text when NO_COLOR is set in the environment.
console.log(chalkToTermUI(styled))
```

### API table

| Function | Signature | Description |
|---|---|---|
| `chalkToTermUI` | `(input: string) => string` | Pass-through or ANSI-strip depending on `NO_COLOR` |

---

## useExeca

Runs external commands and streams their combined stdout and stderr output line by line as an async generator.

### Peer dependency

```bash
npm install execa
```

### API

```ts
function useExeca(globalOpts?: Options): UseExecaResult

interface UseExecaResult {
  run(
    cmd: string | string[],
    argsOrOpts?: string[] | Options,
    opts?: Options
  ): AsyncGenerator<string, void, unknown>
}
```

- `globalOpts`, default `execa` options applied to every `run` call. Per-call `opts` are merged on top.
- `run` accepts a command string with a separate args array, or a single `string[]` where the first element is the executable.
- `run` returns an `AsyncGenerator`. Each yielded value is one line from stdout or stderr.
- Output from stdout and stderr is interleaved in arrival order (`execa`'s `all` stream).
- If the process exits with a non-zero code, `execa` throws. The generator propagates the error.

### Stream subprocess output into a widget

```ts

const exec = useExeca()
const output = new Text('', { wrap: true })
const app = new App(output, { fullscreen: false })
await app.mount()

for await (const line of exec.run('git', ['log', '--oneline', '-10'])) {
  output.setText(output.getText() + '\n' + line)
}
```

### Pass a command as an array

```ts
const exec = useExeca()

for await (const line of exec.run(['npm', 'run', 'build'])) {
  console.log(line)
}
```

### Set global options

```ts

const exec = useExeca({ cwd: '/path/to/project', env: { NODE_ENV: 'production' } })

for await (const line of exec.run('make', ['dist'])) {
  console.log(line)
}
```

### API table

| Parameter | Type | Description |
|---|---|---|
| `globalOpts` | `Options` (optional) | Default execa options for all `run` calls |
| `cmd` | `string \| string[]` | Executable name or `[executable, ...args]` array |
| `argsOrOpts` | `string[] \| Options` (optional) | Argument list or options when `cmd` is a string |
| `opts` | `Options` (optional) | Per-call options merged over `globalOpts` |

---

## useGit

A typed interface over `simple-git` for common git operations: status, log, staging, commit, push, pull, and diff.

### Peer dependency

```bash
npm install simple-git
```

### API

```ts
function useGit(cwd?: string): GitAdapter

interface GitAdapter {
  status(): Promise<GitStatusResult>
  log<T = DefaultLogFields>(options?: unknown): Promise<LogResult<T>>
  stage(files: string | string[]): Promise<string>
  commit(message: string, options?: unknown): Promise<CommitResult>
  push(remote?: string, branch?: string, options?: unknown): Promise<PushResult>
  pull(remote?: string, branch?: string, options?: unknown): Promise<PullResult>
  diff(options?: unknown): Promise<string>
}

interface GitStatusResult {
  modified: string[]
  untracked: string[]
  staged: string[]
}

interface DefaultLogFields {
  hash: string
  date: string
  message: string
  author_name: string
  author_email: string
}

interface LogResult<T = DefaultLogFields> {
  all: T[]
  latest: T | null
  total: number
}

interface CommitResult {
  author: null | { name: string; email: string }
  branch: string
  commit: string
  summary: { changes: number; insertions: number; deletions: number }
}
```

- `cwd`, working directory for git commands. Defaults to the process's current directory.
- `status`, returns modified, untracked, and staged file lists.
- `log`, returns commit history. Pass `simple-git` log options (e.g. `{ maxCount: 10 }`) via `options`.
- `stage`, stages one file or an array of files.
- `commit`, commits staged changes with the given message.
- `push` / `pull`, push to or pull from a remote. All parameters are optional and default to the current branch's tracking remote.
- `diff`, returns the raw diff string. Pass `simple-git` diff options via `options`.

### Show repo status in a TermUI app

```ts

const git = useGit()
const status = await git.status()

const lines = [
  `Modified:  ${status.modified.join(', ') || 'none'}`,
  `Untracked: ${status.untracked.join(', ') || 'none'}`,
  `Staged:    ${status.staged.join(', ') || 'none'}`,
].join('\n')

const label = new Text(lines, { wrap: true })
const app = new App(label, { fullscreen: false })
await app.mount()
```

### Stage and commit files

```ts
const git = useGit('/path/to/repo')

await git.stage(['src/index.ts', 'README.md'])
const result = await git.commit('docs: update readme')

console.log(`Committed ${result.commit} on ${result.branch}`)
```

### Read recent log entries

```ts
const git = useGit()
const log = await git.log({ maxCount: 5 })

for (const entry of log.all) {
  console.log(`${entry.hash.slice(0, 7)} ${entry.message}`)
}
```

### API table

| Method | Signature | Description |
|---|---|---|
| `status` | `() => Promise<GitStatusResult>` | Modified, untracked, and staged file lists |
| `log` | `(options?) => Promise<LogResult<T>>` | Commit history |
| `stage` | `(files) => Promise<string>` | Stage one or more files |
| `commit` | `(message, options?) => Promise<CommitResult>` | Commit staged changes |
| `push` | `(remote?, branch?, options?) => Promise<PushResult>` | Push to remote |
| `pull` | `(remote?, branch?, options?) => Promise<PullResult>` | Pull from remote |
| `diff` | `(options?) => Promise<string>` | Raw diff output |

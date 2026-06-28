# create-termui-app

`create-termui-app` scaffolds a new TermUI project. It generates a working app with the right `tsconfig.json`, `termui.config.ts`, theme file, and source entry point so you can start coding straight away.

## Usage

```bash
npx create-termui-app my-app
```

Run the command and the interactive prompt walks you through three choices: template, theme, and optional features. When it finishes, your project folder is ready.

### Skip the prompts

Pass all options as flags to run without any interaction:

```bash
npx create-termui-app my-app --template dashboard --theme nord --yes
```

## CLI flags

| Flag | Type | Description |
|------|------|-------------|
| `<name>` | positional | Project name and output folder |
| `--template <key>` | string | Template to use (see list below) |
| `--theme <name>` | string | Built-in theme name (e.g. `nord`, `dracula`) |
| `--yes` | boolean | Skip all prompts; use defaults or provided flags |

### The `add` subcommand

`create-termui-app add` copies a component into an existing project:

```bash
npx create-termui-app add <component> [--dir <path>] [--dry-run] [--yes]
```

| Flag | Description |
|------|-------------|
| `<component>` | Component name to add |
| `--dir <path>` | Target directory (defaults to current working directory) |
| `--dry-run` | Print what would be written without writing any files |
| `--yes` | Skip confirmation prompts |

## Templates

| Key | Description |
|-----|-------------|
| `empty` | Minimal starting point with a counter and keymap |
| `dashboard` | Real-time data layout with panels and charts |
| `interactive-tool` | List navigation, item toggling, inline text input |
| `cli-wrapper` | Spawns a child process and streams its output to the terminal |
| `cli-tool` | Minimal app with a box, text, and `useKeymap` |
| `file-manager` | Three-pane file browser with tree, picker, and preview |
| `ai-assistant` | Chat interface wired to the Claude API with a mock fallback |
| `form-wizard` | Multi-step form with a Wizard component |

## Generated project structure

Every template produces at least these files. Template-specific files go under `src/`:

```
my-app/
├── src/
│   └── index.tsx          # App entry point
├── themes/
│   └── <theme-name>.tss   # Selected built-in theme
├── package.json
├── tsconfig.json
└── termui.config.ts
```

The `dashboard`, `file-manager`, and `ai-assistant` templates add additional source files inside `src/`.

### package.json scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `bun --watch src/index.tsx` | Run with file-watching |
| `build` | `tsup src/index.tsx --format esm` | Bundle for distribution |
| `start` | `bun dist/index.js` | Run the built output |

## Requirements

- **Bun >= 1.3.0**, the generated projects use Bun as the runtime and bundler. Install it from [bun.sh](https://bun.sh).
- **Node.js**, `npx` requires Node.js to invoke `create-termui-app`, but the generated project itself runs on Bun.

## Next steps

After the scaffolder finishes:

```bash
cd my-app
bun install
bun run dev
```

Your app starts in the terminal. Edit `src/index.tsx` and the dev server reloads automatically.

From there:

- Change the theme in `termui.config.ts` or run the scaffolder again with a different `--theme`.
- Add packages from the TermUI ecosystem (`@termuijs/store`, `@termuijs/router`, `@termuijs/data`) as your app grows.
- Run `npx create-termui-app add <component>` to copy additional components into the project.

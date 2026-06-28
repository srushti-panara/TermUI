# @termuijs/cli

`@termuijs/cli` adds TermUI components to your project. It copies the component source into your codebase and installs the packages that component needs. You own the code after that and edit it like any other file.

## Add a component

```bash
npx termuijs@latest add spinner
```

This does three things:

- Resolves `spinner` in the registry at `https://termui.io/r/spinner.json`.
- Writes the source to `src/components/spinner/spinner.ts`.
- Installs the `@termuijs/*` packages the source imports.

Add several at once:

```bash
npx termuijs@latest add progress-bar table
```

## List components

```bash
npx termuijs@latest list
```

Prints every component in the registry with its description.

## Interactive picker

Run `add` with no name to pick from a list:

```bash
npx termuijs@latest add
```

The picker uses `@termuijs/widgets`, so the CLI runs on the same engine it installs.

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--dir <path>` | `src/components` | Destination root for the copied files. |
| `--dry-run` | off | Print what would be written and installed. Write nothing. |
| `--yes`, `-y` | off | Overwrite an existing component folder without asking. |

## Other package managers

`add` and `list` work through any runner:

```bash
bunx termuijs add spinner
pnpm dlx termuijs add spinner
yarn dlx termuijs add spinner
```

The CLI detects your package manager from the environment and installs dependencies with it.

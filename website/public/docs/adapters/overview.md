# Adapters Overview

`@termuijs/adapters` is the integration layer between TermUI apps and the outside world. Each adapter wraps a third-party library or system API and exposes a consistent, typed interface your app calls directly.

Adapters follow a hook-style naming convention (`useX`) and lazy-load optional peer dependencies at runtime. Your app only pays for what it imports.

## Installation

```bash
npm install @termuijs/adapters
```

Most adapters also require an optional peer dependency. Install only the ones you need:

```bash
# AI
npm install openai                # for OpenAI provider
npm install @anthropic-ai/sdk    # for Anthropic provider

# CLI tools
npm install chalk
npm install execa
npm install simple-git

# Integrations
npm install @octokit/rest        # GitHub
npm install keytar               # system keychain
npm install zod                  # schema validation
npm install dotenv               # .env file loading
npm install conf                 # persistent config
```

## Adapters

| Adapter | Export | Description |
|---|---|---|
| Local Storage | `useLocalStorage` | Key-value store backed by a JSON file in `~/.config/termui/` |
| Conf | `useConf` | Typed persistent config using the `conf` library |
| AI | `useAI` | Single interface for OpenAI and Anthropic chat and embeddings |
| Vector Store | `LocalVectorStore` | In-process vector store for embedding-based similarity search |
| Chalk | `chalkToTermUI` | Passes chalk-styled strings through and strips ANSI when `NO_COLOR` is set |
| Execa | `useExeca` | Runs subprocesses and streams output line by line |
| Git | `useGit` | Status, log, stage, commit, push, pull, diff via `simple-git` |
| GitHub | `useGitHub` | Lists repos, issues, PRs, and releases via `@octokit/rest` |
| Keychain | `useKeychain` | Reads and writes secrets from the OS keychain via `keytar` |
| Zod | `zodValidator` | Converts a Zod schema into a TermUI prompt validator function |
| Dotenv | `useDotenv` | Parses `.env` files and exposes values as a typed record |

## Quick example

Read a value from local storage and display it in a Text widget:

```ts

const store = useLocalStorage('my-app')
store.set('username', 'alice')

const username = store.get<string>('username') ?? 'guest'
const label = new Text(`Hello, ${username}`, { fg: 'cyan', bold: true })

const app = new App(label, { fullscreen: false })
await app.mount()
```

## Pages in this section

- [Storage](/docs/adapters/storage), `useLocalStorage` and `useConf`
- [AI & RAG](/docs/adapters/ai), `useAI`, `LocalVectorStore`
- [CLI Tools](/docs/adapters/cli-tools), `chalkToTermUI`, `useExeca`, `useGit`
- [Integrations](/docs/adapters/integrations), `useGitHub`, `useKeychain`, `zodValidator`, `useDotenv`

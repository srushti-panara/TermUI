# Integration Adapters

`@termuijs/adapters` ships four adapters for external integrations: `useGitHub` for GitHub API access, `useKeychain` for secure secret storage, `zodValidator` for schema-based prompt validation, and `useDotenv` for `.env` file parsing.

---

## useGitHub

Lists repos, issues, pull requests, and releases for a GitHub user or repository. Wraps `@octokit/rest` with automatic pagination.

### Peer dependency

```bash
npm install @octokit/rest
```

### API

```ts
function useGitHub(token?: string): UseGitHubResult

interface UseGitHubResult {
  repos:    GitHubNamespace<ReposListParams, Repo>
  issues:   GitHubNamespace<IssuesListParams, Issue>
  prs:      GitHubNamespace<PrsListParams, PullRequest>
  releases: GitHubNamespace<ReleasesListParams, Release>
}

type GitHubNamespace<TParams extends object, TItem> = {
  list(params: TParams): Promise<TItem[]>
}
```

- `token`, a GitHub personal access token. Pass it to authenticate and raise rate limits. Omit for unauthenticated access (60 requests/hour).
- Each namespace exposes a single `list` method that fetches all pages automatically.

### Types

```ts
interface ReposListParams {
  username: string
  type?: 'all' | 'owner' | 'member'
  sort?: 'created' | 'updated' | 'pushed' | 'full_name'
  direction?: 'asc' | 'desc'
}

interface Repo {
  id: number
  name: string
  full_name: string
  private?: boolean
  html_url?: string
  description?: string | null
}

interface IssuesListParams {
  owner: string
  repo: string
  state?: 'open' | 'closed' | 'all'
  labels?: string
  sort?: 'created' | 'updated' | 'comments'
  direction?: 'asc' | 'desc'
  since?: string
}

interface Issue {
  id: number
  number: number
  title: string
  state: string
  html_url: string
  user: { login: string }
}

interface PrsListParams {
  owner: string
  repo: string
  state?: 'open' | 'closed' | 'all'
  head?: string
  base?: string
  sort?: 'created' | 'updated' | 'popularity' | 'long-running'
  direction?: 'asc' | 'desc'
}

interface PullRequest {
  id: number
  number: number
  title: string
  state: string
  html_url: string
  user: { login: string }
  draft?: boolean
}

interface ReleasesListParams {
  owner: string
  repo: string
  per_page?: number
}

interface Release {
  id: number
  tag_name: string
  name: string | null
  html_url: string
  prerelease: boolean
  draft: boolean
  published_at: string | null
}
```

### List open pull requests

```ts

const gh = useGitHub(process.env.GITHUB_TOKEN)

const prs = await gh.prs.list({ owner: 'termuijs', repo: 'termui', state: 'open' })

const lines = prs.map((pr) => `#${pr.number} ${pr.title}`).join('\n')
const label = new Text(lines, { wrap: true })
const app = new App(label, { fullscreen: false })
await app.mount()
```

### List repositories for a user

```ts
const gh = useGitHub(process.env.GITHUB_TOKEN)

const repos = await gh.repos.list({ username: 'termuijs', sort: 'updated' })
for (const repo of repos) {
  console.log(repo.full_name, repo.description)
}
```

### API table

| Namespace | Method | Description |
|---|---|---|
| `repos` | `list(ReposListParams)` | All repos for a user |
| `issues` | `list(IssuesListParams)` | Issues for a repo |
| `prs` | `list(PrsListParams)` | Pull requests for a repo |
| `releases` | `list(ReleasesListParams)` | Releases for a repo |

---

## useKeychain

Reads and writes secrets in the OS keychain using `keytar`. Falls back to an in-process memory store (and environment variables for reads) when `keytar` is unavailable, so the adapter works in CI or environments without a keychain.

### Peer dependency

```bash
npm install keytar
```

### API

```ts
function useKeychain(appName: string): UseKeychainResult

interface UseKeychainResult {
  get(account: string): Promise<string | null>
  set(account: string, password: string): Promise<void>
  delete(account: string): Promise<boolean>
}
```

- `appName`, the keychain service name. All entries are scoped to this name.
- `get`, retrieves the password for `account`. Returns `null` if not found.
- `set`, stores a password in the keychain.
- `delete`, removes the entry for `account`. Returns `true` if the entry existed.

### Fallback behavior

When `keytar` is not installed or the keychain is inaccessible, `useKeychain` logs a warning and falls back silently:

- `get` reads from the in-process store first, then from an environment variable named by uppercasing the account string (e.g. `api-token` becomes `API_TOKEN`).
- `set` writes to the in-process store.
- `delete` removes from the in-process store.

This means your code does not need to handle the missing-keychain case.

### Store and retrieve an API token

```ts

const keychain = useKeychain('my-app')

// Store a token
await keychain.set('api-token', 'sk-...')

// Retrieve it later
const token = await keychain.get('api-token')
if (!token) {
  console.error('No API token found. Run setup first.')
  process.exit(1)
}
```

### Delete a stored secret

```ts
const keychain = useKeychain('my-app')

const removed = await keychain.delete('api-token')
console.log(removed ? 'Token deleted.' : 'Token not found.')
```

### API table

| Method | Signature | Description |
|---|---|---|
| `get` | `(account: string) => Promise<string \| null>` | Read a secret from the keychain |
| `set` | `(account: string, password: string) => Promise<void>` | Write a secret to the keychain |
| `delete` | `(account: string) => Promise<boolean>` | Delete a secret; returns `true` if it existed |

---

## zodValidator

Converts a Zod schema into a TermUI prompt validator function. The returned function accepts a string, runs `safeParse`, and returns `true` on success or the first error message on failure.

### Peer dependency

```bash
npm install zod
```

### API

```ts
function zodValidator(schema: ZodType): PromptValidator

type PromptValidator = (value: string) => true | string
```

- `schema`, any Zod type (`z.string()`, `z.number()`, `z.enum(...)`, etc.).
- The returned `PromptValidator` is compatible with TermUI prompt widgets that accept a `validate` prop.
- On validation failure, the first issue's `message` from the Zod error is returned.

### Validate a prompt input

```ts

const emailSchema = z.string().email('Enter a valid email address.')
const validate = zodValidator(emailSchema)

console.log(validate('user@example.com')) // true
console.log(validate('not-an-email'))     // 'Enter a valid email address.'
```

### Wire into a TermUI prompt widget

```ts

const schema = z.string().min(3, 'Must be at least 3 characters.')
const validate = zodValidator(schema)

const input = new Input({ label: 'Username', validate })
const app = new App(input, { fullscreen: false })
await app.mount()
```

### Compose schemas for complex validation

```ts

const portSchema = z
  .string()
  .regex(/^\d+$/, 'Must be a number.')
  .transform(Number)
  .pipe(z.number().min(1024).max(65535))

const validate = zodValidator(portSchema)

console.log(validate('3000'))   // true
console.log(validate('80'))     // 'Number must be greater than or equal to 1024'
console.log(validate('abc'))    // 'Must be a number.'
```

### API table

| Parameter | Type | Description |
|---|---|---|
| `schema` | `ZodType` | Any Zod schema |
| return value | `PromptValidator` | Function: `(value: string) => true \| string` |

---

## useDotenv

Parses a `.env` file and exposes its values as a typed `Record<string, string>`. Call `reload` to re-read the file from disk without restarting the process.

### Peer dependency

```bash
npm install dotenv
```

### API

```ts
function useDotenv(path?: string): UseDotenvResult

type DotenvValues = Record<string, string>

interface UseDotenvResult {
  values: DotenvValues
  reload: () => DotenvValues
}
```

- `path`, path to the `.env` file. Defaults to `.env` in the current working directory.
- `values`, the parsed key-value pairs from the file. Updated in place each time `reload` is called.
- `reload`, re-reads the file from disk and returns the updated values. If the file does not exist, returns an empty object without throwing.

### Load environment variables from a file

```ts

const env = useDotenv()

console.log(env.values.DATABASE_URL)
console.log(env.values.API_KEY)
```

### Load from a custom path

```ts

const env = useDotenv('/path/to/.env.production')

console.log(env.values.NODE_ENV)
```

### Reload after the file changes

```ts

const env = useDotenv()

console.log(env.values.VERSION) // value at startup

// Later, after the file is updated on disk:
const updated = env.reload()
console.log(updated.VERSION)    // fresh value
```

### API table

| Property / Method | Type | Description |
|---|---|---|
| `values` | `DotenvValues` | Parsed key-value pairs from the `.env` file |
| `reload` | `() => DotenvValues` | Re-reads the file and returns updated values |

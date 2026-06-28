# AI & RAG Adapters

`@termuijs/adapters` includes exports for building AI-powered terminal apps: `useAI` for chat and embeddings, `LocalVectorStore` for in-process vector search, and the `indexDirectory` and `chunkText` helpers for indexing your own documents.

---

## useAI

A single adapter that wraps OpenAI and Anthropic behind a common interface. Load the peer dependency for whichever provider you use.

### Peer dependencies

```bash
npm install openai               # OpenAI
npm install @anthropic-ai/sdk   # Anthropic
```

### API

```ts
function useAI(provider: AIProvider, options: AIOptions): AIAdapter

type AIProvider = 'openai' | 'anthropic'

interface AIOptions {
  apiKey: string
}

interface AIAdapter {
  generate(prompt: string): Promise<string>
  chat(messages: AIMessage[]): AsyncIterable<string>
  embed?(text: string): Promise<number[]>   // OpenAI only
}

interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}
```

- `generate`, sends a single prompt and returns the full response as a string.
- `chat`, streams a multi-turn conversation. Yields tokens as they arrive. Use `for await` to consume them.
- `embed`, generates a vector embedding for the input text. Available on the OpenAI provider only (uses `text-embedding-3-small`).

OpenAI uses `gpt-4o-mini` for both `generate` and `chat`. Anthropic uses `claude-haiku-4-5`.

### Generate a single response

```ts

const ai = useAI('openai', { apiKey: process.env.OPENAI_API_KEY! })

const answer = await ai.generate('Summarize the changes in this diff: ...')
console.log(answer)
```

### Stream a conversation

```ts

const ai = useAI('anthropic', { apiKey: process.env.ANTHROPIC_API_KEY! })

const output = new Text('', { wrap: true })
const app = new App(output, { fullscreen: false })
await app.mount()

const messages = [{ role: 'user' as const, content: 'Explain closures in TypeScript.' }]

for await (const token of ai.chat(messages)) {
  output.setText(output.getText() + token)
}
```

### Generate embeddings (OpenAI)

```ts
const ai = useAI('openai', { apiKey: process.env.OPENAI_API_KEY! })

const vector = await ai.embed!('What is a TermUI widget?')
// vector is a number[] of length 1536
```

---

## LocalVectorStore

An in-process vector store for embedding-based similarity search. Stores document chunks in memory and writes them to a JSON file for persistence across runs.

### API

```ts
class LocalVectorStore {
  constructor(options?: VectorStoreOptions)
  addDocuments(docs: Omit<DocumentChunk, 'embedding'>[], ai: AIAdapter): Promise<void>
  query(queryText: string, ai: AIAdapter, limit?: number): Promise<DocumentChunk[]>
  load(): Promise<void>
  save(): Promise<void>
}

interface VectorStoreOptions {
  dbPath?: string  // path to persist the store as JSON
}

interface DocumentChunk {
  id: string
  text: string
  filePath: string
  embedding?: number[]
}
```

- `addDocuments`, embeds each chunk and stores it. Requires an `AIAdapter` with `embed` support.
- `query`, embeds the query, computes cosine similarity against all stored chunks, returns the top `limit` results (default: 3).
- `load` / `save`, reads and writes the store from `dbPath`. If no `dbPath` is set, data lives in memory only.

### Helper functions

```ts
// Splits a text string into overlapping chunks
function chunkText(text: string, size?: number, overlap?: number): string[]
// size defaults to 500 characters, overlap to 50

// Walks a directory, chunks all .md and .txt files, and adds them to the store
async function indexDirectory(
  docsPath: string,
  store: LocalVectorStore,
  ai: AIAdapter
): Promise<void>
```

### Build a vector store from files

```ts

const ai = useAI('openai', { apiKey: process.env.OPENAI_API_KEY! })

const store = new LocalVectorStore({ dbPath: './.cache/vectors.json' })
await store.load()

await indexDirectory('./docs', store, ai)
await store.save()

const results = await store.query('How do I add a border?', ai, 3)
for (const chunk of results) {
  console.log(chunk.filePath, chunk.text.slice(0, 100))
}
```

### Notes

- `LocalVectorStore` requires an `AIAdapter` built with `useAI('openai', ...)` because it calls `ai.embed` for vector search. The Anthropic adapter does not expose `embed`.
- `indexDirectory` reads a directory's `.md` and `.txt` files. Other file types are skipped.
- Index size is limited only by memory and the file count in the directory you index.

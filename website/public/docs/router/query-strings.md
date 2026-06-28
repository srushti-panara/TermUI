# Query Strings

The router parses query strings from paths automatically. You can read them from the router instance, from a `RouteMatch`, or inside a component with `useQueryParams`.

## Reading query params

After navigating to a path with a query string, read the parsed params from `router.query`:

```ts

const router = new Router()
router.addRoute('/search', () => SearchScreen)

router.push('/search?q=terminal&page=2')

console.log(router.currentPath)  // → '/search?q=terminal&page=2'
console.log(router.query)        // → { q: 'terminal', page: '2' }
```

All values are strings. Cast them yourself when you need a number or boolean.

## Pushing a route with query params

Pass a `query` object as the second argument to `push()` or `replace()`. The router serializes it and appends it to the path:

```ts
router.push('/search', { query: { q: 'terminal', page: '2' } })
// navigates to → /search?q=terminal&page=2

router.replace('/search', { query: { q: 'typescript' } })
// replaces current entry with → /search?q=typescript
```

If the path already has a query string, the router appends additional params with `&`:

```ts
router.replace('/search?x=1', { query: { y: '2' } })
// → /search?x=1&y=2
```

## Inline query strings in the path

You can write the query string directly in the path string:

```ts
router.push('/search?q=terminal&page=2')
```

This produces the same result as passing a `query` object. Use whichever form is more readable for your use case.

## URL encoding

The router uses `URLSearchParams` internally. Special characters are encoded automatically on serialize and decoded automatically on parse:

```ts
router.push('/search', { query: { q: 'hello world' } })
// path becomes → /search?q=hello+world

console.log(router.query)  // → { q: 'hello world' }
```

## Reading query params inside a component

Use `useQueryParams` to access query params from inside a screen component:

```ts

function SearchScreen() {
  const query = useQueryParams()
  // query → { q: 'terminal', page: '2' }

  return (
    <box>
      <text>Searching for: {query.q}</text>
      <text>Page: {query.page}</text>
    </box>
  )
}
```

`useQueryParams` returns the params that were active when the screen rendered. It does not subscribe to changes on its own, the router re-renders the screen on each navigation, so you always get the current values.

## Typed query params

`QueryParams` is `Record<string, string>`. All values are strings. Define a typed helper if you want stricter types:

```ts

interface SearchQuery {
  q: string
  page: string
  sort?: string
}

function parseSearchQuery(raw: QueryParams): SearchQuery {
  return {
    q: raw.q ?? '',
    page: raw.page ?? '1',
    sort: raw.sort,
  }
}

function SearchScreen() {
  const raw = useQueryParams()
  const query = parseSearchQuery(raw)

  return <text>Page {Number(query.page)}</text>
}
```

## Navigating with query params from a component

Combine `useNavigate` with the `query` option to navigate and set query params at the same time:

```ts

function SearchScreen() {
  const navigate = useNavigate()

  function nextPage(current: string) {
    navigate('/search', {
      query: { page: String(Number(current) + 1) },
    })
  }

  // ...
}
```

Pass `replace: true` to swap the current history entry instead of adding a new one:

```ts
navigate('/search', { replace: true, query: { q: 'new term' } })
```

## API reference

### Router methods

| Method / Property | Signature | Description |
|---|---|---|
| `push(path, options?)` | `(path: string, options?: { query?: QueryParams }) => void` | Navigate to a path, optionally with query params |
| `replace(path, options?)` | `(path: string, options?: { query?: QueryParams }) => void` | Replace the current history entry, optionally with query params |
| `router.query` | `QueryParams` | Parsed query params for the current route |

### Hooks

| Hook | Return type | Description |
|---|---|---|
| `useQueryParams()` | `QueryParams` | Returns the current route's parsed query params |

### Utility functions

| Function | Signature | Description |
|---|---|---|
| `parseQuery(queryString)` | `(qs: string) => QueryParams` | Parses a raw query string into a `QueryParams` object |
| `serializeQuery(query)` | `(q: QueryParams) => string` | Serializes a `QueryParams` object to a query string |

### Types

| Type | Definition |
|---|---|
| `QueryParams` | `Record<string, string>` |

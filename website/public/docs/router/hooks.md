# Router Hooks

The router exposes four hooks for use inside screen components. They read from the `RouterContext` that the router injects automatically when it renders a screen.

You do not need to wrap components in a provider manually. Any component rendered by the router has access to these hooks.

## useParams

Returns the dynamic route params for the current route.

```ts

function UserScreen() {
  const params = useParams()
  // params → { id: '42' }

  return <text>User ID: {params.id}</text>
}
```

Call `router.addRoute('/users/[id]', () => UserScreen)` and navigate to `/users/42`. `params.id` will be `'42'`.

All param values are strings. Cast them yourself when you need a number:

```ts
const params = useParams()
const userId = Number(params.id)
```

If the component is rendered outside a router context, `useParams` returns `{}`.

## useNavigate

Returns a navigate function you call to push or replace routes.

```ts

function HomeScreen() {
  const navigate = useNavigate()

  function openSettings() {
    navigate('/settings')
  }

  function openUser(id: string) {
    navigate(`/users/${id}`)
  }

  // ...
}
```

### Replace instead of push

Pass `replace: true` to swap the current history entry instead of adding a new one:

```ts
navigate('/login', { replace: true })
```

### Navigate with query params

Pass a `query` object to append query params to the path:

```ts
navigate('/search', { query: { q: 'terminal', page: '1' } })
// navigates to → /search?q=terminal&page=1
```

Combine both options at once:

```ts
navigate('/search', { replace: true, query: { q: 'typescript' } })
```

### Signature

```ts
useNavigate(): (
  path: string,
  options?: { replace?: boolean; query?: QueryParams }
) => void
```

If `useNavigate` is called outside a router context, the returned function is a no-op.

## useQueryParams

Returns the parsed query params for the current route.

```ts

function SearchScreen() {
  const query = useQueryParams()
  // query → { q: 'terminal', page: '2' }

  return <text>Results for: {query.q}</text>
}
```

Returns an empty object if there are no query params or if called outside a router context.

See the [Query Strings](/docs/router/query-strings) page for more detail on working with query params.

## useRouteMeta

Returns the `meta` object attached to the current route definition.

```ts

function AdminScreen() {
  const meta = useRouteMeta()
  // meta → { requiresAuth: true, role: 'admin' }

  return <text>Role: {String(meta.role)}</text>
}
```

Attach metadata when registering the route:

```ts
router.addRoutes([
  {
    path: '/admin',
    component: () => AdminScreen,
    meta: { requiresAuth: true, role: 'admin' },
  },
])
```

`meta` is typed as `Record<string, unknown>`. Cast individual values as needed:

```ts
const meta = useRouteMeta()
const role = meta.role as string
```

Returns `{}` if the route has no metadata or if called outside a router context.

## API reference

| Hook | Return type | Description |
|---|---|---|
| `useParams()` | `RouteParams` | Dynamic URL params for the current route |
| `useNavigate()` | `(path, options?) => void` | Function to push or replace a route |
| `useQueryParams()` | `QueryParams` | Parsed query string params for the current route |
| `useRouteMeta()` | `RouteMeta` | Metadata attached to the current route definition |

### Types

| Type | Definition |
|---|---|
| `RouteParams` | `Record<string, string>` |
| `QueryParams` | `Record<string, string>` |
| `RouteMeta` | `Record<string, unknown>` |

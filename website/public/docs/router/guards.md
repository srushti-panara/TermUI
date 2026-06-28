# Navigation Guards

Navigation guards let you run logic before a route becomes active. Use them to block access, redirect users, or run side effects after a transition completes.

## How guards work

Each route accepts two hooks:

- `beforeEnter`, runs before the route renders. Return `false` to block navigation, or a path string to redirect.
- `afterEnter`, runs after navigation succeeds. Use it for analytics, logging, or focus management.

Both hooks receive the target path as their only argument.

## Adding a guard

Pass `beforeEnter` when registering a route:

```ts

const router = new Router({ initialPath: '/' })

router.addRoute('/admin', () => AdminScreen, undefined, {
  beforeEnter: (to) => {
    if (!isAuthenticated()) {
      return '/login'   // redirect to login
    }
    return true         // allow navigation
  },
})
```

You can also pass guards via `addRoutes`:

```ts
router.addRoutes([
  {
    path: '/dashboard',
    component: () => DashboardScreen,
    beforeEnter: (to) => {
      if (!hasPermission('dashboard')) return false
      return true
    },
    afterEnter: (to) => {
      logPageView(to)
    },
  },
])
```

## Guard return values

| Return value | Effect |
|---|---|
| `true` | Allow navigation to proceed |
| `false` | Block navigation; the current screen stays visible |
| `'/some/path'` | Redirect to the given path instead |

Returning anything other than `false` or a string is treated as allowing navigation.

## Async guards

`beforeEnter` is typed as `(to: string) => boolean | string`, so it runs synchronously. For async checks like token validation or API calls, resolve the result before registering the route or cache the auth state in a variable your guard reads from:

```ts
let authed = false

// Resolve auth state before setting up routes
async function bootstrap() {
  authed = await checkSession()

  router.addRoute('/profile', () => ProfileScreen, undefined, {
    beforeEnter: () => {
      if (!authed) return '/login'
      return true
    },
  })

  router.push('/')
}
```

If your app has an auth store or reactive state object, read from it directly inside `beforeEnter`. The guard runs on every navigation attempt, so it always sees the latest value.

## Redirecting from a guard

Return a path string to redirect. The router resolves the new path through the full navigation lifecycle, including any guards on the redirect target:

```ts
router.addRoute('/old-settings', () => SettingsScreen, undefined, {
  beforeEnter: () => '/settings',   // always redirect
})

router.addRoute('/settings', () => SettingsScreen, undefined, {
  beforeEnter: (to) => {
    if (!isAuthenticated()) return '/login'
    return true
  },
})
```

The router stops redirect chains after 10 hops and emits an `error` event.

## Running logic after navigation

Use `afterEnter` for side effects that should run once the screen is active:

```ts
router.addRoute('/reports', () => ReportsScreen, undefined, {
  afterEnter: (to) => {
    analytics.track('screen_view', { path: to })
  },
})
```

`afterEnter` always receives the resolved path. It does not affect navigation and has no return value.

## Error handling in guards

If a guard throws, the error propagates to the caller. Wrap guard logic in try/catch when the check depends on external state that could fail:

```ts
router.addRoute('/data', () => DataScreen, undefined, {
  beforeEnter: (to) => {
    try {
      return hasAccess(to) ? true : '/forbidden'
    } catch {
      return '/error'
    }
  },
})
```

## API reference

| Hook | Signature | Description |
|---|---|---|
| `beforeEnter` | `(to: string) => boolean \| string` | Runs before the route renders. Return `false` to block, a string to redirect, or `true` to allow. |
| `afterEnter` | `(to: string) => void` | Runs after successful navigation. No return value. |

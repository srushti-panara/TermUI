# Router
`@termuijs/router` gives your terminal app screen-based navigation with a history stack, dynamic parameters, and event hooks.
## Installation
```ts
npm install @termuijs/router
```
## Setting up routes
Register routes with `addRoute()`. Each route maps a path pattern to a component loader:
```ts

const router = new Router({ initialPath: '/' })

router.addRoute('/',          () => HomeScreen)
router.addRoute('/settings',  () => SettingsScreen)
router.addRoute('/users/[id]', () => UserScreen)

// Or register several at once
router.addRoutes([
    { path: '/logs',        component: () => LogScreen },
    { path: '/logs/[...slug]', component: () => LogDetail },
])
```
## Navigating
```ts
// Push a new route onto the history stack
router.push('/settings')
console.log(router.currentPath)  // → '/settings'

// Push a dynamic route
router.push('/users/42')
console.log(router.current)
// → { route: ..., params: { id: '42' } }

// Go back
router.back()
console.log(router.currentPath)  // → '/settings'

// Replace. swaps the current entry without growing history
router.replace('/help')
console.log(router.historyLength)  // same as before
```
## Dynamic parameters
Use bracket syntax for dynamic segments. This is the same convention as Next.js file-based routing:
| Pattern       | Matches     | Params              |
| ------------- | ----------- | ------------------- |
| `/users/[id]` | `/users/42` | `{ id: '42' }`      |
| `/[...slug]`  | `/a/b/c`    | `{ slug: 'a/b/c' }` |
| `/settings`   | `/settings` | `{}`                |
## Listening for route changes
The router has an `events` emitter you can subscribe to. The `navigate` handler receives a `NavigateEvent` with `match`, `screen`, and `direction`. Read the route off `event.match`:
```ts
router.events.on('navigate', (event) => {
    console.log('Navigated to', event.match.route.path)
    console.log('Params:', event.match.params)
    console.log('Direction:', event.direction)
})

router.events.on('back', (event) => {
    console.log('Went back to', event?.match.route.path)
})
```
## API reference
| Method / Property                    | Description                                        |
| ------------------------------------ | -------------------------------------------------- |
| `addRoute(path, component, layout?)` | Register a single route                            |
| `addRoutes(routes)`                  | Register multiple routes at once                   |
| `push(path)`                         | Navigate to a new path                             |
| `replace(path)`                      | Replace the current history entry                  |
| `back()`                             | Go to the previous path                            |
| `currentPath`                        | The current path string                            |
| `current`                            | The current `RouteMatch` (route + params), or null |
| `historyLength`                      | Number of entries in the history stack             |
| `canGoBack`                          | Whether there's a previous entry to go back to     |

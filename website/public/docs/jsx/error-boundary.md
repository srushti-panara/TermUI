# ErrorBoundary
`ErrorBoundary` catches errors thrown during rendering or in effects, and displays a fallback UI instead of crashing the whole app.

Without one, a single thrown error bubbles up through the fiber tree and kills the process. With one, the error is contained to the subtree it wraps.
## Basic usage
```ts

function App() {
    return (
        <ErrorBoundary
            fallback={(err) => (
                <Box border="single" borderColor={{ type: 'named', name: 'red' }} padding={1}>
                    <Text bold color={{ type: 'named', name: 'red' }}>Something went wrong</Text>
                    <Text>{err.message}</Text>
                </Box>
            )}
        >

        </ErrorBoundary>
    )
}
```
## Props
| Prop       | Type                    | Required | Description                                               |
| ---------- | ----------------------- | -------- | --------------------------------------------------------- |
| `fallback` | `(err: Error) => VNode` | Yes      | Function that returns the UI to show when an error occurs |
| `onError`  | `(err: Error) => void`  | No       | Called when an error is caught, use for logging           |
| `children` | `VNode`                 | Yes      | The component tree to protect                             |

## Logging errors
```ts
<ErrorBoundary
    onError={(err) => {
        writeLog(`[ERROR] ${err.message}\n${err.stack}`)
    }}
    fallback={(err) => <Text>Error: {err.message}</Text>}
>

</ErrorBoundary>
```
## Placement strategy
One `ErrorBoundary` at the app root catches everything, but you lose the ability to recover partially. The recommended pattern is two tiers:

**Root boundary**, prevents total app crash, shows a global error screen:
```ts
function Root() {
    return (
        <ErrorBoundary fallback={GlobalErrorScreen}>

        </ErrorBoundary>
    )
}
```

**Section boundaries**, contain errors to one panel while the rest of the app keeps running:
```ts
function Dashboard() {
    return (
        <col>
            <ErrorBoundary fallback={(e) => <Text>Chart failed: {e.message}</Text>}>

            </ErrorBoundary>
            <ErrorBoundary fallback={(e) => <Text>Logs failed: {e.message}</Text>}>

            </ErrorBoundary>
        </col>
    )
}
```

If `ChartPanel` crashes, `LogPanel` keeps rendering.
## What gets caught
| Scenario                                                       | Caught?                                      |
| -------------------------------------------------------------- | -------------------------------------------- |
| Error thrown during initial render                             | Yes                                          |
| Error thrown in `useEffect` callback                           | Yes                                          |
| Error thrown inside an event handler (`useInput`, `useKeymap`) | No, these run outside the fiber render cycle |
| Unhandled promise rejection in an async action                 | No, use `try/catch` in async code            |

For event handler errors, wrap the handler body in a try/catch and call `useNotifications` or similar to surface the error to the user.
## See also

- [useNotifications](/docs/ui/notifications), surface errors as non-blocking toasts
- [Testing Guide](/docs/guides/testing), how to test components under error conditions

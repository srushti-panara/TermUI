# Event emitter

A generic, type-safe publish/subscribe system. The App, Router, and individual widgets all use it internally, and you can create your own for custom events.

## Usage

```ts

type MyEvents = {
    data: { value: number }
    error: string
}

const emitter = new EventEmitter<MyEvents>()

// Subscribe. returns an unsubscribe function
const unsub = emitter.on('data', (payload) => {
    console.log('Got:', payload.value)
})

// Fire once only
emitter.once('error', (msg) => console.error(msg))

// Emit
emitter.emit('data', { value: 42 })

// Clean up
unsub()
```

## API

| Method                 | Params               | Returns      | What it does                                                       |
| ---------------------- | -------------------- | ------------ | ------------------------------------------------------------------ |
| `on(event, handler)`   | event name, callback | `() => void` | Subscribe. Returns unsubscribe function.                           |
| `once(event, handler)` | event name, callback | `() => void` | Subscribe for one emission, then auto-removes.                     |
| `emit(event, data)`    | event name, payload  | `void`       | Fire the event to all current subscribers.                         |
| `removeAll(event?)`    | optional event name  | `void`       | Remove all handlers for one event, or all events if no name given. |

# Hooks Overview

The hooks `@termuijs/jsx` exports, grouped by what they do. Click a hook name to jump to its detail page where one exists.

## Installation

```bash
npm install @termuijs/jsx
```

All hooks are named exports:

```ts

```

---

## Input handling

| Hook | Returns | Detail |
|---|---|---|
| `useInput` | `void` | [useInput](/docs/jsx/use-input) |
| `useKeymap` | `void` | [useKeymap](/docs/jsx/use-keymap) |
| `useKeyboardNavigation` | `{ selectedIndex, setSelectedIndex }` | [useKeyboardNavigation](/docs/jsx/use-input#usekeyboardnavigation) |

---

## Async and data

| Hook | Returns | Detail |
|---|---|---|
| `useAsync` | `{ data, loading, error, refetch }` | [useAsync](/docs/jsx/use-async) |
| `useSubprocess` | `{ run }` |, |

---

## Lifecycle

| Hook | Returns | Detail |
|---|---|---|
| `useEffect` | `void` |, |

---

## State

| Hook | Returns | Detail |
|---|---|---|
| `useState` | `[T, setter]` |, |
| `useReducer` | `[state, dispatch]` |, |
| `useBoolean` | `[boolean, actions]` |, |
| `useToggle` | `[boolean, actions]` |, |
| `useCounter` | `[number, actions]` |, |
| `useList` | `[T[], actions]` |, |
| `useMap` | `[Map<K,V>, actions]` |, |
| `useSet` | `[Set<T>, actions]` |, |

---

## Refs and memoization

| Hook | Returns | Detail |
|---|---|---|
| `useRef` | `{ current: T }` |, |
| `useMemo` | `T` |, |
| `useCallback` | `T` |, |
| `useImperativeHandle` | `void` |, |

---

## Timing

| Hook | Returns | Detail |
|---|---|---|
| `useInterval` | `void` |, |
| `useTimeout` | `void` |, |
| `useDebounce` | `T` |, |
| `useThrottle` | `T` |, |
| `useStopwatch` | `[elapsed, controls]` |, |
| `useCountdown` | `[count, controls]` |, |

---

## Layout and terminal

| Hook | Returns | Detail |
|---|---|---|
| `useTerminalSize` | `{ cols, rows }` |, |
| `useElementSize` | `[ref, { width, height }]` |, |

---

## Animation and motion

| Hook | Returns | Detail |
|---|---|---|
| `useMotion` | `{ reduced }` | [useMotion](/docs/jsx/use-motion) |

---

## Focus management

| Hook | Returns | Detail |
|---|---|---|
| `useFocus` | `{ isFocused }` | [Focus](/docs/jsx/focus) |
| `useFocusManager` | `{ focused, focus, blur, FocusContext }` | [Focus](/docs/jsx/focus) |
| `useFocusWithin` | `boolean` | [Focus](/docs/jsx/focus) |
| `useFocusTrap` | `void` | [Focus](/docs/jsx/focus) |

---

## Context and providers

| Hook | Returns | Detail |
|---|---|---|
| `useContext` | `T` | [Context](/docs/jsx/context) |

---

## System and utilities

| Hook | Returns | Detail |
|---|---|---|
| `useClipboard` | `{ copied, copy, read }` |, |
| `useBell` | `() => void` |, |
| `useModal` | `{ visible, props, show, hide, dismiss }` |, |
| `useId` | `string` |, |
| `useInsertBefore` | `void` |, |

# Solid.js Learning Lab

A hands-on project for learning Solid.js from fundamentals to advanced patterns, built with **Solid.js 1.9**, **@solidjs/router**, **Kobalte UI**, and **Tailwind CSS v4**.

## Project Structure

```
src/
├── index.tsx          # Entry point — Solid's render() takes a function, not a component instance
├── App.tsx            # Routing + lazy() code splitting
├── stores/
│   └── settings.tsx   # createStore + Context API (global state)
├── components/        # Shared UI (Layout, Header, Sidebar, DataTable, etc.)
├── pages/
│   ├── Dashboard.tsx  # Composition page — assembles components with no local state
│   ├── Settings.tsx   # Store consumption + Kobalte ToggleButton/Button
│   └── Workshop.tsx   # Interactive concept explorer (6 sections)
└── dashboard/         # Placeholder for future domain-specific modules
```

## Core Concepts Covered

### Reactivity Primitives

| Primitive | Where | What it demonstrates |
|---|---|---|
| `createSignal` | Workshop, DataTable, Settings | Atomic reactive values. Reading a signal inside a tracking scope (JSX expression or `createEffect`) creates a subscription. Writing to it notifies only those subscribers — no diffing, no VDOM. |
| `createEffect` | Workshop (Batch section), DataTable | Side-effect that auto-tracks signal reads inside it. Solid sets a global `Listener` before running the effect; any signal read during execution registers the effect as a dependent. |
| `createMemo` | Workshop (Memos section) | Cached derivation — recomputes only when its tracked dependencies change. Unlike a plain derived function `() => expr`, a memo stores its result and won't recompute if read multiple times between changes. |
| `createStore` | settings.tsx | Deep reactive state via Proxy. Supports path-based setters like `setState("appearance", "darkMode", v => !v)` that surgically update nested properties without replacing parent objects. |
| `createResource` | DataTable | Async primitive tied to a signal source. When the source (page number) changes, the fetcher re-runs automatically. Exposes `.loading`, `.error`, `.state` metadata for UI branching. |

### Reactivity Modifiers

- **`batch()`** — Groups multiple signal writes so effects fire once, not once per write. Workshop demonstrates this with an effect-run counter proving reduced executions.
- **`untrack()`** — Reads a signal's value without subscribing the current tracking scope. Useful when an effect needs to *reference* a value without *reacting* to it.
- **`produce()`** — Immer-style mutable draft for stores. Used in `resetToDefaults` to update multiple nested paths atomically via familiar mutation syntax.

### Control Flow Components

Solid compiles these to real DOM operations — no virtual DOM diffing:

- **`<Show when={...}>`** — Conditional render. Mounts/unmounts real DOM nodes. The `when` expression is tracked as a fine-grained subscription.
- **`<For each={...}>`** — Keyed list iteration. Unlike `.map()` in React, `<For>` tracks each item by reference and only updates the specific DOM nodes that changed.
- **`<Switch>/<Match>`** — Pattern matching over discriminated unions. Workshop uses this with an `AppState` type discriminated by `status` field.
- **`<Suspense>`** — Shows fallback while async boundaries (lazy components, resources) resolve. Used for lazy-loaded routes but intentionally *avoided* for paginated data (explained in DataTable).
- **`<ErrorBoundary>`** — Catches render-time throws, exposes error and reset callback.

### Component Patterns

**Why you can't destructure props:**
In Solid, props are a Proxy. Each `props.x` access is a getter that reads the underlying signal. Destructuring (`const { x } = props`) calls that getter once outside any tracking scope, producing a dead static value. The codebase consistently uses `props.x` in JSX to preserve reactivity.

**Safe alternatives when needed:**
- **`mergeProps(defaults, props)`** — Merges default values without breaking reactive getters.
- **`splitProps(props, ["local", "keys"])`** — Splits props into `[local, rest]` for clean forwarding with `{...rest}`.

**Generic components:**
Workshop's `List<T>` component demonstrates TypeScript generics with Solid — `items: T[]` + `renderItem: (item: T) => JSX.Element` — proving Solid's JSX works naturally with TS generics.

### State Management with Context

The settings store (`stores/settings.tsx`) demonstrates the full pattern:

1. **State shape** — `SettingsState` interface with nested objects (appearance, notifications, profile)
2. **Store creation** — `createStore(structuredClone(defaults))` — deep clone prevents the store from mutating the constant
3. **Actions factory** — Named methods wrapping `setState` calls, keeping mutation logic centralized
4. **Context** — `createContext<[SettingsState, Actions]>()` exposes a `[state, actions]` tuple (mirrors Solid idiom)
5. **Provider/Consumer split** — `SettingsProvider` provides context; consumers call `useSettings()` in a *child* component. You cannot consume a Context in the same component that provides it — the Provider hasn't mounted yet when the component body runs.

### Routing & Code Splitting

```tsx
const Dashboard = lazy(() => import("~/pages/Dashboard"));
```

`lazy()` wraps a dynamic `import()`, producing a component that triggers `<Suspense>` on first load. The `<Router root={Layout}>` pattern wraps all routes in a shared shell with sidebar, header, and the Suspense boundary.

### The Snapshot Pattern (DataTable)

A key pattern for paginated data where Suspense isn't appropriate:

```
createResource(page, fetcher)  →  can be undefined during refetch
        ↓
createEffect watches resource  →  writes to snapshot signal only when data arrives
        ↓
UI renders from snapshot       →  always shows last-good data, never flashes empty
```

This avoids the Suspense trap where every page change would replace the table with a skeleton.

### Lifecycle

- **`onMount`** — Runs once after initial render. Equivalent to an effect with no dependencies. Used in Workshop's Timer to start an interval.
- **`onCleanup`** — Runs when the enclosing reactive scope is disposed (component unmount, `<Show>` toggling off). Used to clear intervals and prevent memory leaks.

### Portal & Dynamic

- **`<Portal mount={document.body}>`** — Renders children outside the component hierarchy (directly into `<body>`), useful for modals and overlays.
- **`<Dynamic component={comp}>`** — Switches which component renders based on a signal value at runtime, avoiding long `<Switch>/<Match>` chains.

## JavaScript / TypeScript Concepts

| Concept | Example |
|---|---|
| Closures | Every signal getter/setter pair is a closure over shared internal state. Actions close over `setState`. |
| Dynamic `import()` | ES module code splitting — each `lazy()` call produces a separate Vite chunk. |
| `structuredClone()` | Deep-copies the defaults object so `createStore` doesn't mutate the original. |
| Discriminated unions | `AppState = { status: "idle" } \| { status: "error"; message: string }` — type-safe state machines with `<Switch>/<Match>`. |
| `Record<K, V>` | Typed lookup maps for badge colors, status indicators — avoids `any` while keeping dynamic access. |
| Generics | `List<T>` component, `ApiResponse` typing — reusable typed abstractions. |
| `Array.from({ length: n })` | Creates skeleton rows and padding arrays without pre-existing data. |
| Template literal types | URL construction in the data fetcher. |
| `ReturnType<typeof fn>` | Infers action types from the factory function without redundant type declarations. |

## UI Layer

- **Kobalte** provides accessible, unstyled compound components (Tooltip, Progress, Badge, Separator, Button, ToggleButton, Collapsible) — each composed from semantic parts (Trigger, Content, Portal, etc.).
- **Tailwind v4** with `@import "tailwindcss"` single-import syntax, `@apply` composition, and class-based dark mode toggled by the Solid store.
- Dark mode uses a `.dark-mode` ancestor class on the layout root, driven reactively by `settings.appearance.darkMode`.

## Key Takeaway

Solid's reactivity is **compile-time + proxy-based**: the JSX compiler turns expressions into fine-grained DOM effects, and stores use Proxies for deep tracking. There is no virtual DOM, no reconciliation, and no component re-execution — the component function body runs **once**, and only the specific DOM nodes bound to changed signals update. This is why destructuring props kills reactivity, why `batch` reduces effect runs, and why reading a signal outside a tracking scope produces a static value.

For a deeper explanation of the tracking mechanism (the global `Listener` variable, `readSignal`, and why JSX is tracked but event handlers aren't), see [SOLID_REACTIVITY_EXPLAINED.md](SOLID_REACTIVITY_EXPLAINED.md).

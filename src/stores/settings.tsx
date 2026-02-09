/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  createStore — deep nested reactivity in Solid.js
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 *  WHY createStore?
 *  ────────────────
 *  createSignal  → great for primitive values (string, number, boolean).
 *  createStore   → wraps an OBJECT in a reactive Proxy so that every
 *                  nested property is individually tracked.
 *
 *  Analogy with Vue 3:
 *    Vue:   const state = reactive({ appearance: { darkMode: false } })
 *    Solid: const [state, setState] = createStore({ appearance: { darkMode: false } })
 *
 *  Both use JS Proxies under the hood to intercept property access.
 *  The key difference is the SETTER:
 *
 *    Vue:   state.appearance.darkMode = true;          // direct mutation
 *    Solid: setState("appearance", "darkMode", true);  // path-based setter
 *           setState(produce(s => s.appearance.darkMode = true)); // or immer-style
 *
 *  Solid prefers explicit setters because it makes the "write" side intentional.
 *  Vue allows direct mutation because its Proxy traps the `set` operation.
 *
 *  HOW the Proxy works:
 *  ────────────────────
 *  When you read `state.appearance.darkMode`:
 *    1. The top-level Proxy intercepts the read of `.appearance`
 *    2. Returns a NEW Proxy for the nested object
 *    3. That Proxy intercepts `.darkMode`
 *    4. If there's a Listener (we're inside an effect/JSX), it subscribes
 *
 *  When you call `setState("appearance", "darkMode", true)`:
 *    1. Solid walks the path: state → appearance → darkModeoxy intercepts `.darkMode`
 *    2. Only notifies effects that read THAT specific path
 *    3. Effects reading `state.appearance.compactView` are NOT notified
 *
 *  This is why createStore is efficient: FINE-GRAINED nested tracking.
 *
 *  PATH-BASED SETTER examples:
 *  ───────────────────────────
 *  setState("appearance", "darkMode", true)       // set a leaf
 *  setState("appearance", { darkMode: true })     // merge into nested object
 *  setState("profile", "name", n => n.toUpperCase()) // functional update
 *  setState(produce(s => {                        // immer-style batch mutation
 *    s.appearance.darkMode = true;
 *    s.notifications.email = false;
 *  }));
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
import { createContext, useContext, type ParentProps } from "solid-js";
import { createStore, produce } from "solid-js/store";

// ── The shape of our nested settings state ──
export interface SettingsState {
  appearance: {
    darkMode: boolean;
    compactView: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
  };
  profile: {
    name: string;
    role: string;
  };
}

// ── Default values ──
const defaultSettings: SettingsState = {
  appearance: {
    darkMode: false,
    compactView: false,
  },
  notifications: {
    email: true,
    push: false,
  },
  profile: {
    name: "Guille",
    role: "Admin",
  },
};

/**
 * Helper actions that wrap setState with descriptive names.
 * This is a common Solid pattern: expose "actions" alongside the store
 * so consumers don't need to know the internal path structure.
 */
function createSettingsActions(
  setState: ReturnType<typeof createStore<SettingsState>>[1]
) {
  return {
    // ── Path-based setters (one property at a time) ──
    toggleDarkMode: () =>
      setState("appearance", "darkMode", (prev) => !prev),

    toggleCompactView: () =>
      setState("appearance", "compactView", (prev) => !prev),

    toggleEmailNotifications: () =>
      setState("notifications", "email", (prev) => !prev),

    togglePushNotifications: () =>
      setState("notifications", "push", (prev) => !prev),

    setProfileName: (name: string) =>
      setState("profile", "name", name),

    // ── produce() — immer-style batch mutation ──
    // Useful when you need to update multiple nested paths at once.
    // `produce` gives you a mutable draft; Solid diffs it and fires
    // fine-grained updates for only the properties that actually changed.
    resetToDefaults: () =>
      setState(
        produce((draft) => {
          draft.appearance.darkMode = false;
          draft.appearance.compactView = false;
          draft.notifications.email = true;
          draft.notifications.push = false;
        })
      ),
  };
}

export type SettingsActions = ReturnType<typeof createSettingsActions>;

// ── Context: lets any component in the tree read/write settings ──
type SettingsContextValue = [state: SettingsState, actions: SettingsActions];

const SettingsContext = createContext<SettingsContextValue>();

/**
 * Provider component — wrap your app (or a subtree) with this.
 * createStore returns [proxyObject, setterFn], similar to createSignal
 * but the "getter" is an object you read properties from (not a function).
 */
export function SettingsProvider(props: ParentProps) {
  const [state, setState] = createStore<SettingsState>(structuredClone(defaultSettings));
  const actions = createSettingsActions(setState);

  return (
    <SettingsContext.Provider value={[state, actions]}>
      {props.children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to consume the settings store.
 * Returns [state, actions] — state is the reactive Proxy, actions are the setters.
 */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within <SettingsProvider>");
  return ctx;
}

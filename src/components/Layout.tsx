import { Suspense, type ParentProps } from "solid-js";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { SettingsProvider, useSettings } from "~/stores/settings";

/**
 * Route-level Suspense with lazy()
 * ────────────────────────────────────────────
 * In App.tsx, pages are loaded with `lazy(() => import("./pages/Dashboard"))`.
 * `lazy()` returns a component that internally throws a Promise while the
 * JS chunk is downloading — this is how Suspense knows to show a fallback.
 *
 * Without a <Suspense> boundary, the first navigation to any route would
 * briefly render nothing (blank flash) while the chunk loads.
 *
 * By wrapping `{props.children}` (the route content) in <Suspense>,
 * we get a smooth skeleton fallback during code-split loading.
 *
 * Key distinction from DataTable:
 *   - DataTable uses createResource (repeated fetches → pagination).
 *     Suspense re-triggers on every source change, which is bad for UX.
 *   - lazy() only loads ONCE per route. After the chunk is cached,
 *     Suspense never triggers again. This makes it a perfect fit.
 *
 * Rule of thumb:
 *   ✅ Use Suspense for: lazy routes, one-shot data loads
 *   ❌ Avoid Suspense for: paginated/polled data (use snapshot pattern)
 */

/**
 * Why two components?
 * ─────────────────────────────
 * We can't call useSettings() in the same component that renders
 * <SettingsProvider>, because the Context isn't available until
 * the Provider's children render.
 *
 * So Layout provides the context, and Shell consumes it.
 * This is the same pattern React uses with Context.
 */
/**
 * Skeleton shown while a lazy-loaded page chunk downloads.
 * Mimics the general shape of a page: heading + card grid.
 */
function PageSkeleton() {
  return (
    <div class="space-y-6 animate-pulse">
      {/* Page title */}
      <div>
        <div class="h-7 w-40 bg-gray-200 rounded" />
        <div class="h-4 w-64 bg-gray-100 rounded mt-2" />
      </div>
      {/* Card row */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(() => (
          <div class="bg-white rounded-xl border border-gray-100 p-5 h-28" />
        ))}
      </div>
      {/* Content block */}
      <div class="bg-white rounded-xl border border-gray-100 p-5 h-64" />
    </div>
  );
}

function Shell(props: ParentProps) {
  const [settings] = useSettings();

  // Dynamic class expressions
  // ────────────────────────────────────
  // This function is called inside a JSX attribute, which compiles
  // to an effect. Every store property read here (darkMode, compactView)
  // creates a fine-grained subscription.
  //
  // When you toggle dark mode in Settings, Solid updates ONLY the
  // `class` attribute on this <div> — nothing else re-renders.

  return (
    <div
      class={`flex h-screen transition-colors duration-300 ${
        settings.appearance.darkMode
          ? "dark-mode bg-gray-950 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <Sidebar />
      <div class="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main
          class={`flex-1 overflow-y-auto transition-all duration-300 ${
            settings.appearance.compactView ? "p-3" : "p-6"
          }`}
        >
          <Suspense fallback={<PageSkeleton />}>
            {props.children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function Layout(props: ParentProps) {
  return (
    <SettingsProvider>
      <Shell>{props.children}</Shell>
    </SettingsProvider>
  );
}

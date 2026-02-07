import type { ParentProps } from "solid-js";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { SettingsProvider, useSettings } from "~/stores/settings";

/**
 * LEARNING: Why two components?
 * ─────────────────────────────
 * We can't call useSettings() in the same component that renders
 * <SettingsProvider>, because the Context isn't available until
 * the Provider's children render.
 *
 * So Layout provides the context, and Shell consumes it.
 * This is the same pattern React uses with Context.
 */
function Shell(props: ParentProps) {
  const [settings] = useSettings();

  // LEARNING: Dynamic class expressions
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
          {props.children}
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

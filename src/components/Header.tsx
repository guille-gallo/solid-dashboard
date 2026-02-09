import { Tooltip } from "@kobalte/core/tooltip";
import { Show } from "solid-js";
import { useSettings } from "~/stores/settings";

export default function Header() {
  // ── Reading from the store ──
  // `settings` is a reactive Proxy. Every property read inside JSX
  // (which compiles to an effect) creates a fine-grained subscription.
  //
  // When you toggle notifications in Settings page, ONLY the parts of
  // this Header that read notification-related properties will update.
  const [settings] = useSettings();

  const now = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header
      class={`h-16 flex items-center justify-between px-6 shrink-0 border-b transition-colors duration-300 ${
        settings.appearance.darkMode
          ? "bg-gray-900 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div>
        <h2 class="text-sm text-gray-500">{now}</h2>
      </div>

      <div class="flex items-center gap-4">
        {/* Notification bell — reacts to store changes */}
        <Tooltip openDelay={300}>
          <Tooltip.Trigger class={`relative p-2 rounded-lg transition-colors cursor-pointer ${
              settings.appearance.darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}>
            <span class="text-xl">🔔</span>
            {/* Red dot only shows when at least one notification channel is on */}
            <Show when={settings.notifications.email || settings.notifications.push}>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Show>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content class="kb-tooltip-content">
              Notifications: {settings.notifications.email ? "Email ✓" : "Email ✗"}{" "}
              {settings.notifications.push ? "Push ✓" : "Push ✗"}
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip>

        {/* Avatar — reads profile from the store */}
        <Tooltip openDelay={300}>
          <Tooltip.Trigger class="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold cursor-pointer">
            {/* Only this text node re-renders when profile.name changes */}
            {settings.profile.name[0]}
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content class="kb-tooltip-content">
              {settings.profile.name} — {settings.profile.role}
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip>
      </div>
    </header>
  );
}

import { createSignal } from "solid-js";
import { Separator } from "@kobalte/core/separator";
import { Button } from "@kobalte/core/button";
import { ToggleButton } from "@kobalte/core/toggle-button";
import { useSettings } from "~/stores/settings";

function SettingRow(props: {
  title: string;
  description: string;
  children: any;
}) {
  return (
    <div class="flex items-center justify-between py-4">
      <div>
        <p class="text-sm font-medium">{props.title}</p>
        <p class="text-xs text-gray-400 mt-0.5">{props.description}</p>
      </div>
      {props.children}
    </div>
  );
}

function Toggle(props: { pressed: boolean; onToggle: () => void }) {
  return (
    <ToggleButton
      pressed={props.pressed}
      onChange={props.onToggle}
      class={`w-12 h-7 rounded-full relative transition-colors ${
        props.pressed ? "bg-indigo-600" : "bg-gray-300"
      }`}
    >
      <span
        class={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
          props.pressed ? "translate-x-5" : ""
        }`}
      />
    </ToggleButton>
  );
}

export default function Settings() {
  // ── LEARNING: consuming the store ──
  // `settings` is the reactive Proxy (the "getter" side of createStore).
  // `actions` wrap setState with descriptive names.
  //
  // BEFORE (3 separate signals — local, not shared):
  //   const [darkMode, setDarkMode] = createSignal(false);
  //   const [notifications, setNotifications] = createSignal(true);
  //   const [compactView, setCompactView] = createSignal(false);
  //
  // AFTER (one store, nested, shared via Context):
  //   settings.appearance.darkMode      ← reads are Proxy-tracked
  //   actions.toggleDarkMode()           ← calls setState("appearance", "darkMode", prev => !prev)
  const [settings, actions] = useSettings();
  const [saved, setSaved] = createSignal(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div class="space-y-6 max-w-2xl">
      <div>
        <h1 class="text-2xl font-bold">Settings</h1>
        <p class="text-sm text-gray-500 mt-1">
          Manage your dashboard preferences. Changes are reflected in the
          Header in real-time (shared store).
        </p>
      </div>

      {/* ── Appearance ── */}
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 class="text-base font-semibold mb-2">Appearance</h3>
        <Separator class="kb-separator" />

        <SettingRow
          title="Dark Mode"
          description="Switch between light and dark theme"
        >
          {/* settings.appearance.darkMode → Proxy read → fine-grained subscription */}
          <Toggle
            pressed={settings.appearance.darkMode}
            onToggle={actions.toggleDarkMode}
          />
        </SettingRow>

        <SettingRow
          title="Compact View"
          description="Reduce spacing in lists and tables"
        >
          <Toggle
            pressed={settings.appearance.compactView}
            onToggle={actions.toggleCompactView}
          />
        </SettingRow>
      </div>

      {/* ── Notifications ── */}
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 class="text-base font-semibold mb-2">Notifications</h3>
        <Separator class="kb-separator" />

        <SettingRow
          title="Email Notifications"
          description="Receive weekly digest and alerts"
        >
          <Toggle
            pressed={settings.notifications.email}
            onToggle={actions.toggleEmailNotifications}
          />
        </SettingRow>

        <SettingRow
          title="Push Notifications"
          description="Browser push notifications for urgent alerts"
        >
          <Toggle
            pressed={settings.notifications.push}
            onToggle={actions.togglePushNotifications}
          />
        </SettingRow>
      </div>

      {/* ── Profile ── */}
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 class="text-base font-semibold mb-2">Profile</h3>
        <Separator class="kb-separator" />

        <SettingRow
          title="Display Name"
          description="Shown in the header avatar"
        >
          <input
            type="text"
            value={settings.profile.name}
            onInput={(e) => actions.setProfileName(e.currentTarget.value)}
            class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
          />
        </SettingRow>
      </div>

      {/* ── Actions ── */}
      <div class="flex items-center gap-3">
        <Button
          class="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          onClick={handleSave}
        >
          Save Changes
        </Button>
        <Button
          class="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
          onClick={actions.resetToDefaults}
        >
          Reset to Defaults
        </Button>
        {saved() && (
          <span class="text-sm text-emerald-600 font-medium">
            ✓ Settings saved!
          </span>
        )}
      </div>
    </div>
  );
}

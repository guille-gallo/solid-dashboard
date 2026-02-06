import { createSignal } from "solid-js";
import { Separator } from "@kobalte/core/separator";
import { Button } from "@kobalte/core/button";
import { ToggleButton } from "@kobalte/core/toggle-button";

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

export default function Settings() {
  const [darkMode, setDarkMode] = createSignal(false);
  const [notifications, setNotifications] = createSignal(true);
  const [compactView, setCompactView] = createSignal(false);
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
          Manage your dashboard preferences.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 class="text-base font-semibold mb-2">Appearance</h3>
        <Separator class="kb-separator" />

        <SettingRow
          title="Dark Mode"
          description="Switch between light and dark theme"
        >
          <ToggleButton
            pressed={darkMode()}
            onChange={setDarkMode}
            class={`w-12 h-7 rounded-full relative transition-colors ${
              darkMode() ? "bg-indigo-600" : "bg-gray-300"
            }`}
          >
            <span
              class={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                darkMode() ? "translate-x-5" : ""
              }`}
            />
          </ToggleButton>
        </SettingRow>

        <SettingRow
          title="Compact View"
          description="Reduce spacing in lists and tables"
        >
          <ToggleButton
            pressed={compactView()}
            onChange={setCompactView}
            class={`w-12 h-7 rounded-full relative transition-colors ${
              compactView() ? "bg-indigo-600" : "bg-gray-300"
            }`}
          >
            <span
              class={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                compactView() ? "translate-x-5" : ""
              }`}
            />
          </ToggleButton>
        </SettingRow>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 class="text-base font-semibold mb-2">Notifications</h3>
        <Separator class="kb-separator" />

        <SettingRow
          title="Email Notifications"
          description="Receive weekly digest and alerts"
        >
          <ToggleButton
            pressed={notifications()}
            onChange={setNotifications}
            class={`w-12 h-7 rounded-full relative transition-colors ${
              notifications() ? "bg-indigo-600" : "bg-gray-300"
            }`}
          >
            <span
              class={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                notifications() ? "translate-x-5" : ""
              }`}
            />
          </ToggleButton>
        </SettingRow>
      </div>

      {/* Save button */}
      <div class="flex items-center gap-3">
        <Button
          class="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          onClick={handleSave}
        >
          Save Changes
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

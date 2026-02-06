import { Tooltip } from "@kobalte/core/tooltip";
import { createSignal } from "solid-js";

export default function Header() {
  const [now] = createSignal(
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  return (
    <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div>
        <h2 class="text-sm text-gray-500">{now()}</h2>
      </div>

      <div class="flex items-center gap-4">
        {/* Notification bell with Kobalte Tooltip */}
        <Tooltip openDelay={300}>
          <Tooltip.Trigger class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <span class="text-xl">🔔</span>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content class="kb-tooltip-content">
              3 new notifications
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip>

        {/* Avatar */}
        <Tooltip openDelay={300}>
          <Tooltip.Trigger class="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold cursor-pointer">
            G
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content class="kb-tooltip-content">
              Guille — Admin
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip>
      </div>
    </header>
  );
}

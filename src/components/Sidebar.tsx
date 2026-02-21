import { A } from "@solidjs/router";
import { Separator } from "@kobalte/core/separator";

function NavLink(props: { href: string; label: string; icon: string }) {
  return (
    <A
      href={props.href}
      end={props.href === "/"}
      class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
      activeClass="!bg-indigo-600 !text-white"
    >
      <span class="text-lg">{props.icon}</span>
      {props.label}
    </A>
  );
}

export default function Sidebar() {
  return (
    <aside class="w-64 bg-gray-900 text-white flex flex-col shrink-0">
      {/* Brand */}
      <div class="flex items-center gap-2 px-5 h-16 shrink-0">
        <span class="text-2xl">📊</span>
        <span class="text-lg font-bold tracking-tight">Solid Dash</span>
      </div>

      <Separator class="kb-separator !bg-gray-700 !my-0" />

      {/* Navigation */}
      <nav class="flex-1 px-3 py-4 space-y-1">
        <NavLink href="/" label="Dashboard" icon="🏠" />
        <NavLink href="/workshop" label="Workshop" icon="🧪" />
        <NavLink href="/settings" label="Settings" icon="⚙️" />
      </nav>

      <Separator class="kb-separator !bg-gray-700 !my-0" />

      {/* Footer */}
      <div class="px-5 py-4 text-xs text-gray-500">
        Solid.js + Kobalte
        <br />
        Dashboard Demo
      </div>
    </aside>
  );
}

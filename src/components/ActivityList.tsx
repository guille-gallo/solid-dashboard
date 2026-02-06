import { For } from "solid-js";
import { Badge } from "@kobalte/core/badge";

interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  status: "success" | "warning" | "info";
}

const activities: Activity[] = [
  { id: 1, user: "Alice", action: "deployed", target: "v2.4.1 to production", time: "2 min ago", status: "success" },
  { id: 2, user: "Bob", action: "opened", target: "PR #342 — Fix auth flow", time: "18 min ago", status: "info" },
  { id: 3, user: "Carol", action: "flagged", target: "high memory usage on worker-3", time: "45 min ago", status: "warning" },
  { id: 4, user: "Dave", action: "merged", target: "PR #339 — Add dark mode", time: "1 h ago", status: "success" },
  { id: 5, user: "Eve", action: "commented on", target: "Issue #87 — Stale cache", time: "2 h ago", status: "info" },
];

const badgeColors: Record<Activity["status"], string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-sky-100 text-sky-700",
};

export default function ActivityList() {
  return (
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 class="text-base font-semibold mb-4">Recent Activity</h3>
      <ul class="space-y-4">
        <For each={activities}>
          {(item) => (
            <li class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                {item.user[0]}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm">
                  <span class="font-medium">{item.user}</span>{" "}
                  {item.action}{" "}
                  <span class="text-gray-600">{item.target}</span>
                </p>
                <p class="text-xs text-gray-400 mt-0.5">{item.time}</p>
              </div>
              <Badge class={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badgeColors[item.status]}`}>
                {item.status}
              </Badge>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}

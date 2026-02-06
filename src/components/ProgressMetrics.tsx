import { Progress } from "@kobalte/core/progress";
import { For } from "solid-js";

interface Metric {
  label: string;
  value: number;
  max: number;
  color: string;
}

const metrics: Metric[] = [
  { label: "CPU Usage", value: 67, max: 100, color: "bg-indigo-500" },
  { label: "Memory", value: 4.2, max: 8, color: "bg-emerald-500" },
  { label: "Disk I/O", value: 34, max: 100, color: "bg-amber-500" },
  { label: "Network", value: 82, max: 100, color: "bg-sky-500" },
];

export default function ProgressMetrics() {
  return (
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 class="text-base font-semibold mb-4">System Health</h3>
      <div class="space-y-5">
        <For each={metrics}>
          {(m) => {
            const pct = () => Math.round((m.value / m.max) * 100);
            return (
              <Progress value={pct()} minValue={0} maxValue={100} class="space-y-1.5">
                <div class="flex justify-between text-sm">
                  <Progress.Label class="font-medium text-gray-700">
                    {m.label}
                  </Progress.Label>
                  <Progress.ValueLabel class="text-gray-500">
                    {m.label === "Memory"
                      ? `${m.value} / ${m.max} GB`
                      : `${pct()}%`}
                  </Progress.ValueLabel>
                </div>
                <Progress.Track class="progress-track">
                  <Progress.Fill class={`progress-fill ${m.color}`} />
                </Progress.Track>
              </Progress>
            );
          }}
        </For>
      </div>
    </div>
  );
}

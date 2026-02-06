import { createSignal, For } from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import { Progress } from "@kobalte/core/progress";
import { Separator } from "@kobalte/core/separator";

/* ── Mock chart data (bar representation with CSS) ── */
const monthlyData = [
  { month: "Jul", value: 4200 },
  { month: "Aug", value: 5800 },
  { month: "Sep", value: 5100 },
  { month: "Oct", value: 7200 },
  { month: "Nov", value: 6500 },
  { month: "Dec", value: 8400 },
  { month: "Jan", value: 7800 },
];

const channelData = [
  { name: "Organic Search", pct: 42, color: "bg-indigo-500" },
  { name: "Direct", pct: 28, color: "bg-emerald-500" },
  { name: "Referral", pct: 18, color: "bg-amber-500" },
  { name: "Social", pct: 12, color: "bg-sky-500" },
];

const max = Math.max(...monthlyData.map((d) => d.value));

function BarChart() {
  return (
    <div class="flex items-end gap-3 h-48">
      <For each={monthlyData}>
        {(d) => {
          const height = () => `${(d.value / max) * 100}%`;
          return (
            <div class="flex-1 flex flex-col items-center gap-1">
              <span class="text-xs text-gray-500 font-medium">
                ${(d.value / 1000).toFixed(1)}k
              </span>
              <div class="w-full bg-gray-100 rounded-t-md relative flex-1">
                <div
                  class="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-md transition-all duration-500"
                  style={{ height: height() }}
                />
              </div>
              <span class="text-xs text-gray-400">{d.month}</span>
            </div>
          );
        }}
      </For>
    </div>
  );
}

function ChannelBreakdown() {
  return (
    <div class="space-y-4">
      <For each={channelData}>
        {(ch) => (
          <Progress value={ch.pct} minValue={0} maxValue={100} class="space-y-1.5">
            <div class="flex justify-between text-sm">
              <Progress.Label class="font-medium text-gray-700">{ch.name}</Progress.Label>
              <Progress.ValueLabel class="text-gray-500">{ch.pct}%</Progress.ValueLabel>
            </div>
            <Progress.Track class="progress-track">
              <Progress.Fill class={`progress-fill ${ch.color}`} />
            </Progress.Track>
          </Progress>
        )}
      </For>
    </div>
  );
}

export default function Analytics() {
  const [tab, setTab] = createSignal("revenue");

  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Analytics</h1>
        <p class="text-sm text-gray-500 mt-1">
          Explore your traffic sources and revenue trends.
        </p>
      </div>

      {/* Kobalte Tabs */}
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <Tabs value={tab()} onChange={setTab}>
          <Tabs.List class="kb-tabs-list">
            <Tabs.Trigger class="kb-tabs-trigger" value="revenue">
              Revenue
            </Tabs.Trigger>
            <Tabs.Trigger class="kb-tabs-trigger" value="channels">
              Channels
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content class="kb-tabs-content" value="revenue">
            <p class="text-sm text-gray-500 mb-4">
              Monthly revenue over the last 7 months
            </p>
            <BarChart />
          </Tabs.Content>

          <Tabs.Content class="kb-tabs-content" value="channels">
            <p class="text-sm text-gray-500 mb-4">
              Traffic breakdown by acquisition channel
            </p>
            <ChannelBreakdown />
          </Tabs.Content>
        </Tabs>
      </div>

      <Separator class="kb-separator" />

      {/* KPI row */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <p class="text-3xl font-bold text-indigo-600">12.4k</p>
          <p class="text-sm text-gray-500 mt-1">Page Views Today</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <p class="text-3xl font-bold text-emerald-600">3m 24s</p>
          <p class="text-sm text-gray-500 mt-1">Avg. Session Duration</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <p class="text-3xl font-bold text-amber-600">38.7%</p>
          <p class="text-sm text-gray-500 mt-1">Bounce Rate</p>
        </div>
      </div>
    </div>
  );
}

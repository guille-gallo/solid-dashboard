import { Tooltip } from "@kobalte/core/tooltip";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: string;
  tooltip: string;
}

export default function StatCard(props: StatCardProps) {
  return (
    <Tooltip openDelay={400}>
      <Tooltip.Trigger class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-default text-left w-full">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-500">{props.title}</span>
          <span class="text-2xl">{props.icon}</span>
        </div>
        <div class="text-2xl font-bold">{props.value}</div>
        <div
          class={`text-sm font-medium ${
            props.changeType === "up" ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {props.changeType === "up" ? "↑" : "↓"} {props.change} vs last month
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="kb-tooltip-content">
          {props.tooltip}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip>
  );
}

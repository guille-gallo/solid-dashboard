import StatCard from "../components/StatCard";
import ActivityList from "../components/ActivityList";
import DataTable from "../components/DataTable";
import ProgressMetrics from "../components/ProgressMetrics";

export default function Dashboard() {
  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-sm text-gray-500 mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stat Cards */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value="$48,250"
          change="12.5%"
          changeType="up"
          icon="💰"
          tooltip="Revenue from all sources this month"
        />
        <StatCard
          title="Active Users"
          value="2,340"
          change="8.1%"
          changeType="up"
          icon="👥"
          tooltip="Users active in the last 30 days"
        />
        <StatCard
          title="Conversion Rate"
          value="3.24%"
          change="0.4%"
          changeType="down"
          icon="🎯"
          tooltip="Visitor-to-customer conversion rate"
        />
        <StatCard
          title="Avg. Response"
          value="245 ms"
          change="18 ms"
          changeType="up"
          icon="⚡"
          tooltip="Average API response time"
        />
      </div>

      {/* Middle row */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <DataTable />
        </div>
        <ProgressMetrics />
      </div>

      {/* Activity */}
      <ActivityList />
    </div>
  );
}

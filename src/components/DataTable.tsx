import { For, createSignal } from "solid-js";
import { Separator } from "@kobalte/core/separator";

interface Row {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  revenue: string;
}

const data: Row[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active", revenue: "$12,400" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Editor", status: "Active", revenue: "$8,200" },
  { id: 3, name: "Carol Williams", email: "carol@example.com", role: "Viewer", status: "Pending", revenue: "$3,100" },
  { id: 4, name: "Dave Brown", email: "dave@example.com", role: "Editor", status: "Inactive", revenue: "$950" },
  { id: 5, name: "Eve Davis", email: "eve@example.com", role: "Admin", status: "Active", revenue: "$15,750" },
  { id: 6, name: "Frank Miller", email: "frank@example.com", role: "Viewer", status: "Active", revenue: "$4,320" },
];

const statusColor: Record<Row["status"], string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-gray-100 text-gray-500",
  Pending: "bg-amber-100 text-amber-700",
};

export default function DataTable() {
  const [search, setSearch] = createSignal("");

  const filtered = () =>
    data.filter(
      (r) =>
        r.name.toLowerCase().includes(search().toLowerCase()) ||
        r.email.toLowerCase().includes(search().toLowerCase())
    );

  return (
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold">Team Members</h3>
        <input
          type="text"
          placeholder="Search…"
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
          class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
        />
      </div>

      <Separator class="kb-separator" />

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 text-xs uppercase tracking-wider">
              <th class="pb-3 font-medium">Name</th>
              <th class="pb-3 font-medium">Role</th>
              <th class="pb-3 font-medium">Status</th>
              <th class="pb-3 font-medium text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            <For each={filtered()}>
              {(row) => (
                <tr class="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td class="py-3">
                    <div class="font-medium">{row.name}</div>
                    <div class="text-xs text-gray-400">{row.email}</div>
                  </td>
                  <td class="py-3">{row.role}</td>
                  <td class="py-3">
                    <span
                      class={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td class="py-3 text-right font-medium">{row.revenue}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  LEARNING: createResource — async data fetching in Solid.js
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 *  createResource wraps an async function (fetcher) into a reactive
 *  signal that tracks loading, error, and data states automatically.
 *
 *  Signature:
 *    const [data, { mutate, refetch }] = createResource(source, fetcher);
 *
 *  - `source` is a SIGNAL. When it changes, the fetcher re-runs.
 *    This is the key insight: a signal DRIVES the fetch.
 *    Here we use a `page` signal → changing page triggers a new fetch.
 *
 *  - `fetcher(sourceValue, info)` receives the current source value.
 *    It returns a Promise. Solid tracks its lifecycle:
 *      data.loading  → true while fetching
 *      data.error    → the error if rejected
 *      data()        → the resolved value (or undefined while loading)
 *
 *  - `data.state` can be: "unresolved" | "pending" | "ready" |
 *    "refreshing" | "errored"
 *
 *  Compared to React:
 *    React: useEffect + useState + loading flag + error flag (manual)
 *    Solid: createResource does all of that in one primitive.
 *
 *  Compared to Vue:
 *    Similar to VueUse's useFetch / useAsyncData, but built into the
 *    core library and integrated with <Suspense>.
 *
 *  SUSPENSE INTEGRATION:
 *  ─────────────────────
 *  When a component using createResource is wrapped in <Suspense>,
 *  Solid automatically shows the fallback while the resource is
 *  pending. You don't need to check `.loading` manually — Suspense
 *  catches it. This works because createResource internally registers
 *  with the nearest Suspense boundary (via SuspenseContext).
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
import { For, Show, createSignal, createResource } from "solid-js";
import { Separator } from "@kobalte/core/separator";

// ── Types ──

/** Shape returned by dummyjson.com/users */
interface DummyUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  role: string;               // "admin" | "moderator" | "user"
  company: { title: string }; // job title like "Sales Manager"
}

interface ApiResponse {
  users: DummyUser[];
  total: number;
  skip: number;
  limit: number;
}

/** Our table row after mapping */
interface Row {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  revenue: string;
}

const PAGE_SIZE = 8;

// ── Mapping helpers ──

function deriveStatus(apiRole: string): Row["status"] {
  // Map the API's "role" field to a display status
  switch (apiRole) {
    case "admin":     return "Active";
    case "moderator": return "Pending";
    default:          return "Inactive";
  }
}

function deriveRevenue(id: number, age: number): string {
  // Deterministic "revenue" seeded from id and age
  const amount = id * 1340 + age * 210;
  return `$${amount.toLocaleString("en-US")}`;
}

function mapUser(u: DummyUser): Row {
  return {
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: u.company.title,        // real job title from the API
    status: deriveStatus(u.role),  // derived from system role
    revenue: deriveRevenue(u.id, u.age),
  };
}

// ── Fetcher ──
// This is the async function createResource will call.
// It receives `page` (the source signal value) as first argument.

async function fetchUsers(page: number): Promise<{ rows: Row[]; total: number }> {
  const skip = page * PAGE_SIZE;
  const url = `https://dummyjson.com/users?limit=${PAGE_SIZE}&skip=${skip}&select=id,firstName,lastName,email,role,company,age`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const data: ApiResponse = await res.json();
  return {
    rows: data.users.map(mapUser),
    total: data.total,
  };
}

// ── Status badge colors ──

const statusColor: Record<Row["status"], string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-gray-100 text-gray-500",
  Pending: "bg-amber-100 text-amber-700",
};

// ── Skeleton loader (shown by Suspense while fetching) ──

export function DataTableSkeleton() {
  return (
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
      <div class="flex items-center justify-between mb-4">
        <div class="h-5 w-32 bg-gray-200 rounded" />
        <div class="h-8 w-56 bg-gray-200 rounded-lg" />
      </div>
      <Separator class="kb-separator" />
      <div class="space-y-4 mt-4">
        <For each={[1, 2, 3, 4, 5, 6]}>
          {() => (
            <div class="flex items-center gap-4">
              <div class="flex-1 space-y-1.5">
                <div class="h-4 w-36 bg-gray-200 rounded" />
                <div class="h-3 w-48 bg-gray-100 rounded" />
              </div>
              <div class="h-4 w-24 bg-gray-200 rounded" />
              <div class="h-5 w-16 bg-gray-200 rounded-full" />
              <div class="h-4 w-20 bg-gray-200 rounded ml-auto" />
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

// ── Main component ──

export default function DataTable() {
  // LEARNING: `page` is the SOURCE SIGNAL for createResource.
  // ──────────────────────────────────────────────────────────
  // Whenever `page` changes, the fetcher automatically re-runs.
  // You don't need useEffect, no manual refetch call — the signal
  // dependency does it. This is the "signal drives the fetch" pattern.
  const [page, setPage] = createSignal(0);

  // LEARNING: createResource(source, fetcher)
  // ──────────────────────────────────────────
  // `page` is passed as the first argument to fetchUsers.
  // `users` is a reactive resource: users(), users.loading, users.error
  // `mutate` lets you overwrite the data without refetching.
  // `refetch` re-runs the fetcher with the current source value.
  //
  // We destructure `refetch` for the Retry button in the error state.
  // Setting page to its same value wouldn't trigger a re-fetch (Solid
  // uses === equality), so refetch() is the right tool for retries.
  const [users, { refetch }] = createResource(page, fetchUsers);

  const totalPages = () => {
    const data = users();
    return data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  };

  return (
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold">Team Members</h3>
        <Show when={users() && !users.error}>
          <p class="text-xs text-gray-400">{users()?.total} total members</p>
        </Show>
      </div>

      <Separator class="kb-separator" />

      {/* Error state */}
      <Show when={users.error}>
        <div class="py-8 text-center text-red-500 text-sm min-h-[340px] flex flex-col items-center justify-center">
          <p class="font-medium">Failed to load team members</p>
          <p class="text-xs mt-1">{String(users.error)}</p>
          <button
            onClick={() => refetch()}
            class="mt-3 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </Show>

      {/* Table — shown when we have data (even while refreshing) */}
      <Show when={!users.error}>
        {/* Refreshing indicator — subtle overlay while paginating */}
        <div class={`overflow-x-auto transition-opacity duration-200 min-h-[340px] ${
          users.state === "refreshing" ? "opacity-50" : "opacity-100"
        }`}>
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
              <For each={users()?.rows ?? []}>
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

        {/* ── Pagination ── */}
        {/* LEARNING: setPage triggers createResource to re-fetch
            because `page` is the source signal. No manual refetch needed. */}
        <Show when={totalPages() > 1}>
          <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
            <p class="text-xs text-gray-400">
              Page {page() + 1} of {totalPages()} · {users()?.total} members
            </p>
            <div class="flex gap-2">
              <button
                disabled={page() === 0}
                onClick={() => setPage((p) => p - 1)}
                class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Prev
              </button>
              <button
                disabled={page() >= totalPages() - 1}
                onClick={() => setPage((p) => p + 1)}
                class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
}

import {
  createSignal,
  createMemo,
  createEffect,
  For,
  Show,
  Switch,
  Match,
  ErrorBoundary,
  onMount,
  onCleanup,
  batch,
  untrack,
  mergeProps,
  splitProps,
  type JSX,
} from "solid-js";
import { Portal, Dynamic } from "solid-js/web";
import { Collapsible } from "@kobalte/core/collapsible";

interface WorkshopSectionProps {
  number: number;
  title: string;
  tagline: string;
  children: JSX.Element;
}

function WorkshopSection(props: WorkshopSectionProps) {
  const [open, setOpen] = createSignal(false);

  return (
    <Collapsible open={open()} onOpenChange={setOpen}>
      <div
        class={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-colors ${
          open() ? "border-l-4 border-indigo-500" : ""
        }`}
      >
        <Collapsible.Trigger
          class="w-full flex items-center justify-between gap-4 text-left hover:bg-gray-50 rounded-lg px-2 py-2 transition-colors"
        >
          <div>
            <p class="text-xs text-gray-400 font-medium">Section {props.number}</p>
            <h2 class="text-base font-semibold text-gray-900">{props.title}</h2>
            <p class="text-xs text-gray-500 mt-0.5">{props.tagline}</p>
          </div>
          <span
            class={`text-gray-400 transition-transform ${
              open() ? "rotate-180" : "rotate-0"
            }`}
            aria-hidden
          >
            ▾
          </span>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <div class="pt-4 space-y-4">{props.children}</div>
        </Collapsible.Content>
      </div>
    </Collapsible>
  );
}

function MemosSection() {
  const [text, setText] = createSignal("");
  const [memoRuns, setMemoRuns] = createSignal(0);

  const frequency = createMemo(() => {
    setMemoRuns((c) => c + 1);
    const map = new Map<string, number>();
    const cleaned = text().toLowerCase();

    for (const ch of cleaned) {
      if (ch.trim().length === 0) continue;
      map.set(ch, (map.get(ch) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([char, count]) => ({ char, count }));
  });

  return (
    <div class="space-y-4">
      {/* createMemo caches derived state; like Vue computed() or React useMemo, it re-runs only when dependencies change. */}
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Type text</label>
          <input
            type="text"
            value={text()}
            onInput={(e) => setText(e.currentTarget.value)}
            class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            placeholder="solid is reactive"
          />
          <p class="text-xs text-gray-400">Memo runs: {memoRuns()}</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-xs text-gray-500 font-medium mb-2">Character frequency</p>
          <Show
            when={frequency().length > 0}
            fallback={<p class="text-xs text-gray-400">Type to generate counts.</p>}
          >
            <div class="space-y-1">
              <For each={frequency()}>
                {(entry) => (
                  <div class="flex items-center justify-between text-xs text-gray-600">
                    <span class="font-medium">{entry.char}</span>
                    <span>{entry.count}</span>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}

interface TimerProps {
  onLog: (message: string) => void;
}

function Timer(props: TimerProps) {
  const [ticks, setTicks] = createSignal(0);

  onMount(() => {
    const time = new Date().toLocaleTimeString();
    props.onLog(`[${time}] Timer mounted`);
  });

  onMount(() => {
    const id = window.setInterval(() => {
      setTicks((t) => {
        const next = t + 1;
        const time = new Date().toLocaleTimeString();
        props.onLog(`[${time}] Tick: ${next}`);
        return next;
      });
    }, 1000);

    onCleanup(() => {
      window.clearInterval(id);
      const time = new Date().toLocaleTimeString();
      props.onLog(`[${time}] Timer cleaned up`);
    });
  });

  return (
    <div class="text-sm text-gray-700">Ticks: {ticks()}</div>
  );
}

function LifecycleSection() {
  const [visible, setVisible] = createSignal(false);
  const [log, setLog] = createSignal<string[]>([]);

  function append(message: string) {
    setLog((prev) => [message, ...prev].slice(0, 8));
  }

  return (
    <div class="space-y-4">
      {/* onMount runs once after first render; onCleanup runs when the reactive scope is disposed (unmount, Show/Switch removal). */}
      <button
        class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        onClick={() => setVisible((v) => !v)}
      >
        {visible() ? "Unmount Timer" : "Mount Timer"}
      </button>

      <Show when={visible()}>
        <div class="bg-gray-50 rounded-lg p-3">
          <Timer onLog={append} />
        </div>
      </Show>

      <div class="bg-gray-50 rounded-lg p-3">
        <p class="text-xs text-gray-500 font-medium mb-2">Lifecycle log</p>
        <Show
          when={log().length > 0}
          fallback={<p class="text-xs text-gray-400">No events yet.</p>}
        >
          <ul class="text-xs text-gray-600 space-y-1">
            <For each={log()}>
              {(entry) => <li>{entry}</li>}
            </For>
          </ul>
        </Show>
      </div>
    </div>
  );
}

function BatchUntrackSection() {
  const [firstName, setFirstName] = createSignal(0);
  const [lastName, setLastName] = createSignal(0);
  const [effectRuns, setEffectRuns] = createSignal(0);

  createEffect(() => {
    firstName();
    lastName();
    setEffectRuns((c) => c + 1);
  });

  const [count, setCount] = createSignal(0);
  const [ignored, setIgnored] = createSignal(0);
  const [untrackRuns, setUntrackRuns] = createSignal(0);

  createEffect(() => {
    count();
    untrack(() => ignored());
    setUntrackRuns((c) => c + 1);
  });

  return (
    <div class="space-y-6">
      {/* batch() defers notifications until all writes finish; untrack() reads without subscribing to updates. */}
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-3">
          <p class="text-sm font-medium text-gray-700">Batch demo</p>
          <div class="flex flex-wrap gap-2">
            <button
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setFirstName((n) => n + 1);
                setLastName((n) => n + 1);
              }}
            >
              Increment Unbatched
            </button>
            <button
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 cursor-pointer"
              onClick={() =>
                batch(() => {
                  setFirstName((n) => n + 1);
                  setLastName((n) => n + 1);
                })
              }
            >
              Increment Batched
            </button>
          </div>
          <p class="text-xs text-gray-500">
            First: {firstName()} · Last: {lastName()}
          </p>
          <p class="text-xs text-gray-400">Effect runs: {effectRuns()}</p>
        </div>

        <div class="space-y-3">
          <p class="text-sm font-medium text-gray-700">Untrack demo</p>
          <div class="flex flex-wrap gap-2">
            <button
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              onClick={() => setCount((n) => n + 1)}
            >
              Increment Count
            </button>
            <button
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 cursor-pointer"
              onClick={() => setIgnored((n) => n + 1)}
            >
              Increment Ignored
            </button>
          </div>
          <p class="text-xs text-gray-500">
            Count: {count()} · Ignored: {ignored()}
          </p>
          <p class="text-xs text-gray-400">Effect runs: {untrackRuns()}</p>
        </div>
      </div>
    </div>
  );
}

type AppState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: string[] };

function Thrower(props: { shouldThrow: boolean; onThrow: () => void }) {
  if (props.shouldThrow) {
    throw new Error("Simulated render crash");
  }

  return (
    <button
      class="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
      onClick={props.onThrow}
    >
      Throw Error
    </button>
  );
}

function ErrorHandlingSection() {
  const [state, setState] = createSignal<AppState>({ status: "idle" });
  const [shouldThrow, setShouldThrow] = createSignal(false);

  return (
    <div class="space-y-4">
      {/* Switch/Match is Solid's JSX pattern matching; ErrorBoundary catches render-time errors and exposes reset. */}
      <div class="flex flex-wrap gap-2">
        <button
          class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
          onClick={() => setState({ status: "idle" })}
        >
          Idle
        </button>
        <button
          class="px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 cursor-pointer"
          onClick={() => setState({ status: "loading" })}
        >
          Loading
        </button>
        <button
          class="px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 cursor-pointer"
          onClick={() => setState({ status: "error", message: "Network request failed" })}
        >
          Error
        </button>
        <button
          class="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 cursor-pointer"
          onClick={() => setState({ status: "success", data: ["Alpha", "Beta", "Gamma"] })}
        >
          Success
        </button>
      </div>

      <div class="bg-gray-50 rounded-lg p-3">
        <Switch>
          <Match when={state().status === "idle"}>
            <p class="text-sm text-gray-600">Waiting for input.</p>
          </Match>
          <Match when={state().status === "loading"}>
            <p class="text-sm text-indigo-600">Loading data...</p>
          </Match>
          <Match when={state().status === "error"}>
            {(() => {
              const current = state();
              return current.status === "error" ? (
                <p class="text-sm text-amber-600">{current.message}</p>
              ) : null;
            })()}
          </Match>
          <Match when={state().status === "success"}>
            {(() => {
              const current = state();
              return current.status === "success" ? (
                <ul class="text-sm text-emerald-600 space-y-1">
                  <For each={current.data}>{(item) => <li>{item}</li>}</For>
                </ul>
              ) : null;
            })()}
          </Match>
        </Switch>
      </div>

      <ErrorBoundary
        fallback={(err, reset) => (
          <div class="bg-red-50 border border-red-100 rounded-lg p-3 space-y-2">
            <p class="text-sm text-red-600 font-medium">{err.message}</p>
            <button
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-100 cursor-pointer"
              onClick={() => {
                reset();
                setShouldThrow(false);
              }}
            >
              Reset
            </button>
          </div>
        )}
      >
        <div class="bg-gray-50 rounded-lg p-3">
          <Thrower
            shouldThrow={shouldThrow()}
            onThrow={() => setShouldThrow(true)}
          />
        </div>
      </ErrorBoundary>
    </div>
  );
}

interface ListProps<T> extends JSX.HTMLAttributes<HTMLDivElement> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
  label: string;
}

function List<T>(props: ListProps<T>) {
  const merged = mergeProps({ class: "space-y-2" }, props);
  const [local, others] = splitProps(merged, ["items", "renderItem", "label", "class"]);

  return (
    <div {...others}>
      <p class="text-xs text-gray-500 font-medium mb-2">{local.label}</p>
      <div class={local.class}>
        <For each={local.items}>{(item) => local.renderItem(item)}</For>
      </div>
    </div>
  );
}

function AdvancedPropsSection() {
  const people = [
    { name: "Amina", age: 28 },
    { name: "Jules", age: 34 },
  ];

  const words = ["signal", "memo", "store", "resource"];

  return (
    <div class="space-y-4">
      {/* mergeProps keeps reactive getters; splitProps slices props without breaking tracking. Generics keep item types flowing. */}
      <div class="grid gap-4 sm:grid-cols-2">
        <List
          items={people}
          label="People"
          class="space-y-1"
          renderItem={(person) => (
            <div class="flex items-center justify-between text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
              <span class="font-medium">{person.name}</span>
              <span class="text-xs text-gray-500">{person.age} yrs</span>
            </div>
          )}
        />
        <List
          items={words}
          label="Vocabulary"
          class="space-y-1"
          renderItem={(word) => (
            <div class="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
              {word}
            </div>
          )}
        />
      </div>
    </div>
  );
}

function PortalModal(props: { onClose: () => void }) {
  return (
    <Portal mount={document.body}>
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div
          class="absolute inset-0 bg-black/40"
          onClick={props.onClose}
        />
        <div class="relative bg-white rounded-xl shadow-xl border border-gray-100 p-6 w-[90%] max-w-sm">
          <p class="text-sm font-semibold text-gray-900">Portal Modal</p>
          <p class="text-xs text-gray-500 mt-1">
            This modal renders outside the card layout.
          </p>
          <button
            class="mt-4 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
            onClick={props.onClose}
          >
            Close
          </button>
        </div>
      </div>
    </Portal>
  );
}

function GreetingCard() {
  return (
    <div class="text-sm text-gray-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
      Hello from the greeting component!
    </div>
  );
}

function MiniCounter() {
  const [value, setValue] = createSignal(0);
  return (
    <div class="flex items-center gap-2">
      <button
        class="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
        onClick={() => setValue((v) => v - 1)}
      >
        -
      </button>
      <span class="text-sm text-gray-700">{value()}</span>
      <button
        class="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
        onClick={() => setValue((v) => v + 1)}
      >
        +
      </button>
    </div>
  );
}

function ColorPicker() {
  const [color, setColor] = createSignal("#6366f1");
  return (
    <div class="flex items-center gap-3">
      <input
        type="color"
        value={color()}
        onInput={(e) => setColor(e.currentTarget.value)}
        class="h-8 w-12 rounded border border-gray-200"
      />
      <div class="text-xs text-gray-500">{color()}</div>
    </div>
  );
}

function PortalDynamicSection() {
  const [showModal, setShowModal] = createSignal(false);
  const [componentKey, setComponentKey] = createSignal("greeting");

  const componentMap: Record<string, () => JSX.Element> = {
    greeting: GreetingCard,
    counter: MiniCounter,
    color: ColorPicker,
  };

  const selected = () => componentMap[componentKey()];

  return (
    <div class="space-y-4">
      {/* Portal renders into a different DOM node; Dynamic swaps component references at runtime. */}
      <div class="flex flex-wrap gap-2">
        <button
          class="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          Show Modal
        </button>
      </div>

      <Show when={showModal()}>
        <PortalModal onClose={() => setShowModal(false)} />
      </Show>

      <div class="space-y-3">
        <p class="text-sm font-medium text-gray-700">Dynamic component</p>
        <div class="flex flex-wrap gap-2">
          <label class="text-xs text-gray-600 flex items-center gap-1">
            <input
              type="radio"
              name="dynamic"
              checked={componentKey() === "greeting"}
              onChange={() => setComponentKey("greeting")}
            />
            Greeting
          </label>
          <label class="text-xs text-gray-600 flex items-center gap-1">
            <input
              type="radio"
              name="dynamic"
              checked={componentKey() === "counter"}
              onChange={() => setComponentKey("counter")}
            />
            Counter
          </label>
          <label class="text-xs text-gray-600 flex items-center gap-1">
            <input
              type="radio"
              name="dynamic"
              checked={componentKey() === "color"}
              onChange={() => setComponentKey("color")}
            />
            Color picker
          </label>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <Dynamic component={selected()} />
        </div>
      </div>
    </div>
  );
}

export default function Workshop() {
  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Workshop</h1>
        <p class="text-sm text-gray-500 mt-1">
          Interactive concept explorer — each section is a self-contained lesson.
        </p>
      </div>

      <WorkshopSection
        number={1}
        title="Memos & Derivations"
        tagline="createMemo · derived state · cache behavior"
      >
        <MemosSection />
      </WorkshopSection>

      <WorkshopSection
        number={2}
        title="Lifecycle"
        tagline="onMount · onCleanup · conditional render"
      >
        <LifecycleSection />
      </WorkshopSection>

      <WorkshopSection
        number={3}
        title="Batch & Untrack"
        tagline="batch() · untrack() · effect counts"
      >
        <BatchUntrackSection />
      </WorkshopSection>

      <WorkshopSection
        number={4}
        title="Error Handling"
        tagline="ErrorBoundary · Switch/Match · unions"
      >
        <ErrorHandlingSection />
      </WorkshopSection>

      <WorkshopSection
        number={5}
        title="Advanced Props"
        tagline="mergeProps · splitProps · generics"
      >
        <AdvancedPropsSection />
      </WorkshopSection>

      <WorkshopSection
        number={6}
        title="Portals & Dynamic"
        tagline="Portal · Dynamic · runtime components"
      >
        <PortalDynamicSection />
      </WorkshopSection>
    </div>
  );
}

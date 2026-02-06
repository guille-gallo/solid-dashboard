import type { ParentProps } from "solid-js";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout(props: ParentProps) {
  return (
    <div class="flex h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <div class="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main class="flex-1 overflow-y-auto p-6">{props.children}</main>
      </div>
    </div>
  );
}

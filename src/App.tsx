import { Router, Route } from "@solidjs/router";
import { lazy } from "solid-js";
import Layout from "./components/Layout";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Workshop = lazy(() => import("./pages/Workshop"));
const Settings = lazy(() => import("./pages/Settings"));

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Dashboard} />
      <Route path="/workshop" component={Workshop} />
      <Route path="/settings" component={Settings} />
    </Router>
  );
}

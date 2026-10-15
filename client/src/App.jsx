import { MotionConfig } from "framer-motion";
import { Link, usePath, usePageMeta } from "./lib/router";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import { event } from "./data/eventData";

function NotFound() {
  usePageMeta(`Page not found — ${event.name}`);
  return (
    <main className="page page--center">
      <div className="notfound">
        <p className="notfound__code">404</p>
        <h1 className="notfound__title">This room isn't on the map.</h1>
        <Link className="btn btn--primary" to="/">
          Back to the event
        </Link>
      </div>
    </main>
  );
}

const routes = {
  "/": Home,
  "/register": Register,
  "/admin": Admin,
};

export default function App() {
  const path = usePath();
  const Page = routes[path] ?? NotFound;
  return (
    <MotionConfig reducedMotion="user">
      <Page />
    </MotionConfig>
  );
}

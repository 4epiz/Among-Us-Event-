import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Always open on the hero, never where the visitor last left off.
// 1. Stop the browser restoring the previous scroll position on reload.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
// 2. Drop a leftover #section from the address bar so it doesn't jump there.
if (location.hash) history.replaceState(null, "", location.pathname + location.search);
// 3. Go to the top instantly (the page uses smooth scrolling, so be explicit).
const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
toTop();
// 4. Same when the page comes back from the back/forward cache.
window.addEventListener("pageshow", (e) => e.persisted && toTop());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

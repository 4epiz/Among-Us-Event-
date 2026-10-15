import { useEffect, useSyncExternalStore } from "react";

/**
 * A minimal client-side router for the site's three pages (/, /register, /admin).
 * It uses the History API directly, so no routing library is needed.
 */

const listeners = new Set();
const subscribe = (fn) => {
  listeners.add(fn);
  window.addEventListener("popstate", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("popstate", fn);
  };
};
const getPath = () => window.location.pathname.replace(/\/+$/, "") || "/";

export function usePath() {
  return useSyncExternalStore(subscribe, getPath);
}

export function navigate(to, { replace = false } = {}) {
  if (to === getPath()) return;
  window.history[replace ? "replaceState" : "pushState"](null, "", to);
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  listeners.forEach((fn) => fn());
}

/** An <a> that navigates without a full page load for internal paths. */
export function Link({ to, onClick, children, ...rest }) {
  const handle = (e) => {
    onClick?.(e);
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      rest.target === "_blank"
    )
      return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  );
}

/** Sets the tab title (and optionally hides the page from search engines) for a route. */
export function usePageMeta(title, { noindex = false } = {}) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    let meta;
    if (noindex) {
      meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex, nofollow";
      document.head.appendChild(meta);
    }
    return () => {
      document.title = prev;
      meta?.remove();
    };
  }, [title, noindex]);
}

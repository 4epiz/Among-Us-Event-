
import { useEffect, useState } from "react";
import { api } from "./api";

/** null while checking, true/false from the server, undefined if unreachable. Asked once per page. */
let cached = null;
let pending = null;

export function useRegistrationOpen() {
  const [open, setOpen] = useState(cached);
  useEffect(() => {
    if (cached !== null) return;
    pending ??= api("/registrations/status")
      .then((d) => (cached = Boolean(d.open)))
      .catch(() => {
        pending = null;
        return undefined;
      });
    let alive = true;
    pending.then((v) => alive && setOpen(v));
    return () => {
      alive = false;
    };
  }, []);
  return open;
}
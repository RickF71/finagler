import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

// usePingGate: returns a boolean indicating whether DIS-Core responded to /api/ping
// intervalMs defaults to 3000ms
export function usePingGate(intervalMs = 3000) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch(api("/api/ping"), {
          method: "GET",
          credentials: "include"
        });
        if (!cancelled) {
          setIsOnline(res.ok);
        }
      } catch (_) {
        // Network error = offline (errors suppressed by fetch interceptor)
        if (!cancelled) setIsOnline(false);
        return false;
      }
    }

    // initial tick then interval
    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return isOnline;
}

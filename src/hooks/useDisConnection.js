import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api.js";

export function useDisConnection() {
  const [offline, setOffline] = useState(false);
  const [lastPing, setLastPing] = useState(null);

  const ping = useCallback(async () => {
    try {
      const res = await fetch(api("/api/ping"), { 
        method: "GET",
        credentials: "include"
      });
      if (!res.ok) {
        setOffline(true);
        return false;
      }

      // parse to confirm it's real JSON (not a proxy error page)
      await res.json();

      setOffline(false);
      setLastPing(Date.now());
      return true;
    } catch {
      // Silent offline - no logging
      setOffline(true);
      return false;
    }
  }, []);

  // heartbeat every 5 seconds
  useEffect(() => {
    ping(); // initial
    const t = setInterval(ping, 5000);
    return () => clearInterval(t);
  }, [ping]);

  return { offline, lastPing, ping };
}

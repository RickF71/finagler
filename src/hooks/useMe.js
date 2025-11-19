// src/hooks/useMe.js
import { useEffect, useState } from "react";

export function useMe(offline) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (offline) {
      setLoading(true);
      return;
    }

    let cancelled = false;

    async function fetchMe() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/me", { credentials: "include" });

        if (res.status === 401) {
          if (!cancelled) {
            setMe({ authenticated: false });
          }
          return;
        }

        if (!res.ok) {
          throw new Error("Unexpected status " + res.status);
        }

        const data = await res.json();
        if (!cancelled) setMe(data);

      } catch (err) {
        if (!cancelled) {
          console.error("useMe error:", err);
          setError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMe();
    return () => { cancelled = true; };

  }, [offline]);

  return { me, loading, error };
}

// src/hooks/useDisStatus.js
import { useState, useEffect } from "react";

async function safePing(url = "/api/ping") {
  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) return { online: false };
    return { online: true };
  } catch {
    return { online: false };
  }
}

export function useDisStatus(intervalMs = 5000) {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let timer = null;

    async function check() {
      const { online } = await safePing();
      setOnline(online);
    }

    timer = setInterval(check, intervalMs);
    check();

    return () => clearInterval(timer);
  }, [intervalMs]);

  return online;
}

// src/context/FinaglerContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const FinaglerContext = createContext();

export function FinaglerProvider({ children }) {
  // ----------------------------------------------------
  // Global connection + system state
  // ----------------------------------------------------
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("loading");
  const [version, setVersion] = useState(null);

  // Determine API base URL
  const [apiBase, setApiBase] = useState(
    import.meta.env.VITE_API_BASE ||
      (window.location.hostname === "localhost"
        ? "http://localhost:8080"
        : window.location.origin)
  );

  // ----------------------------------------------------
  // On mount: Ping DIS-Core for connection + version
  // ----------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function pingDIS() {
      try {
        const res = await fetch(`${apiBase}/api/status`);
        if (!res.ok) throw new Error("DIS-Core not reachable");
        const data = await res.json();
        if (cancelled) return;

        setConnected(true);
        setVersion(data.version || "unknown");
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.warn("FinaglerContext: failed to connect to DIS-Core:", err);
        setConnected(false);
        setStatus("disconnected");
      }
    }

    pingDIS();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  // ----------------------------------------------------
  // Expose context
  // ----------------------------------------------------
  const value = {
    connected,
    status,
    version,
    apiBase,
    setApiBase,
  };

  return (
    <FinaglerContext.Provider value={value}>
      {children}
    </FinaglerContext.Provider>
  );
}

// Hook
export function useFinagler() {
  return useContext(FinaglerContext);
}

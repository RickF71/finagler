// src/context/VistaContext.jsx
import React, { createContext, useContext, useState, useMemo } from "react";

const VistaContext = createContext(null);

export function VistaProvider({ children }) {
  // Example state: which tool/panel is active inside the active domain.
  const [activeTool, setActiveTool] = useState("overview"); // "css", "files", "payload", etc.
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const value = useMemo(
    () => ({
      activeTool,
      setActiveTool,
      sidebarOpen,
      setSidebarOpen,
    }),
    [activeTool, sidebarOpen]
  );

  return (
    <VistaContext.Provider value={value}>{children}</VistaContext.Provider>
  );
}

export function useVista() {
  const ctx = useContext(VistaContext);
  if (!ctx) {
    throw new Error("useVista must be used within VistaProvider");
  }
  return ctx;
}

// Backwards-compatibility exports (if any legacy code still imports these)
export const FinaglerProvider = VistaProvider;
export function useFinagler() {
  return useVista();
}

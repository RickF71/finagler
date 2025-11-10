// src/context/DomainContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getDomain } from "../lib/api.js";
import { useUI } from "./UIContext.jsx"; // ⬅️ import UI context
import { createDISInterface } from "../dis/interface.js";

const DomainContext = createContext();

export function DomainProvider({ children }) {
  const { setView, view } = useUI(); // ⬅️ access UI state for view control

  // ----------------------------------------------------
  // Startup domain: always domain.null
  // ----------------------------------------------------
  const [activeDomainId, setActiveDomainIdRaw] = useState("domain.null");
  const [domain, setDomain] = useState({
    id: "null",
    name: "null",
    data: { description: "The absolute root — origin of all structure." },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ----------------------------------------------------
  // Define API_BASE (this was missing)
  // ----------------------------------------------------
  const API_BASE =
    import.meta.env.VITE_API_BASE ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : window.location.origin);

  // ----------------------------------------------------
  // Domain selection logic (resets or keeps view)
  // ----------------------------------------------------
  const setActiveDomainId = (newId) => {
    setActiveDomainIdRaw(newId);

    // Keep same top-level view if it's stable, otherwise go to overview
    const safeViews = ["overview", "files", "domaincss"];
    if (!safeViews.includes(view)) {
      setView("overview");
    }
  };

  // ----------------------------------------------------
  // Load whenever a *real* UUID is selected
  // ----------------------------------------------------
  useEffect(() => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (activeDomainId === "domain.null" || !uuidRegex.test(activeDomainId)) {
      console.log("DomainContext: startup or invalid ID, using domain.null");
      return;
    }

    let cancelled = false;
    async function fetchDomain() {
      try {
        setLoading(true);
        const data = await getDomain(activeDomainId);
        if (!cancelled) {
          setDomain(data);
          setError(null);
        }
        // applyDomainCascade(activeDomainId);
      } catch (err) {
        if (!cancelled) {
          console.error("Domain load failed:", err);
          setError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDomain();
    return () => {
      cancelled = true;
    };
  }, [activeDomainId]);

  // ----------------------------------------------------
  // Exposed values (now includes API_BASE)
  // ----------------------------------------------------
  const value = {
    activeDomainId,
    setActiveDomainId, // ⬅️ wrapped version that manages view resets
    domain,
    setDomain,
    loading,
    error,
    API_BASE,
  };

  return (
    <DomainContext.Provider value={value}>{children}</DomainContext.Provider>
  );
}

// ----------------------------------------------------
// Domain CSS Cascade
// ----------------------------------------------------
export async function applyDomainCascade(activeDomainId) {
  const ids = ["domain-null-style", "domain-style"];
  ids.forEach((id) => document.getElementById(id)?.remove());

  // Define API_BASE and DIS interface for this utility function
  const API_BASE =
    import.meta.env.VITE_API_BASE ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : window.location.origin);
  
  const dis = createDISInterface(API_BASE);

  const nullCss = await dis.getDomainTheme("domain.null");
  const domCss = await dis.getDomainTheme(activeDomainId);

  const nullStyle = Object.assign(document.createElement("style"), {
    id: "domain-null-style",
    textContent: nullCss,
  });
  const domStyle = Object.assign(document.createElement("style"), {
    id: "domain-style",
    textContent: domCss,
  });

  document.head.append(nullStyle, domStyle);
}

export function useDomain() {
  return useContext(DomainContext);
}

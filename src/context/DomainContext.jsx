import { createContext, useContext, useEffect, useState } from "react";
import { createDISInterface } from "../dis/interface.js";

const DomainContext = createContext();

export function DomainProvider({ children }) {
  const NONE_DOMAIN_ID = "none";
  const ROOT_DOMAIN_ID = "00000000-0000-0000-0000-000000000000";

  const [activeDomainId, setActiveDomainId] = useState(NONE_DOMAIN_ID);
  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE =
    import.meta.env.VITE_API_BASE ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : window.location.origin);

  // Initialize DIS interface
  const dis = createDISInterface(API_BASE);

  // -------------------------------------------------------------
  // 🧩 Enhanced: getPayload — fetch meta, files, policy, receipts
  // -------------------------------------------------------------
  dis.domain.getPayload = async function (domainId) {
    if (!domainId) throw new Error("Invalid domain ID");

    const base = `${API_BASE}/api/domain/${domainId}`;
    const endpoints = {
      meta: `${base}`,
      files: `${base}/files`,
      css: `${base}/css`,
      policy: `${base}/policy`,
      receipts: `${base}/receipts`,
    };

    try {
      const [metaRes, filesRes] = await Promise.all([
        fetch(endpoints.meta),
        fetch(endpoints.files),
      ]);

      if (!metaRes.ok)
        throw new Error(`Failed to load domain meta: ${metaRes.statusText}`);
      if (!filesRes.ok)
        throw new Error(`Failed to load domain files: ${filesRes.statusText}`);

      const meta = await metaRes.json();
      const files = await filesRes.json();

      let policy = null;
      let receipts = [];
      let cssText = "";

      try {
        const cssRes = await fetch(endpoints.css);
        if (cssRes.ok) cssText = await cssRes.text();
      } catch (err) {
        console.debug("No /css endpoint for", domainId);
      }

      try {
        const policyRes = await fetch(endpoints.policy);
        if (policyRes.ok) policy = await policyRes.json();
      } catch {
        console.debug("No /policy endpoint for", domainId);
      }

      try {
        const rcptRes = await fetch(endpoints.receipts);
        if (rcptRes.ok) receipts = await rcptRes.json();
      } catch {
        console.debug("No /receipts endpoint for", domainId);
      }

      return {
        id: domainId,
        state: "ready",
        meta,
        files,
        policy,
        receipts,
        css: cssText,
        fetchedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error("DIS: getPayload failed", err);
      throw err;
    }
  };

  // -------------------------------------------------------------
  // 🧩 Auto-load current domain when changed
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeDomainId === NONE_DOMAIN_ID) {
      setDomain(null);
      setLoading(false);
      setError(null);
      console.log("Finagler: no domain selected");
      return;
    }

    if (activeDomainId === ROOT_DOMAIN_ID) {
      setDomain({
        id: ROOT_DOMAIN_ID,
        name: "domain.null",
        data: { description: "Root domain placeholder" },
      });
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await dis.domain.getPayload(activeDomainId);
        if (!cancelled) {
          setDomain(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => (cancelled = true);
  }, [activeDomainId]);

  // -------------------------------------------------------------
  // 🧩 Inject domain CSS into document <head>
  // -------------------------------------------------------------
  useEffect(() => {
    if (!domain || !domain.css) return;

    let style = document.getElementById("domain-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "domain-style";
      document.head.appendChild(style);
    }

    style.textContent = domain.css;
    console.log("✅ Domain CSS applied:", domain.id);
  }, [domain]);

  // -------------------------------------------------------------
  // Provided context value
  // -------------------------------------------------------------
  const value = {
    activeDomainId,
    setActiveDomainId,
    domain,
    loading,
    error,
    NONE_DOMAIN_ID,
    ROOT_DOMAIN_ID,
    API_BASE,
    dis,
  };

  return (
    <DomainContext.Provider value={value}>{children}</DomainContext.Provider>
  );
}

export function useDomain() {
  return useContext(DomainContext);
}

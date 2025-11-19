import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createDISInterface } from "../dis/interface.js";

const DomainContext = createContext(null);

export function DomainProvider({ initialDomain, children }) {
  const ROOT_DOMAIN_ID = "00000000-0000-0000-0000-000000000000";

  // initialDomain should ALWAYS be provided - user must be bound to corporeal domain
  // to reach DomainProvider (AuthGate enforces this)
  if (!initialDomain) {
    throw new Error("DomainProvider requires initialDomain - user must be bound to corporeal domain");
  }

  const [activeDomainId, setActiveDomainId] = useState(initialDomain);
  const [domain, setDomain] = useState(null);
  const [domains, setDomains] = useState([]); // List of all domains
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // When initialDomain changes (e.g. after actor switch),
  // update the activeDomainId
  useEffect(() => {
    if (initialDomain) {
      setActiveDomainId(initialDomain);
    }
  }, [initialDomain]);

  // ActAs authority model - separates "who you are" from "what you're viewing"
  const [actAs, setActAs] = useState({
    domain_id: null,     // domain whose Prime Seat we're impersonating
    seat: "root",        // always root for now
    label: "none"        // text displayed in SuperBar
  });

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
      domain: `${base}`,
      files: `${base}/files`,
    };

    try {
      const [domainRes, filesRes] = await Promise.all([
        fetch(endpoints.domain),
        fetch(endpoints.files),
      ]);

      if (!domainRes.ok)
        throw new Error(`Failed to load domain: ${domainRes.statusText}`);
      if (!filesRes.ok)
        throw new Error(`Failed to load domain files: ${filesRes.statusText}`);

      const domainData = await domainRes.json();
      const files = await filesRes.json();

      // Phase 10J.4: Backend returns flattened payload with css, meta, authority, policy, receipts, etc
      // All domain data lives inside payload, not at root
      return {
        id: domainData.id,
        name: domainData.name,
        parent_id: domainData.parent_id,
        state: "ready",
        payload: domainData.payload || {},  // Contains: css, meta, authority, policy, receipts, overlay, variables
        files,
        created_at: domainData.created_at,
        updated_at: domainData.updated_at,
        fetchedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error("DIS: getPayload failed", err);
      throw err;
    }
  };

  // -------------------------------------------------------------
  // 🧩 Load all domains list (DISABLED - domain list outside dis-core purview)
  // -------------------------------------------------------------
  const loadDomains = useCallback(async () => {
    console.log("⚠️ [DomainContext] loadDomains disabled - domain list functionality removed");
    return [];
  }, []);

  // -------------------------------------------------------------
  // 🧩 ActAs authority helper - sets who you're acting as
  // -------------------------------------------------------------
  const actAsDomain = useCallback((domain) => {
    if (!domain) {
      setActAs({
        domain_id: null,
        seat: "root",
        label: "none"
      });
      return;
    }

    const domainName = domain.name || 
                      domain.payload?.name || 
                      domain.payload?.data?.name || 
                      domain.id;

    setActAs({
      domain_id: domain.id,
      seat: "root",
      label: `root@${domainName}`
    });
    
    console.log(`🎭 [ActAs] Now acting as: root@${domainName} (${domain.id})`);
  }, []);

  // -------------------------------------------------------------
  // 🧩 Load domain helper function
  // -------------------------------------------------------------
  const loadDomain = async (domainId) => {
    if (domainId === NONE_DOMAIN_ID) {
      setDomain(null);
      setLoading(false);
      setError(null);
      console.log("Finagler: no domain selected");
      return;
    }

    if (domainId === ROOT_DOMAIN_ID) {
      setDomain({
        id: ROOT_DOMAIN_ID,
        name: "domain.null",
        data: { description: "Root domain placeholder" },
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 [DomainContext] Loading domain:", domainId);
      const data = await dis.domain.getPayload(domainId);
      setDomain(data);
      setError(null);
      console.log("✅ [DomainContext] Domain loaded:", domainId, "Name:", data.name, "Has CSS:", !!data.payload?.css?.content);
      console.log("✅ [DomainContext] CSS content:", data.payload?.css?.content?.substring(0, 80));
    } catch (err) {
      setError(err);
      console.error("❌ [DomainContext] Failed to load domain:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reload current domain (useful after CSS saves, file updates, etc)
  const reloadDomain = () => {
    if (activeDomainId) {
      console.log("🔄 Reloading domain:", activeDomainId);
      loadDomain(activeDomainId);
    }
  };

  // -------------------------------------------------------------
  // 🧩 Auto-load domains list on mount (DISABLED)
  // -------------------------------------------------------------
  // Domain list loading disabled - not part of dis-core functionality

  // -------------------------------------------------------------
  // 🧩 Auto-load current domain when changed
  // -------------------------------------------------------------
  useEffect(() => {
    console.log("🔔 [DomainContext] activeDomainId changed to:", activeDomainId);
    loadDomain(activeDomainId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDomainId]);

  // -------------------------------------------------------------
  // Provided context value
  // -------------------------------------------------------------
  const value = {
    activeDomainId,
    setActiveDomainId,
    domain,
    domains,           // List of all domains
    loadDomains,       // Function to refresh domains list
    actAs,             // Current acting identity
    actAsDomain,       // Function to change acting identity
    loading,
    error,
    reloadDomain,
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
  const ctx = useContext(DomainContext);
  if (!ctx) {
    throw new Error("useDomain must be used within DomainProvider");
  }
  return ctx;
}

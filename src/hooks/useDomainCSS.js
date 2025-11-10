// src/hooks/useDomainCSS.js
import { useEffect, useRef } from "react";
import { useDomain } from "../context/DomainContext";

export default function useDomainCSS() {
  const { activeDomainId, NONE_DOMAIN_ID, API_BASE } = useDomain();
  const lastAppliedIdRef = useRef(null);

  useEffect(() => {
    const id = activeDomainId;

    // No domain selected → remove any existing CSS and reset
    if (!id || id === NONE_DOMAIN_ID) {
      const existing = document.getElementById("domain-css");
      if (existing) existing.remove();
      lastAppliedIdRef.current = null;
      console.log("🔧 Domain CSS cleared (no active domain)");
      return;
    }

    // If this domain's CSS is already applied and the link exists, do nothing
    const existing = document.getElementById("domain-css");
    if (lastAppliedIdRef.current === id && existing) {
      return;
    }

    // Remove old link if present
    if (existing) existing.remove();

    // Inject new <link> for the active domain
    const link = document.createElement("link");
    link.id = "domain-css";
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = `${API_BASE}/api/domain/${id}/css?nocache=${Date.now()}`;
    document.head.appendChild(link);

    lastAppliedIdRef.current = id;
    console.log(`🔧 Domain CSS applied: ${link.href}`);

    // Cleanup: only remove if this effect instance still owns the current domain
    return () => {
      if (lastAppliedIdRef.current === id) {
        const current = document.getElementById("domain-css");
        if (current) current.remove();
        lastAppliedIdRef.current = null;
        console.log("🔧 Domain CSS removed on unmount");
      }
    };
  }, [activeDomainId, NONE_DOMAIN_ID, API_BASE]);
}

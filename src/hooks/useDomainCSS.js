// src/hooks/useDomainCSS.js
import { useEffect, useRef } from "react";
import { useDomain } from "../context/DomainContext";

export default function useDomainCSS() {
  const { activeDomainId, domain, NONE_DOMAIN_ID, API_BASE } = useDomain();
  const lastAppliedIdRef = useRef(null);
  const lastCSSHashRef = useRef(null);

  useEffect(() => {
    const id = activeDomainId;
    console.log(`🔧 [useDomainCSS] Effect triggered - activeDomainId: ${id}, domain loaded: ${!!domain}`);

    // No domain selected → remove any existing CSS and reset
    if (!id || id === NONE_DOMAIN_ID) {
      const existing = document.getElementById("domain-css");
      if (existing) existing.remove();
      lastAppliedIdRef.current = null;
      lastCSSHashRef.current = null;
      console.log("🔧 Domain CSS cleared (no active domain)");
      return;
    }

    // Wait for domain to be loaded
    if (!domain) {
      console.log("🔧 ⏸️ Waiting for domain to load... (activeDomainId:", id, ")");
      return;
    }

    // Get CSS hash/timestamp to detect changes (Phase 10J.4: from payload.css)
    const cssHash = domain?.payload?.css?.updated_at || domain?.updated_at || Date.now();
    const cssContent = domain?.payload?.css?.content || '';
    const cssContentLength = cssContent.length; // Extract for dependency tracking
    
    console.log(`🔧 Domain CSS check - ID: ${id}, Domain name: ${domain.name}, Hash: ${cssHash}, Content length: ${cssContentLength}`);
    
    // If this domain's CSS is already applied with same hash, do nothing
    const existing = document.getElementById("domain-css");
    if (lastAppliedIdRef.current === id && lastCSSHashRef.current === cssHash && existing && cssContent) {
      console.log(`🔧 Domain CSS unchanged (hash: ${cssHash})`);
      return;
    }

    // CSS has changed - force refresh
    console.log(`🔧 Domain CSS updating: old hash=${lastCSSHashRef.current}, new hash=${cssHash}`);

    // Remove ALL old domain CSS styles (aggressive cleanup)
    document.querySelectorAll('#domain-css, [id^="domain-style"]').forEach(el => {
      console.log("🔧 Removing old style element:", el.id);
      el.remove();
    });

    // Load resolved CSS with full inheritance chain from new endpoint
    (async () => {
      try {
        console.log(`🔧 Loading resolved CSS with inheritance for domain: ${id}`);
        
        const response = await fetch(`${API_BASE}/api/domain/${id}/resolved-css?v=${cssHash}`);
        if (!response.ok) {
          throw new Error(`Failed to load resolved CSS: ${response.status}`);
        }
        
        const resolvedCSS = await response.text();
        const chainLength = response.headers.get('X-CSS-Inheritance-Chain-Length') || '?';
        
        console.log(`🔧 Resolved CSS loaded: ${resolvedCSS.length} bytes, inheritance chain length: ${chainLength}`);
        
        const style = document.createElement("style");
        style.id = "domain-css";
        style.setAttribute('data-domain-id', id);
        style.setAttribute('data-applied-at', new Date().toISOString());
        style.setAttribute('data-inheritance-chain-length', chainLength);
        
        // Add !important to ALL CSS rules to ensure they override everything
        const cssWithImportant = resolvedCSS.replace(/;/g, ' !important;');
        
        style.textContent = `
/* Domain CSS for ${id} with full inheritance chain (${chainLength} ancestors) */
/* Applied at ${new Date().toISOString()} */
/* All rules forced with !important to override Tailwind/base.css */
${cssWithImportant}
`;
        
        // Append to end of head to ensure cascade priority
        document.head.appendChild(style);
        console.log(`🔧 ✅ Resolved CSS applied inline (${resolvedCSS.length} bytes, ${chainLength} ancestors)`);
        
        // Verify DOM
        const check = document.getElementById("domain-css");
        console.log(`🔧 DOM verification: style tag exists=${!!check}, textContent length=${check?.textContent?.length}`);
        
        // Check computed styles
        setTimeout(() => {
          const bodyBg = window.getComputedStyle(document.body).backgroundColor;
          const bodyColor = window.getComputedStyle(document.body).color;
          console.log(`🔧 Body computed styles: background-color=${bodyBg}, color=${bodyColor}`);
        }, 100);
        
      } catch (err) {
        console.error(`🔧 ❌ Failed to load resolved CSS: ${err.message}`);
        
        // Fallback to local content if available
        if (cssContent && cssContent.trim()) {
          console.log("🔧 ⚠️ Using fallback local CSS content");
          const style = document.createElement("style");
          style.id = "domain-css";
          style.setAttribute('data-domain-id', id);
          style.textContent = cssContent.replace(/;/g, ' !important;');
          document.head.appendChild(style);
        }
      }
    })();

    lastAppliedIdRef.current = id;
    lastCSSHashRef.current = cssHash;

    // Cleanup: only remove if this effect instance still owns the current domain
    return () => {
      if (lastAppliedIdRef.current === id) {
        const current = document.getElementById("domain-css");
        if (current) current.remove();
        lastAppliedIdRef.current = null;
        lastCSSHashRef.current = null;
        console.log("🔧 Domain CSS removed on unmount");
      }
    };
  }, [activeDomainId, domain?.id, domain?.payload?.css?.updated_at, domain?.payload?.css?.content, NONE_DOMAIN_ID, API_BASE]);
}

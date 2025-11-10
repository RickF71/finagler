// src/components/SuperBar.jsx
import React, { useEffect, useState } from "react";
import { useFinagler } from "../context/FinaglerContext.jsx";
import { useDomain } from "../context/DomainContext.jsx";
import { useDisCorePayload } from "../context/DisCorePayloadContext.jsx";
import finaglerIcon from "../assets/finagler-icon.png";

export default function SuperBar() {
  const { connected, version } = useFinagler();
  const { activeDomainId, setActiveDomainId, NONE_DOMAIN_ID, API_BASE } = useDomain();
  const { setDomain } = useDisCorePayload();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all domains globally (not tied to a specific one)
  useEffect(() => {
    if (!connected) return;

    async function loadDomains() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/domains`);
        if (!res.ok) throw new Error(`Failed to list domains: ${res.statusText}`);
        const data = await res.json();
        setDomains(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load domain list:", err);
        setDomains([]);
      } finally {
        setLoading(false);
      }
    }

    loadDomains();
  }, [connected, API_BASE]);

  // Unified domain switch handler
  function handleSelect(e) {
    const newDomainId = e.target.value;
    setActiveDomainId(newDomainId);
    setDomain(newDomainId); // triggers DisCorePayload state machine
  }

  return (
    <header className="fixed top-0 left-0 right-0 flex items-center justify-between h-9 min-h-[36px] w-full px-4 bg-slate-900 border-b border-slate-800 z-50">
      <div className="flex items-center gap-2">
        <img src={finaglerIcon} alt="Finagler" className="h-5 w-auto" />
        <span className="text-sm font-semibold text-slate-200">
          Finagler {connected ? `(v${version})` : "(offline)"}
        </span>
      </div>

      <select
        value={activeDomainId}
        onChange={handleSelect}
        disabled={!connected || loading}
        className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-1 border border-slate-700"
      >
        <option value={NONE_DOMAIN_ID}>— Finagler —</option>
        {domains.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name || d.id}
          </option>
        ))}
      </select>
    </header>
  );
}

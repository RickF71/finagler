// src/layout/FinaglerLayout.jsx
import React from "react";
import { useFinagler } from "../context/FinaglerContext.jsx";
import { useDomain } from "../context/DomainContext.jsx";
import SuperBar from "../components/SuperBar.jsx";

export default function FinaglerLayout() {
  const { connected, version } = useFinagler();
  const { activeDomainId } = useDomain();

  return (
    <div className="app-container">
      <SuperBar />
      <div className="center" style={{ paddingTop: '36px', flex: '1' }}>
        {connected ? (
          <div className="center column gap-sm text-muted">
            <p>Connected to DIS-Core v{version}</p>
            <p className="text-sm" style={{ marginTop: '8px' }}>
              Domain: {activeDomainId} (none selected)
            </p>
            <p style={{ marginTop: '12px' }}>Select a domain to begin.</p>
          </div>
        ) : (
          <p className="text-muted">Connecting to DIS-Core…</p>
        )}
      </div>
    </div>
  );
}

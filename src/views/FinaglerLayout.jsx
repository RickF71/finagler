// src/layout/FinaglerLayout.jsx
import React from "react";
import { useFinagler } from "../context/FinaglerContext.jsx";
import { useDomain } from "../context/DomainContext.jsx";
import SuperBar from "../components/SuperBar.jsx";

export default function FinaglerLayout() {
  const { connected, version } = useFinagler();
  const { activeDomainId } = useDomain();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <SuperBar />
      <div className="pt-9 flex flex-1 items-center justify-center">
        {connected ? (
          <div className="text-center text-slate-400">
            <p>Connected to DIS-Core v{version}</p>
            <p className="text-xs text-slate-500 mt-2">
              Domain: {activeDomainId} (none selected)
            </p>
            <p className="text-sm mt-3">Select a domain to begin.</p>
          </div>
        ) : (
          <p className="text-slate-600">Connecting to DIS-Core…</p>
        )}
      </div>
    </div>
  );
}

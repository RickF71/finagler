// src/layout/DomainLayout.jsx
import React from "react";
import { useDomain } from "../context/DomainContext.jsx";
import { useUI } from "../context/UIContext.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function DomainLayout() {
  const { domain } = useDomain();
  const { activeUI, setViewModel } = useUI();

  if (!activeUI)
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <p>Loading domain view…</p>
      </div>
    );

  const { viewModel } = activeUI;

  return (
    <div className={`flex min-h-screen lens-${viewModel.style}`}>
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        {viewModel.mode === "json" && (
          <pre className="text-xs">{JSON.stringify(domain, null, 2)}</pre>
        )}
        <button
          onClick={() =>
            setViewModel({
              style:
                viewModel.style === "literal" ? "metaphoric" : "literal",
            })
          }
          className="mt-4 text-xs border border-slate-600 px-2 py-1 rounded"
        >
          Toggle Lens
        </button>
      </main>
    </div>
  );
}

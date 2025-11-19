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
      <div className="center text-muted" style={{ flex: '1' }}>
        <p>Loading domain view…</p>
      </div>
    );

  const { viewModel } = activeUI;

  return (
    <div className={`app-container lens-${viewModel.style}`}>
      <Sidebar />
      <main className="main-content">
        {viewModel.mode === "json" && (
          <pre className="text-sm">{JSON.stringify(domain, null, 2)}</pre>
        )}
        <button
          onClick={() =>
            setViewModel({
              style:
                viewModel.style === "literal" ? "metaphoric" : "literal",
            })
          }
          className="button text-sm"
          style={{ marginTop: '16px' }}
        >
          Toggle Lens
        </button>
      </main>
    </div>
  );
}

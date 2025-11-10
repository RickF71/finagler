import React from "react";
import { useUI } from "../context/UIContext";
import { useDomain } from "../context/DomainContext";
import { Loader2 } from "lucide-react";
import finaglerIcon from "../assets/finagler-icon.png";

export default function Sidebar() {
  const { setView, view } = useUI();
  const {
    activeDomainId,
    domain,
    loading: domainLoading,
    error: domainError,
    NONE_DOMAIN_ID,
    setActiveDomainId,
  } = useDomain();

  // Hide sidebar entirely when no domain is active
  if (!activeDomainId || activeDomainId === NONE_DOMAIN_ID) {
    return null;
  }

  const menuItems = [
    { label: "Overview", view: "overview" },
    { label: "CSS Editor", view: "css-editor" },
    { label: "Files", view: "files" },
    { label: "Identities", view: "identities" },
    { label: "Network Graph", view: "network" },
    { label: "Admin Panel", view: "admin" },
  ];

  return (
    <aside className="sidebar">
      {/* Finagler Logo + Spinner */}
      <div className="toolbar flex center pad-md">
        <img
          src={finaglerIcon}
          alt="Finagler"
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
        {domainLoading && (
          <Loader2
            style={{ position: 'absolute', bottom: '8px', right: '8px' }}
            size={16}
          />
        )}
      </div>

      {/* Domain Name under graphic */}
      <div className="toolbar center">
        {domainError ? (
          <span className="warning">{domainError}</span>
        ) : (
          <>
            <h2 style={{ fontSize: '0.875rem', fontWeight: '600' }}>
              {domain?.name || activeDomainId || "Unknown Domain"}
            </h2>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Active Domain</p>
          </>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="column" style={{ flex: '1', overflowY: 'auto' }}>
        {menuItems.map(({ label, view: v }) => (
          <div
            key={v}
            onClick={() => setView(v)}
            className={`pad-md ${view === v ? 'selected' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            {label}
          </div>
        ))}
      </nav>

      {/* Return to Domain Chooser */}
      <div className="toolbar">
        <button
          onClick={() => setActiveDomainId(NONE_DOMAIN_ID)}
          className="button"
          style={{ width: '100%' }}
        >
          Return to Domain Chooser
        </button>
      </div>
    </aside>
  );
}

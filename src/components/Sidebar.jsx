import React, { useState, useEffect } from "react";
import { useUI } from "../context/UIContext";
import { useDomain } from "../context/DomainContext";
import { Loader2, UserCircle, Shield, FileText, Fingerprint, ChevronDown, ChevronRight } from "lucide-react";
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
    API_BASE,
  } = useDomain();

  // GOV-11F: Track identity submenu expansion
  const [identityExpanded, setIdentityExpanded] = useState(
    view.startsWith('identity')
  );

  // Domain ancestry breadcrumb state
  const [ancestry, setAncestry] = useState([]);

  // Helper function to load domain ancestry chain
  async function loadAncestors(domainId) {
    if (!domainId || domainId === NONE_DOMAIN_ID) return [];
    const chain = [];
    let current = domainId;

    try {
      while (current) {
        const res = await fetch(`${API_BASE}/api/domain/${current}`);
        if (!res.ok) break;
        const data = await res.json();

        // Extract name from payload if not at root level
        const domainName = data.name || 
                          (data.payload?.name) || 
                          (data.payload?.data?.name) || 
                          data.id;

        chain.unshift({
          id: data.id,
          name: domainName,
          parent_id: data.parent_id
        });

        current = data.parent_id;
      }
    } catch (err) {
      console.error("Failed to load ancestry:", err);
    }

    return chain;
  }

  // Load ancestry when activeDomainId changes
  useEffect(() => {
    let cancelled = false;
    
    async function run() {
      const chain = await loadAncestors(activeDomainId);
      if (!cancelled) {
        setAncestry(chain);
      }
    }
    
    run();
    
    return () => {
      cancelled = true;
    };
  }, [activeDomainId, API_BASE]);

  // GOV-11E/11F: Global navigation items (always visible)
  const identityMenuItems = [
    { label: "Overview", view: "identity", icon: UserCircle },
    { label: "Policy", view: "identity-policy", icon: Shield },
    { label: "Corporeal Log", view: "identity-corporeal", icon: Fingerprint },
  ];

  // Domain-specific menu items (only visible when domain is active)
  const domainMenuItems = [
    { label: "Overview", view: "overview" },
    { label: "➕ Create Domain", view: "create-domain" },
    { label: "CSS Editor", view: "css-editor" },
    { label: "Files", view: "files" },
    { label: "Rego Editor", view: "rego" },
    { label: "Identities", view: "identities" },
    { label: "Network Graph", view: "network" },
    { label: "Console", view: "console" },
    { label: "Admin Panel", view: "admin" },
  ];

  const hasDomain = activeDomainId && activeDomainId !== NONE_DOMAIN_ID;

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

      {/* Domain Ancestry Breadcrumb (only if domain active) */}
      {hasDomain && (
        <div className="toolbar" style={{ padding: '12px 16px' }}>
          {domainError ? (
            <span className="warning">{domainError}</span>
          ) : (
            <div className="sidebar-active-domain">
              {ancestry.length > 0 ? (
                <>
                  {ancestry.map((d, idx) => (
                    <div
                      key={d.id}
                      style={{
                        paddingLeft: `${idx * 12}px`,
                        fontWeight: d.id === activeDomainId ? '600' : '400',
                        opacity: d.id === activeDomainId ? 1 : 0.7,
                        fontSize: d.id === activeDomainId ? '0.875rem' : '0.75rem',
                        color: d.id === activeDomainId ? 'var(--text-strong)' : 'var(--text-muted)',
                        marginBottom: '4px'
                      }}
                    >
                      {d.name}
                    </div>
                  ))}
                  <hr style={{ margin: '8px 0', opacity: 0.2, border: 'none', borderTop: '1px solid currentColor' }} />
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {domain?.name || activeDomainId || "Unknown Domain"}
                  </h2>
                  <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Active Domain</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="column" style={{ flex: '1', overflowY: 'auto' }}>
        {/* GOV-11F: Identity Section (expandable) */}
        <div>
          <div
            onClick={() => setIdentityExpanded(!identityExpanded)}
            className={`pad-md ${view.startsWith('identity') ? 'selected' : ''}`}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCircle size={18} />
              <span>Identity</span>
            </div>
            {identityExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>

          {/* Identity submenu */}
          {identityExpanded && (
            <div style={{ paddingLeft: '16px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
              {identityMenuItems.map(({ label, view: v, icon: Icon }) => (
                <div
                  key={v}
                  onClick={() => setView(v)}
                  className={`pad-md ${view === v ? 'selected' : ''}`}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}
                >
                  {Icon && <Icon size={16} />}
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Separator */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />

        {/* Domain-specific items (only when domain active) */}
        {hasDomain && domainMenuItems.map(({ label, view: v }) => (
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

      {/* Return to Domain Chooser (only if domain active) */}
      {hasDomain && (
        <div className="toolbar">
          <button
            onClick={() => setActiveDomainId(NONE_DOMAIN_ID)}
            className="button"
            style={{ width: '100%' }}
          >
            Return to Domain Chooser
          </button>
        </div>
      )}
    </aside>
  );
}

import { useEffect, useState } from "react";

// -------------------------
// Shared theme apply fn
// -------------------------
function applyTheme(domainId) {
  if (!domainId) return;

  fetch(`http://localhost:8080/api/domain/dis/${domainId}`)
    .then(res => res.json())
    .then(({ css, jsx }) => {
      // Remove old CSS
      const old = document.getElementById("domain-style");
      if (old) old.remove();

      // Inject new CSS
      const style = document.createElement("style");
      style.id = "domain-style";
      style.textContent = css;
      document.head.appendChild(style);

      // Remove old JSX container
      const oldDiv = document.getElementById("domain-jsx");
      if (oldDiv) oldDiv.remove();

      // Optional JSX UI additions
      if (jsx) {
        const div = document.createElement("div");
        div.id = "domain-jsx";
        div.innerHTML = jsx;
        document.body.appendChild(div);
      }
    })
    .catch(() => console.warn("No CSS/JSX found for domain:", domainId));
}

// -------------------------
// Hook: domain visuals + live refresh support
// -------------------------
function useDomainVisuals(domainId) {
  // Initial theme load when domain changes
  useEffect(() => {
    applyTheme(domainId);
  }, [domainId]);

  // Listen for CSS update broadcast events
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === domainId) {
        applyTheme(domainId);
      }
    };
    window.addEventListener("domain-css-updated", handler);
    return () => window.removeEventListener("domain-css-updated", handler);
  }, [domainId]);
}

export default function Sidebar() {
  const [domain, setDomain] = useState(() => {
    const stored = localStorage.getItem("activeDomain");
    return stored ? { domain_id: stored } : null;
  });

  const [domains, setDomains] = useState([]);
  const [open, setOpen] = useState(false);

  // Load available domains
  useEffect(() => {
    fetch("http://localhost:8080/api/domain/list")
      .then(res => res.json())
      .then(setDomains);
  }, []);

  // Apply live theme engine
  useDomainVisuals(domain?.domain_id);

  // Change active domain
  const selectDomain = (id, name) => {
    setDomain({ domain_id: id, display: name });
    localStorage.setItem("activeDomain", id);
    setOpen(false);
    // Immediately apply theme
    applyTheme(id);
  };

  return (
    <div className="w-64 min-h-screen bg-slate-900 text-slate-100 flex flex-col p-4">

      {/* Console title */}
      <h1 className="text-2xl font-bold mb-2">
        Finagler <span className="text-emerald-400">Console</span>
      </h1>

      {/* Domain selector */}
      <div className="relative mb-6">
        <button
          className="w-full text-left text-emerald-400 font-semibold hover:text-emerald-300 focus:outline-none"
          onClick={() => setOpen(!open)}
        >
          {domain?.display || domain?.domain_id || "Select Domain"}
        </button>

        {/* Domain CSS Editor Shortcut */}
        {domain?.domain_id && (
          <a
            href={`/domain/${domain.domain_id}/css`}
            className="text-xs text-yellow-400 hover:text-yellow-300 italic mt-1 block"
          >
            ✏️ Edit Domain CSS
          </a>
        )}

        {open && (
          <div className="absolute left-0 mt-2 w-full bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
            {domains.map((d) => (
              <div
                key={d.id}
                onClick={() => selectDomain(d.id, d.name)}
                className="px-3 py-2 hover:bg-slate-700 cursor-pointer"
              >
                {d.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col space-y-2">
        <a href="/overview" className="hover:text-emerald-400">Overview</a>
        <a href="/identities" className="hover:text-emerald-400">Identities</a>
        <a href="/reconcile" className="hover:text-emerald-400">Reconcile</a>
        <a href="/network" className="hover:text-emerald-400">Network Graph</a>
        <a href="/bootstrap" className="hover:text-emerald-400">Bootstrap Data</a>
        <a href="/domains" className="hover:text-emerald-400">Domain sorter</a>
      </nav>

      <div className="flex-1" />
      <div className="text-xs text-slate-500">v0.12 NightField</div>
    </div>
  );
}

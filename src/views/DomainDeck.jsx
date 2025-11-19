// src/views/DomainDeck.jsx
import { useState, useEffect } from "react";
import { listDomains, getDomain } from "../lib/api";

export default function DomainDeck() {
  const [domains, setDomains] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    listDomains()
      .then(data => setDomains(data.items || data || []))
      .catch(() => console.warn("No domain list yet"));
  }, []);

  const activate = async (id) => {
    setActive(id);
    try {
      const domainData = await getDomain(id);
      const { css, jsx } = domainData;

      // Remove any prior
      const oldStyle = document.getElementById("domain-style");
      if (oldStyle) oldStyle.remove();

      // Inject new style
      const style = document.createElement("style");
      style.id = "domain-style";
      style.textContent = css || "";
      document.head.appendChild(style);

      // Optionally add JSX payload (like overlays or banners)
      const oldDiv = document.getElementById("domain-jsx");
      if (oldDiv) oldDiv.remove();
      if (jsx) {
        const div = document.createElement("div");
        div.id = "domain-jsx";
        div.innerHTML = jsx;
        document.body.appendChild(div);
      }
    } catch (e) {
      console.error("Failed to activate domain:", e);
    }
  };

  return (
    <div className="pad-md" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
      {domains.map((d) => (
        <div
          key={d.id}
          className={`panel pad-md ${
            active === d.id ? 'selected' : ''
          }`}
          style={{ 
            cursor: 'pointer',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s',
            ...(active === d.id ? {
              borderColor: 'var(--accent)',
              backgroundColor: 'rgba(255, 255, 0, 0.1)'
            } : {})
          }}
          onClick={() => activate(d.id)}
        >
          <h2 className="text-lg font-bold text-accent" style={{ marginBottom: '8px' }}>
            {d.name || d.id}
          </h2>
          <p className="text-sm text-muted">{d.description || "—"}</p>
        </div>
      ))}
    </div>
  );
}

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
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {domains.map((d) => (
        <div
          key={d.id}
          className={`rounded-2xl shadow-lg p-4 border-2 transition-all duration-200 cursor-pointer ${
            active === d.id
              ? "border-yellow-400 bg-yellow-900/10"
              : "border-gray-700 bg-gray-800/40"
          }`}
          onClick={() => activate(d.id)}
        >
          <h2 className="text-xl font-bold text-yellow-300 mb-2">
            {d.name || d.id}
          </h2>
          <p className="text-sm opacity-80">{d.description || "—"}</p>
        </div>
      ))}
    </div>
  );
}

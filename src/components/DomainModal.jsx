import { useEffect, useState, useRef } from "react";
import { getDomainInfo } from "../lib/api";
import iso2to3 from "../lib/iso3166.js";
import iso3toName from "../lib/iso3166_name.js";

export default function DomainModal({ code, onClose }) {
  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastQuery = useRef("");

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setError(null);
    lastQuery.current = code;

    (async () => {
      try {
        const parsed = await getDomainInfo(code);
        setDomain(parsed);
      } catch (err) {
        let msg = err.message;
        // Handle 404 errors specifically
        if (err.message.includes('404')) {
          msg = `404 Not Found: Domain with code '${code}' not found`;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  // Close on ESC or backdrop click
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!code) return null;

  // Backdrop click closes modal
  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={handleBackdrop}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <div className=" text-slate-200 p-6 rounded-2xl w-[90%] max-w-md shadow-lg border border-slate-700 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-slate-400 hover:text-slate-200 text-xl"
          aria-label="Close"
        >
          ×
        </button>

        {loading && <p className="text-sm text-slate-400 animate-pulse">Loading {code}…</p>}
        {error && error.includes("404") ? (
          <div className="text-center py-6">
            <h2 className="text-2xl font-semibold text-[#7FC692] mb-2">
              {(() => {
                let code = lastQuery.current;
                if (code === "-99") code = "FRA";
                let iso3 = code;
                if (code.length === 2 && iso2to3[code]) iso3 = iso2to3[code];
                const name = iso3toName[iso3];
                if (name) return `${name} (${iso3})`;
                // fallback: just show ISO3
                return iso3;
              })()}
            </h2>
            <div className="text-lg text-slate-400 mt-2">NO DATA</div>
          </div>
        ) : error ? (
          <div className="text-sm text-rose-400">Error: {error}</div>
        ) : null}

        {domain && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-semibold text-[#7FC692] mb-2">{domain.name}</h2>
            <p className="text-sm text-slate-400 mb-3">({domain.code})</p>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-400">Seat:</span>{" "}
                <span className="text-slate-100">{domain.seat}</span>
              </div>
              <div>
                <span className="text-slate-400">Population:</span>{" "}
                <span className="text-slate-100">{domain.population?.toLocaleString()}</span>
              </div>
              {domain.lineage?.length > 0 && (
                <div>
                  <span className="text-slate-400">Lineage:</span>{" "}
                  <span className="text-slate-100">{domain.lineage.join(" → ")}</span>
                </div>
              )}
            </div>

            <p className="mt-4 text-slate-300 leading-relaxed whitespace-pre-line">
              {domain.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

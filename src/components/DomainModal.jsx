import { useEffect, useState } from "react";

export default function DomainModal({ code, onClose }) {
  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`/api/domain/info?code=${code}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        console.log("Domain info raw response:", text);
        const parsed = JSON.parse(text);
        setDomain(parsed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  if (!code) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#0B0F14] text-slate-200 p-6 rounded-2xl w-[90%] max-w-md shadow-lg border border-slate-700 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-slate-400 hover:text-slate-200 text-xl"
        >
          ×
        </button>

        {loading && <p className="text-sm text-slate-400 animate-pulse">Loading {code}…</p>}
        {error && <p className="text-sm text-rose-400">Error: {error}</p>}

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

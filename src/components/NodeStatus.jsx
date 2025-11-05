import React, { useEffect, useState } from "react";
import { getStatus } from "../lib/api";

export default function NodeStatus() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await getStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-blue-300">🧩 Node Overview</h2>
        <button
          onClick={fetchStatus}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-md"
        >
          Refresh
        </button>
      </div>
      {loading && <div className="text-gray-400">Loading...</div>}
      {error && <div className="text-red-400">Error: {error}</div>}
      {status && (
        <pre className="bg-slate-800 rounded-xl p-4 text-sm overflow-auto border border-slate-700">
          {JSON.stringify(status, null, 2)}
        </pre>
      )}
    </div>
  );


}


  useEffect(() => {
    async function loadDIS() {
      const res = await fetch("/api/domain/dis/domain.user.rick");
      const { css, jsx } = await res.json();
      if (css) {
        const style = document.createElement("style");
        style.innerHTML = css;
        document.head.appendChild(style);
      }
      if (jsx) {
        document.getElementById("root").innerHTML = jsx;
      }
    }
    loadDIS();
  }, []);

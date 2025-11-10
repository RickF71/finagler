import React, { useEffect, useState } from "react";
import { useDomain } from "../context/DomainContext";
import { createDISInterface } from "../dis/interface.js";

export default function DomainChooser() {
  const { setActiveDomainId, API_BASE } = useDomain();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const dis = createDISInterface(API_BASE);
      const data = await dis.listDomains();
      setDomains(data.domains || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6 text-gray-400">Loading domains…</div>;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-gray-100">
      <h1 className="text-3xl mb-6">Choose a Domain</h1>
      <ul className="space-y-3">
        {domains.map((d) => (
          <li key={d.id}>
            <button
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
              onClick={() => setActiveDomainId(d.id)}
            >
              {d.name || d.id}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

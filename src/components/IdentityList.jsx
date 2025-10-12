import React, { useEffect, useState } from "react";
import { listIdentities, registerIdentity } from "../lib/api";

export default function IdentityList() {
  const [identities, setIdentities] = useState([]);
  const [form, setForm] = useState({ dis_uid: "", namespace: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await listIdentities();
      setIdentities(Array.isArray(data) ? data : data.items || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.dis_uid) return alert("dis_uid required");
    try {
      await registerIdentity(form);
      setForm({ dis_uid: "", namespace: "" });
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-semibold text-emerald-400">👤 Identities</h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-3 bg-slate-800 p-4 rounded-lg"
      >
        <input
          className="flex-1 px-3 py-2 bg-slate-900 rounded-md border border-slate-700"
          placeholder="dis_uid"
          value={form.dis_uid}
          onChange={(e) => setForm({ ...form, dis_uid: e.target.value })}
        />
        <input
          className="flex-1 px-3 py-2 bg-slate-900 rounded-md border border-slate-700"
          placeholder="namespace (optional)"
          value={form.namespace}
          onChange={(e) => setForm({ ...form, namespace: e.target.value })}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md"
        >
          Register
        </button>
      </form>

      {loading && <div className="text-gray-400">Loading…</div>}
      {error && <div className="text-red-400">Error: {error}</div>}

      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="p-3 text-sm text-gray-400 border-b border-slate-700">
          Registered Identities
        </div>
        {identities.length === 0 && (
          <div className="p-4 text-gray-500 text-sm">No identities yet.</div>
        )}
        {identities.map((id, i) => (
          <div
            key={i}
            className="p-4 border-t border-slate-700 text-sm grid grid-cols-1 md:grid-cols-3 gap-2"
          >
            <div>
              <span className="text-gray-400">dis_uid:</span> {id.dis_uid}
            </div>
            <div>
              <span className="text-gray-400">namespace:</span>{" "}
              {id.namespace || "—"}
            </div>
            <div>
              <span className="text-gray-400">active:</span>{" "}
              {id.active ? "true" : "false"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

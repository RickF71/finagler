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
    <div className="column gap-md pad-md">
      <h2 className="text-lg font-bold text-accent">👤 Identities</h2>

      <form
        onSubmit={handleSubmit}
        className="panel pad-md"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}
      >
        <input
          className="field"
          placeholder="dis_uid"
          value={form.dis_uid}
          onChange={(e) => setForm({ ...form, dis_uid: e.target.value })}
        />
        <input
          className="field"
          placeholder="namespace (optional)"
          value={form.namespace}
          onChange={(e) => setForm({ ...form, namespace: e.target.value })}
        />
        <button
          type="submit"
          className="button"
          style={{ backgroundColor: 'var(--accent)', color: 'black' }}
        >
          Register
        </button>
      </form>

      {loading && <div className="text-muted">Loading…</div>}
      {error && <div className="warning">Error: {error}</div>}

      <div className="panel">
        <div className="toolbar text-muted" style={{ fontSize: '0.875rem' }}>
          Registered Identities
        </div>
        {identities.length === 0 && (
          <div className="pad-md text-muted text-sm">No identities yet.</div>
        )}
        {identities.map((id, i) => (
          <div
            key={i}
            className="list-item pad-md text-sm"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}
          >
            <div>
              <span className="text-muted">dis_uid:</span> {id.dis_uid}
            </div>
            <div>
              <span className="text-muted">namespace:</span>{" "}
              {id.namespace || "—"}
            </div>
            <div>
              <span className="text-muted">active:</span>{" "}
              {id.active ? "true" : "false"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

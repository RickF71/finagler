import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function DomainCSSEditor() {
  const { id } = useParams();          // domain id from route
  const [css, setCss] = useState("");  // editor value
  const [status, setStatus] = useState("");

  // Load CSS for domain
  useEffect(() => {
    fetch(`http://localhost:8080/api/domain/${id}`)
      .then(res => res.json())
      .then(({ css }) => setCss(css || ""))
      .catch(() => setCss("/* No CSS found */"));
  }, [id]);

  async function save() {
    const res = await fetch(`http://localhost:8080/api/domain/${id}/css`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ css })
    });

    setStatus(res.ok ? "✅ Saved" : "❌ Error saving");
    setTimeout(() => setStatus(""), 2000);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-3 text-emerald-400">
        Editing Domain CSS: {id}
      </h1>

      <textarea
        className="w-full h-96 p-3 font-mono border rounded bg-black text-yellow-200"
        value={css}
        onChange={(e) => setCss(e.target.value)}
      />

      <button
        onClick={save}
        className="mt-4 px-4 py-2 bg-amber-500 rounded text-black font-bold"
      >
        Save
      </button>

      {status && <div className="mt-2 text-sm">{status}</div>}
    </div>
  );
}

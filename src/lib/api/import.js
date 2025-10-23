// finagler/src/lib/api/import.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080"

export async function postImportYAML({ filename, category, content }) {
  const res = await fetch(`${API_BASE}/api/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, category, content }),
  })
  if (!res.ok) throw new Error(`Import failed: ${res.status}`)
  return res.json()
}

export async function listImports() {
  const res = await fetch(`${API_BASE}/api/import/list`)
  if (!res.ok) throw new Error(`List failed: ${res.status}`)
  return res.json()
}

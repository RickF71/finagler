const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

async function request(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }

  return res.json();
}

// Node info
export const getStatus = () => request("/api/status");

// Identities
export const listIdentities = () => request("/api/identity/list");
export const registerIdentity = (payload) =>
  request("/api/identity/register", { method: "POST", body: payload });

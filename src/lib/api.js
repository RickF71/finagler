// MirrorSpin status
export const fetchMirrorSpinStatus = () => request("/api/mirrorspin/status");
// Network peers
export const listPeers = () => request("/api/net/peers");
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

// Overlay / Terra helpers
// getOverlay(domain, scope) -> /api/overlay/:domain/:scope
// getOverlay(overlayId) -> /api/overlay/:overlayId
export const getOverlay = (domainOrId, scope) => {
  if (typeof scope !== "undefined") return request(`/api/overlay/${domainOrId}/${scope}`);
  return request(`/api/overlay/${domainOrId}`);
};

// getTerraOverlay(region) -> /api/terra/map?region=<region>&nocache=<ts>
export const getTerraOverlay = (region = "world", nocache = true) => {
  const q = `?region=${encodeURIComponent(region)}` + (nocache ? `&nocache=${Date.now()}` : "");
  return request(`/api/terra/map${q}`);
};

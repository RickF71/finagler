export const FINAGLER_MODE = import.meta.env.VITE_FINAGLER_MODE || "finagler";
export const DIS_CORE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const API_BASE = DIS_CORE;

export function api(path) {
  if (typeof path !== "string") throw new Error("api(path) must be a string");
  if (!path.startsWith("/")) path = "/" + path;

  if (FINAGLER_MODE === "finagler") {
    return `${DIS_CORE}${path}`;
  }

  return path;
}

export const fetchMirrorSpinStatus = () => request("/api/mirrorspin/status");
export const listPeers = () => request("/api/net/peers");

function getDevUserId() {
  return localStorage.getItem("dis_dev_user_id");
}

export function setDevUserId(userId) {
  if (userId) {
    localStorage.setItem("dis_dev_user_id", userId);
  } else {
    localStorage.removeItem("dis_dev_user_id");
  }
}

async function request(
  path,
  { method = "GET", body, headers, skipAuthCheck = false } = {}
) {
  const devUserId = getDevUserId();
  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (devUserId) {
    requestHeaders["X-External-User"] = devUserId;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok && res.status === 401 && !skipAuthCheck) {
    console.warn("🚫 Unauthorized - redirecting to None Space");
    setDevUserId(null);
    window.location.href = "/none";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }

  return res.json();
}

export const getStatus = () => request("/api/status");

export const listIdentities = () => request("/api/identity/list");
export const registerIdentity = (payload) =>
  request("/api/identity/register", { method: "POST", body: payload });

export const getOverlay = (domainOrId, scope) => {
  if (typeof scope !== "undefined")
    return request(`/api/overlay/${domainOrId}/${scope}`);
  return request(`/api/overlay/${domainOrId}`);
};

export const getTerraOverlay = (region = "world", nocache = true) => {
  const q =
    `?region=${encodeURIComponent(region)}` +
    (nocache ? `&nocache=${Date.now()}` : "");
  return request(`/api/terra/map${q}`);
};

export const listDomains = () => request("/api/domain");
export const getDomain = (domainId) => request(`/api/domain/${domainId}`);
export const getDomainTheme = (domainId) =>
  request(`/api/domain/theme/${domainId}`);
export const getDomainLinks = () => request("/api/domain/links");
export const getDomainInfo = (code) =>
  request(`/api/domain/info?code=${encodeURIComponent(code)}`);

export const getDefaultDomain = () => request("/api/domain/default");

export const getMe = () => request("/api/me");
export const getMeActors = () => request("/api/me/actors");
export const getActiveActor = () => request("/api/me/active-actor");
export const setActiveActor = (seatId) =>
  request("/api/me/active-actor", {
    method: "POST",
    body: { seat_id: seatId },
  });

export const getDomainResolvedCSS = (domainId) =>
  request(`/api/domain/${domainId}/css/resolved`);

//
// AUTH / NONE SPACE
//
export const getDevUsers = () =>
  request("/api/auth/dev-users", { skipAuthCheck: true });

export const devLogin = (userId) =>
  request("/api/auth/dev-login", {
    method: "POST",
    body: { user_id: userId },
    skipAuthCheck: true,
  });

//
// 🟢 FIXED: createAuthChallenge now supports body for dev mode
//
export const createAuthChallenge = (payload = null) =>
  request("/api/auth/challenge", {
    method: "POST",
    skipAuthCheck: true,
    body: payload ? payload : undefined,
  });

export const getChallengeStatus = (challengeId) =>
  request(`/api/auth/challenge/${challengeId}/status`, {
    skipAuthCheck: true,
  });

export const completeChallenge = (challengeId, userId) =>
  request("/api/auth/qr-complete", {
    method: "POST",
    body: { challenge_id: challengeId, user_id: userId },
    skipAuthCheck: true,
  });

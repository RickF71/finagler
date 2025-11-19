// src/utils/api.js
const DIS_CORE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export function detectUrlMode(path) {
  if (!path.startsWith("/api/")) return path;
  return `${DIS_CORE}${path}`;
}

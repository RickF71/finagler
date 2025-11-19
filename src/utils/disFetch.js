//
// Global wrapper for ALL DIS-Core requests.
// NEVER send a network request if offline == true.
// All Finagler code should switch to disFetch(...)
// instead of fetch(...).
//

import { useConnectionGate } from "../context/ConnectionGateProvider";

export function disFetch(url, options = {}) {
  const { allowRequests } = useConnectionGate();

  if (!allowRequests) {
    return Promise.reject(new Error("DIS-Core offline: request suppressed"));
  }

  return fetch(url, {
    credentials: "include",
    ...options,
  });
}

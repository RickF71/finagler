// gatedFetch: wraps fetch and consults a ping predicate before performing network calls
// pingPredicate should be a function that returns boolean (sync) indicating whether the ping-tree thinks the backend is up
import { api } from "../lib/api.js";

export async function gatedFetch(pingPredicate, input, init = {}) {
  if (typeof pingPredicate !== "function") {
    throw new Error("gatedFetch requires a pingPredicate function as first argument");
  }

  if (!pingPredicate()) {
    // simulate network failure while offline to let callers handle it
    const e = new Error("dis-core offline (gatedFetch blocked)");
    e.name = "OfflineError";
    throw e;
  }

  // Rewrite relative URLs through the api() helper before fetch
  let url = input;
  if (typeof url === "string" && url.startsWith("/")) {
    url = api(url);
  }

  // proceed with real fetch
  return fetch(url, init);
}

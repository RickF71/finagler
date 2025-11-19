// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./app/App.jsx";
import NoneSpace from "./routes/NoneSpace.jsx";
import { ConnectionGateProvider } from "./context/ConnectionGateProvider.jsx";
import { detectUrlMode } from "./utils/api.js";

const MODE = import.meta.env.VITE_FINAGLER_MODE || "finagler";

// Install global fetch interceptor with offline blocking, external headers, and mode-aware rewriting
if (!window.__DIS_FETCH_WRAPPED__) {
  const originalFetch = window.fetch;

  window.fetch = async (input, init) => {

    // --------------------------------------------------------
    // OFFLINE MODE: Block ALL fetches except /api/ping
    // --------------------------------------------------------
    if (window.__DIS_OFFLINE__) {
      if (typeof input === "string" && !input.includes("/api/ping")) {
        return Promise.reject(new Error("DIS-Core offline"));
      }
    }

    // --------------------------------------------------------
    // Inject external-user headers (Manual Dev Login)
    // --------------------------------------------------------
    if (window.__EXTERNAL_HEADERS__) {
      init = init || {};
      init.headers = {
        ...(init.headers || {}),
        ...window.__EXTERNAL_HEADERS__,
      };
    }

    // --------------------------------------------------------
    // Mode-aware API rewriting
    // --------------------------------------------------------
    if (
      MODE === "finagler" &&
      typeof input === "string" &&
      input.startsWith("/api/")
    ) {
      input = detectUrlMode(input);
    }

    try {
      return await originalFetch(input, init);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  window.__DIS_FETCH_WRAPPED__ = true;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConnectionGateProvider>
      <Router>
        <Routes>
          <Route path="/none" element={<NoneSpace />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </Router>
    </ConnectionGateProvider>
  </React.StrictMode>
);

import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// --- 1. Add the CSS injector here ---
async function applyDomainCss(domainId) {
  try {
    const res = await fetch(`/api/domain/${domainId}`);
    if (!res.ok) throw new Error(`fetch failed: ${res.statusText}`);

    const json = await res.json();
    const css = json?.css ?? "";

    let tag = document.getElementById("dis-domain-css");
    if (!tag) {
      tag = document.createElement("style");
      tag.id = "dis-domain-css";
      document.head.appendChild(tag);
    }

    tag.textContent = css;
  } catch (err) {
    console.error("applyDomainCss failed:", err);
  }
}

// --- 2. Wrap everything in your border frame ---
function DisBorderFrame({ children }) {
  // Apply the Null Domain CSS once when this component mounts
  useEffect(() => {
    applyDomainCss("user.rick");
  }, []);

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          border: "1px solid yellow",
          zIndex: 99999,
          pointerEvents: "none",
          boxSizing: "border-box",
        }}
      />
      {children}
    </>
  );
}

// --- 3. Render the app ---
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DisBorderFrame>
      <App />
    </DisBorderFrame>
  </React.StrictMode>
);

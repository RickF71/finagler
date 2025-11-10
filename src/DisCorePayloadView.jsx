// src/DisCorePayloadView.jsx
import React, { useEffect, useState } from "react";
import { useDisCorePayload } from "./context/DisCorePayloadContext.jsx";
import { useDomain } from "./context/DomainContext.jsx";
import SuperBar from "./components/SuperBar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import DomainView from "./views/DomainView.jsx";
import useDomainCSS from "./hooks/useDomainCSS.js";
import NoneView from "./views/NoneView.jsx";

export default function DisCorePayloadView() {
  const { payload } = useDisCorePayload();
  const { activeDomainId, NONE_DOMAIN_ID } = useDomain();

  const state = payload.domain?.state || "none";
  const domain = payload.domain;
  const [fadeClass, setFadeClass] = useState("fade-out");

  useDomainCSS(); // 

  // Smooth fade-in when domain becomes ready
  useEffect(() => {
    if (state === "ready") {
      setFadeClass("fade-out");
      const t = setTimeout(() => setFadeClass("fade-in"), 20);
      return () => clearTimeout(t);
    } else {
      setFadeClass("fade-out");
    }
  }, [state, domain?.id]);

  return (
    <div className="app-container">
      <SuperBar />

      <div className="app-body">
        <Sidebar />

        <main className={`main-content fade-transition ${fadeClass}`}>
          {state === "loading" && (
            <div className="center-content loading-text">
              Loading {domain?.id || activeDomainId || "domain"}…
            </div>
          )}

          {state === "error" && (
            <div className="center-content-column error-text">
              <div>Error loading {domain?.id || activeDomainId}.</div>
              <div className="error-detail">
                {domain?.message || "Unknown error"}
              </div>
            </div>
          )}

          {state === "ready" && <DomainView domain={domain} />}

          {state === "none" && <NoneView />}
        </main>
      </div>
    </div>
  );
}


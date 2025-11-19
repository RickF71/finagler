// src/app/App.jsx
import React, { useEffect, useRef } from "react";
import { ActiveUserProvider } from "../context/ActiveUserContext.jsx";
import { DomainProvider } from "../context/DomainContext.jsx";
import { ResolvedDomainProvider } from "../context/ResolvedDomainContext.jsx";
import { VistaProvider } from "../context/VistaContext.jsx";
import { UIProvider } from "../context/UIContext.jsx";
import AuthGate from "../components/auth/AuthGate.jsx";
import DisCorePayloadView from "../DisCorePayloadView.jsx";
import DisPowerRing from "../components/DisPowerRing.jsx";
import { useDisStatus } from "../hooks/useDisStatus.js";

import "../index.css";
import "../base.css";

export default function App() {
  const online = useDisStatus();

  useEffect(() => {
    window.__DIS_OFFLINE__ = !online;
  }, [online]);

  return (
    <>
      <DisPowerRing />
      <AuthGate>
        {(identity) => {
          // NOTE: Adjust this field name to match your real identity shape.
          // For example, identity.corporeal_domain_id or identity.domain_id.
          const initialDomain =
            identity && (identity.corporeal_domain_id || identity.domain_id);

          return (
            <ActiveUserProvider initialIdentity={identity}>
              <DomainProvider initialDomain={initialDomain}>
                <ResolvedDomainProvider>
                  <VistaProvider>
                    <UIProvider>
                      <DisCorePayloadView />
                    </UIProvider>
                  </VistaProvider>
                </ResolvedDomainProvider>
              </DomainProvider>
            </ActiveUserProvider>
          );
        }}
      </AuthGate>
    </>
  );
}

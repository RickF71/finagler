// src/context/ResolvedDomainContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { useDomain } from "./DomainContext.jsx";

const ResolvedDomainContext = createContext(null);

export function ResolvedDomainProvider({ children }) {
  const { domain: activeDomain } = useDomain();
  const [resolved, setResolved] = useState(null);

  // TODO: wire this to a real /api/domain/{id}/resolved (or equivalent)
  // For now, we just expose the activeDomain as a placeholder for the
  // resolved domain object so UI layer can be designed without backend coupling.
  const value = useMemo(
    () => ({
      activeDomain,
      resolvedDomain: resolved,
      setResolvedDomain: setResolved,
    }),
    [activeDomain, resolved]
  );

  return (
    <ResolvedDomainContext.Provider value={value}>
      {children}
    </ResolvedDomainContext.Provider>
  );
}

export function useResolvedDomain() {
  const ctx = useContext(ResolvedDomainContext);
  if (!ctx) {
    throw new Error(
      "useResolvedDomain must be used within ResolvedDomainProvider"
    );
  }
  return ctx;
}

// Backwards-compatibility exports
export const DisCorePayloadProvider = ResolvedDomainProvider;

export function useDisCorePayload() {
  return useResolvedDomain();
}

import React, { createContext, useContext, useState } from "react";
import { useDomain } from "./DomainContext.jsx";

const DisCorePayloadContext = createContext();

export function DisCorePayloadProvider({ children }) {
  const { dis } = useDomain();

  const [payload, setPayload] = useState({
    system: {},
    user: {},
    domain: { state: "none" },
  });

  /**
   * setDomain(newDomainId)
   * Triggers the domain state machine:
   *  none → loading → ready | error
   */
  async function setDomain(newDomainId) {
    if (!newDomainId) return;

    // Step 1: enter loading state
    setPayload((prev) => ({
      ...prev,
      domain: { id: newDomainId, state: "loading" },
    }));

    try {
      // Step 2: request new domain payload
      const data = await dis.domain.getPayload(newDomainId);

      // Step 3: update with fresh domain data
      setPayload((prev) => ({
        ...prev,
        domain: { ...data, state: "ready" },
      }));
    } catch (err) {
      // Step 4: handle error gracefully
      setPayload((prev) => ({
        ...prev,
        domain: {
          id: newDomainId,
          state: "error",
          message: err?.message || String(err),
        },
      }));
    }
  }

  const value = { payload, setDomain };
  return (
    <DisCorePayloadContext.Provider value={value}>
      {children}
    </DisCorePayloadContext.Provider>
  );
}

export function useDisCorePayload() {
  return useContext(DisCorePayloadContext);
}

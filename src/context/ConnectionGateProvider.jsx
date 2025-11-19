import { createContext, useContext } from "react";
import { useDisConnection } from "../hooks/useDisConnection";

const ConnectionGateContext = createContext({
  offline: false,
  allowRequests: false,
});

export function ConnectionGateProvider({ children }) {
  const { offline } = useDisConnection();

  const allowRequests = !offline;

  return (
    <ConnectionGateContext.Provider value={{ offline, allowRequests }}>
      {children}
    </ConnectionGateContext.Provider>
  );
}

export function useConnectionGate() {
  return useContext(ConnectionGateContext);
}

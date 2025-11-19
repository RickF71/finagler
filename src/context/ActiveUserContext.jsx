// src/context/ActiveUserContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const ActiveUserContext = createContext(null);

export function ActiveUserProvider({ initialIdentity, children }) {
  const [activeUser, setActiveUser] = useState(initialIdentity || null);

  // If AuthGate ever refreshes identity and passes a new object, sync it.
  useEffect(() => {
    if (initialIdentity) {
      setActiveUser(initialIdentity);
    }
  }, [initialIdentity]);

  const value = React.useMemo(
    () => ({
      activeUser,
      setActiveUser,
    }),
    [activeUser]
  );

  return (
    <ActiveUserContext.Provider value={value}>
      {children}
    </ActiveUserContext.Provider>
  );
}

export function useActiveUser() {
  const ctx = useContext(ActiveUserContext);
  if (!ctx) {
    throw new Error("useActiveUser must be used within ActiveUserProvider");
  }
  return ctx;
}

import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveUser } from "../../context/ActiveUserContext";
import { usePingGate } from "../../hooks/usePingGate";

// PostAuthInitializer: waits for the ping-tree to report online before proceeding
// to call any post-auth initialization such as fetching /api/me or other identity endpoints.
export default function PostAuthInitializer({ children, onReady }) {
  const isOnline = usePingGate(3000);
  const initializedRef = useRef(false);
  const { refreshMe } = useActiveUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOnline) return;
    if (initializedRef.current) return;

    initializedRef.current = true;

    (async () => {
      try {
        // refreshMe should fetch /api/me and populate active user context
        if (refreshMe) await refreshMe();
        if (typeof onReady === "function") onReady();
      } catch (err) {
        // If identity fetch fails, navigate to a safe route or show error
        // We'll just log and leave the app to show its own error state
        // eslint-disable-next-line no-console
        console.error("PostAuthInitializer: refreshMe failed:", err);
      }
    })();
  }, [isOnline, refreshMe, onReady, navigate]);

  // while waiting, render nothing so parent tree can remain frozen or show a spinner
  if (!isOnline) return null;

  return <>{children}</>;
}

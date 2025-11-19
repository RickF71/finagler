import React, { useEffect, useState } from "react";
import { usePingGate } from "../../hooks/usePingGate.js";
import { gatedFetch } from "../../net/gatedFetch.js";
import LoginPage from "./LoginPage.jsx";

export default function AuthGate({ children }) {
  const isOnline = usePingGate(2000);
  const [identity, setIdentity] = useState(null);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOnline) return;

    let cancelled = false;

    async function loadIdentity() {
      try {
        setError(null);
        const res = await gatedFetch(() => isOnline, "/api/me", {
          credentials: "include",
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            if (!cancelled) {
              setIdentity(null);
              setChecked(true);
            }
            return;
          }
          throw new Error(`Identity fetch failed: ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          setIdentity(data);
          setChecked(true);
        }
      } catch (e) {
        if (!cancelled) {
          // Check if this is an offline error from the fetch interceptor
          const isOfflineError = e.message && (
            e.message.includes("DIS-Core offline") || 
            e.message.includes("Failed to fetch") ||
            e.message.includes("NetworkError")
          );
          
          if (isOfflineError) {
            console.log("[AuthGate] DIS-Core is not connected, waiting for connection...");
            // Don't set error or checked - let the offline banner show via !isOnline check
            return;
          }
          
          // Real errors (not offline) - log and show to user
          console.error("[AuthGate] Identity load error:", e);
          setError(e);
          setIdentity(null);
          setChecked(true);
        }
      }
    }

    loadIdentity();
    return () => {
      cancelled = true;
    };
  }, [isOnline]);

  // Listen for manual dev login events
  useEffect(() => {
    function refresh() {
      if (isOnline) {
        setChecked(false);
        // Trigger identity reload by resetting state
        setIdentity(null);
      }
    }

    window.addEventListener("dis-auth-updated", refresh);
    return () => window.removeEventListener("dis-auth-updated", refresh);
  }, [isOnline]);

  // 1) DIS-Core offline → show offline banner (None Space / waiting)
  if (!isOnline) {
    return (
      <div className="offline-banner">
        <div className="dot" />
        <div>
          <h2>DIS-Core Offline</h2>
          <p>Waiting for server heartbeat…</p>
        </div>
      </div>
    );
  }

  // 2) Waiting on initial identity check
  if (!checked) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        color: "#aaa",
        background: "#000"
      }}>
        <div style={{ fontSize: "2em", marginBottom: 16 }}>⏳</div>
        <div>Checking authentication…</div>
      </div>
    );
  }

  // 3) Not authenticated → show login path
  if (!identity) {
    return <LoginPage error={error} />;
  }

  // 4) Authenticated but NOT bound to corporeal domain → show NoneSpace
  if (!identity.bound || !identity.corporeal_domain_id) {
    return <LoginPage error={error || "Authenticated but not bound to corporeal domain"} />;
  }

  // 5) Authenticated AND bound → pass identity downward via render-prop
  if (typeof children === "function") {
    return children(identity);
  }

  // Fallback: if children is not a function, just render it (legacy)
  return children;
}

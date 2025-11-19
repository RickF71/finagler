/* src/routes/NoneSpace.jsx */

import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createAuthChallenge, getChallengeStatus } from "../lib/api";
import { DevLoginPanel } from "../components/auth/DevLoginPanel";

export default function NoneSpace({ error: authError }) {
  //
  // Start in manual mode (dev-users)
  //
  const [mode, setMode] = useState("dev-users"); // "dev-users" or "qr"

  const [challengeId, setChallengeId] = useState(null);
  const [qrPayload, setQrPayload] = useState(null);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState(authError || null);

  const challengeCreated = useRef(false);

  //
  // ---------------------
  // QR MODE INITIALIZATION
  // ---------------------
  //
  useEffect(() => {
    if (mode !== "qr") return;
    if (challengeCreated.current) return;

    challengeCreated.current = true;

    async function init() {
      try {
        console.log("🔐 Creating QR auth challenge...");
        const { challenge_id, qr_payload } = await createAuthChallenge();
        setChallengeId(challenge_id);
        setQrPayload(qr_payload);
        setStatus("pending");
        console.log("✅ QR challenge created:", challenge_id);
      } catch (e) {
        console.error("Failed to create QR auth challenge", e);
        setError("Unable to start authentication.");
        challengeCreated.current = false;
      }
    }

    init();
  }, [mode]);

  //
  // ---------------------
  // QR MODE STATUS POLLING
  // ---------------------
  //
  useEffect(() => {
    if (mode !== "qr") return;
    if (!challengeId) return;
    if (status !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const res = await getChallengeStatus(challengeId);
        console.log("Challenge status:", res.status);

        if (res.status === "authenticated") {
          setStatus("authenticated");
          clearInterval(interval);

          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        } else if (res.status === "expired") {
          setStatus("expired");
          clearInterval(interval);
        }
      } catch (e) {
        console.error("Error polling challenge status", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [challengeId, status, mode]);

  //
  // ---------------------
  // DEV USERS MODE (manual login)
  // ---------------------
  //
  if (mode === "dev-users") {
    return (
      <div
        style={{
          padding: 40,
          fontFamily: "sans-serif",
          maxWidth: 600,
          margin: "0 auto",
          background: "#000",
          color: "#eee",
          minHeight: "100vh",
        }}
      >
        <DevLoginPanel
          challengeId={challengeId}
          onChallengeId={(id) => setChallengeId(id)}
          onBack={() => setMode("qr")}
        />
      </div>
    );
  }

  //
  // ---------------------
  // QR MODE UI
  // ---------------------
  //
  if (mode === "qr") {
    return (
      <div
        style={{
          padding: 40,
          fontFamily: "sans-serif",
          maxWidth: 600,
          margin: "0 auto",
          background: "#000",
          color: "#eee",
          minHeight: "100vh",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.5em",
            marginBottom: "0.5em",
            color: "#ff6b35",
          }}
        >
          You Are Outside DIS
        </h1>

        <p
          style={{
            fontSize: "1.2em",
            marginBottom: "2em",
            color: "#aaa",
          }}
        >
          Scan this code with your phone to authenticate and enter the DIS universe.
        </p>

        {error && (
          <p style={{ color: "#ff6b35", marginBottom: "2em" }}>{error}</p>
        )}

        {status === "pending" && qrPayload && (
          <div style={{ margin: "32px 0" }}>
            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                display: "inline-block",
              }}
            >
              <QRCodeSVG value={qrPayload} size={256} />
            </div>

            <p style={{ marginTop: "20px", color: "#888", fontSize: "0.9em" }}>
              Waiting for authentication...
            </p>

            <div
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                background: "#ff6b35",
                borderRadius: "50%",
                animation: "pulse 2s infinite",
              }}
            />
          </div>
        )}

        {status === "authenticated" && (
          <div style={{ margin: "32px 0" }}>
            <div style={{ fontSize: "4em", marginBottom: "16px" }}>✅</div>
            <p style={{ fontSize: "1.5em", color: "#4ade80" }}>
              Authentication successful!
            </p>
            <p style={{ color: "#aaa" }}>Entering DIS...</p>
          </div>
        )}

        {status === "expired" && (
          <div style={{ margin: "32px 0" }}>
            <p style={{ color: "#ff6b35", fontSize: "1.2em" }}>
              This authentication attempt has expired.
            </p>

            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                background: "#ff6b35",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1em",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        <div
          style={{
            marginTop: "3em",
            paddingTop: "2em",
            borderTop: "1px solid #333",
            fontSize: "0.9em",
            color: "#666",
          }}
        >
          <p>🌌 None Space — The realm outside DIS sovereignty</p>
          <p>This device will enter once authentication completes.</p>

          <button
            onClick={() => setMode("dev-users")}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              background: "transparent",
              color: "#666",
              border: "1px solid #444",
              borderRadius: "6px",
              fontSize: "0.9em",
              cursor: "pointer",
            }}
          >
            Dev Mode: Manual Login
          </button>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  }

  return null;
}

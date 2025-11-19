/* src/components/auth/DevLoginPanel.jsx */

import { useState, useEffect } from "react";
import { getDevUsers, completeChallenge, createAuthChallenge } from "../../lib/api";

export function DevLoginPanel({ challengeId, onChallengeId, onBack }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingChallenge, setCreatingChallenge] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");

  //
  // Load dev users
  //
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getDevUsers();
        setUsers(res.users || []);
      } catch (e) {
        console.error("Failed to load dev users:", e);
        setError("Unable to load dev identities.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  //
  // CREATE CHALLENGE immediately when user is selected
  //
  async function handleSelect(e) {
    const id = e.target.value;
    setSelectedUser(id);
    setError("");

    if (!id) return;

    try {
      setCreatingChallenge(true);
      console.log("🔐 Creating challenge for dev user:", id);

        const res = await createAuthChallenge({ external_user_id: selectedUser });
        const { challenge_id } = res;

      console.log("✅ Challenge created:", challenge_id);
      onChallengeId(challenge_id);

    } catch (err) {
      console.error("Challenge creation failed:", err);
      setError("Unable to create challenge for this user.");
    } finally {
      setCreatingChallenge(false);
    }
  }

  //
  // COMPLETE the challenge (Log In)
  //
  async function handleLogin() {
    if (!selectedUser || !challengeId) {
      setError("No challenge available. Select a user again.");
      return;
    }

    setLoggingIn(true);
    try {
        await completeChallenge({ challenge_id: challengeId, user_id: selectedUser });
      console.log("✅ Challenge completed for:", selectedUser);

      window.location.href = "/";
    } catch (e) {
      console.error("Login failed:", e);
      setError("Login failed: " + (e?.message || String(e)));
      setLoggingIn(false);
    }
  }

  //
  // UI
  //
  if (loading) {
    return <div style={{ padding: 20, color: "#888" }}>Loading dev identities…</div>;
  }

  return (
    <div
      style={{
        padding: 20,
        border: "1px solid #333",
        borderRadius: 8,
        background: "#111",
        color: "#eee",
      }}
    >
      <h2 style={{ color: "#ff6b35", marginBottom: 20 }}>
        Dev Mode: Manual Login
      </h2>

      {error && (
        <div style={{ color: "#ff6b35", marginBottom: 16 }}>{error}</div>
      )}

      <select
        value={selectedUser}
        onChange={handleSelect}
        style={{
          width: "100%",
          padding: "12px",
          background: "#000",
          color: "#eee",
          border: "1px solid #444",
          borderRadius: 6,
          marginBottom: 16,
          fontSize: "1em",
          cursor: "pointer",
        }}
      >
        <option value="" disabled>
          Select a dev identity…
        </option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.id})
          </option>
        ))}
      </select>

      <button
        onClick={handleLogin}
        disabled={!selectedUser || !challengeId || loggingIn || creatingChallenge}
        style={{
          width: "100%",
          padding: "12px 20px",
          background:
            !selectedUser || !challengeId ? "#333" : "#4caf50",
          color: !selectedUser || !challengeId ? "#666" : "#000",
          borderRadius: 8,
          border: "none",
          fontSize: "1em",
          cursor:
            !selectedUser || !challengeId ? "not-allowed" : "pointer",
          marginBottom: 20,
        }}
      >
        {loggingIn
          ? "Logging in…"
          : creatingChallenge
          ? "Creating challenge…"
          : "Log In"}
      </button>

      <button
        onClick={onBack}
        style={{
          width: "100%",
          padding: "10px 20px",
          background: "transparent",
          color: "#ff6b35",
          border: "1px solid #ff6b35",
          borderRadius: 6,
          fontSize: "0.9em",
          cursor: "pointer",
        }}
      >
        ← Back to QR Auth
      </button>

      <p
        style={{
          marginTop: 20,
          color: "#666",
          fontSize: "0.9em",
        }}
      >
        🌌 None Space — Dev Identity Selection
      </p>
    </div>
  );
}

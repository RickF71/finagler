// src/pages/ManualDevLogin.jsx
import React, { useState } from "react";

export default function ManualDevLogin() {
  const [userId, setUserId] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    if (!userId) return;

    // Set external user globally
    window.__EXTERNAL_USER__ = userId;

    // Future fetch calls include dev override header
    window.__EXTERNAL_HEADERS__ = {
      "X-External-User": userId,
    };

    // Notify AuthGate
    const evt = new CustomEvent("dis-auth-updated");
    window.dispatchEvent(evt);

    // Go back to Finagler root
    window.location.href = "/";
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Manual Dev Login</h2>
      <form onSubmit={handleLogin}>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter DIS User ID"
          style={{ padding: "0.6rem", width: "300px" }}
        />
        <button type="submit" style={{ padding: "0.6rem", marginLeft: "8px" }}>
          Log In
        </button>
      </form>
    </div>
  );
}

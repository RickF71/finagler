// src/views/NoneView.jsx
import React from "react";

export default function NoneView() {
  return (
    <div className="center-content-column text-muted">
      <div className="text-lg font-bold" style={{ marginBottom: '8px' }}>No Domain Selected</div>
      <div className="text-sm" style={{ opacity: '0.75' }}>
        Choose a domain from the selector above to begin.
      </div>
      <div className="text-sm" style={{ opacity: '0.6', marginTop: '16px', fontSize: '0.8rem' }}>
        Tip: Select a domain to create child domains.
      </div>
    </div>
  );
}

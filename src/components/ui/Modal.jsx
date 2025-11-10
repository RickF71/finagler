import React from "react";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="center" style={{ position: 'fixed', inset: '0', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: '50' }}>
      <div className="panel pad-md" style={{ width: '480px', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div className="flex center gap-md" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{title}</h2>
          <button
            className="text-muted"
            onClick={onClose}
            style={{ fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
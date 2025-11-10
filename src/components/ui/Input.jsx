import React from "react";

export default function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="column gap-sm">
      {label && <label className="text-muted" style={{ fontSize: '0.875rem' }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="field"
      />
    </div>
  );
}
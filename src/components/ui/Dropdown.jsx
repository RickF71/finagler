import React, { useState, useRef, useEffect } from "react";

export default function Dropdown({ label, items = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block', textAlign: 'left' }} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="field"
        style={{ fontSize: '0.875rem' }}
      >
        {label}
      </button>
      {open && (
        <div className="panel" style={{ position: 'absolute', marginTop: '8px', width: '192px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: '10' }}>
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              className="list-item"
              style={{ display: 'block', width: '100%', textAlign: 'left', fontSize: '0.875rem' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
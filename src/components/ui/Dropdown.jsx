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
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 bg-[#0E1319] border border-[#2A3642] rounded-md text-gray-200 hover:text-white text-sm"
      >
        {label}
      </button>
      {open && (
        <div className="absolute mt-2 w-48 bg-[#111820] border border-[#2A3642] rounded-md shadow-lg z-10">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-[#1A242E] text-sm"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
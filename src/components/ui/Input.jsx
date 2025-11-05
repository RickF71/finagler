import React from "react";

export default function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="text-sm text-gray-400">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-[#0E1319] border border-[#2A3642] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B97A]"
      />
    </div>
  );
}
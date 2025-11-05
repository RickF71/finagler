import React from "react";

export default function Button({
  children,
  variant = "primary",
  disabled = false,
  onClick,
  className = "",
}) {
  const base =
    "px-4 py-2 rounded-md font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm";
  const variants = {
    primary:
      "bg-[#00B97A] text-black hover:bg-[#00D38C] focus:ring-[#00B97A] disabled:opacity-50",
    outline:
      "border border-[#2A3642] text-gray-200 hover:bg-[#1A242E] focus:ring-[#2A3642] disabled:opacity-50",
    danger:
      "bg-[#FF3B3B] text-white hover:bg-[#FF5C5C] focus:ring-[#FF3B3B] disabled:opacity-50",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
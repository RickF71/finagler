import React, { useEffect } from "react";

/**
 * Simple toast component for Finagler dark theme
 * @param {object} props
 * @param {string} props.message - text to display
 * @param {string} [props.variant="success"] - "success" | "error" | "info"
 * @param {function} props.onClose - close callback
 */
export default function Toast({ message, variant = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // auto-hide after 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  const colorMap = {
    success: "bg-[#00B97A] text-black",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
  };

  return (
    <div
      className={`fixed bottom-5 right-5 px-4 py-2 rounded-md shadow-lg text-sm font-medium ${colorMap[variant]} animate-fade-in`}
    >
      {message}
    </div>
  );
}

// src/views/NoneView.jsx
import React from "react";

export default function NoneView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none">
      <div className="text-lg font-semibold mb-2">No Domain Selected</div>
      <div className="text-sm opacity-75">
        Choose a domain from the selector above to begin.
      </div>
    </div>
  );
}

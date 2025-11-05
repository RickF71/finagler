import React from "react";

export function ScrollArea({ children, className = "" }) {
  return (
    <div
      className={`overflow-y-auto custom-scrollbar ${className}`}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#2A3642 transparent",
      }}
    >
      {children}
    </div>
  );
}
import React from "react";

export default function DisBorderProvider({ children }) {
  return (
    <>
      {/* The app itself */}
      <div style={{ position: "relative", zIndex: 0 }}>{children}</div>

      {/* The yellow overlay border */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: "5px solid orange",
          boxSizing: "border-box",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
    </>
  );
}

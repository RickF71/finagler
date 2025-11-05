import React from "react";

/**
 * Finagler UI Separator
 * A lightweight horizontal or vertical divider with consistent theming.
 * 
 * Props:
 * - orientation: "horizontal" | "vertical" (default: "horizontal")
 * - className: optional Tailwind overrides
 */

export default function Separator({ orientation = "horizontal", className = "" }) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`bg-[#2A3642] ${
        isVertical ? "w-px h-full mx-2" : "h-px w-full my-4"
      } ${className}`}
    />
  );
}

// src/components/FadeContainer.jsx
import React, { useEffect, useState } from "react";

export default function FadeContainer({ children }) {
  const [fadeClass, setFadeClass] = useState("opacity-0");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger fade-in once mounted
    setMounted(true);
    const timer = setTimeout(() => setFadeClass("opacity-100"), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex-1 min-h-0 h-full w-full transition-opacity duration-500 ease-in-out ${fadeClass}`}
      style={{
        opacity: mounted ? 1 : 0,
        display: "flex",        // ✅ ensure flex context passes through
        flexDirection: "column" // ✅ allows children like Editor to expand vertically
      }}
    >
      {children}
    </div>
  );
}

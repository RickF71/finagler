// src/app/AppFrame.jsx
import React, { useEffect, useState } from "react";
import { useDomain } from "../context/DomainContext";
import { useUI } from "../context/UIContext";
import DomainChooser from "../domain/DomainChooser";
import { CurrentView } from "./routes";

export default function AppFrame() {
  const { activeDomainId, domainInfo, loading } = useDomain();
  const { view } = useUI();

  const [fade, setFade] = useState("opacity-100 transition-opacity duration-700 ease-in-out");

  // Handle domain CSS injection and fade transitions
  useEffect(() => {
    if (!domainInfo) return;
    setFade("opacity-0 transition-opacity duration-500 ease-in-out");

    const timeout = setTimeout(() => {
      const css = domainInfo?.css || "";
      let styleTag = document.getElementById("domain-style");
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "domain-style";
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = css;
      setFade("opacity-100 transition-opacity duration-700 ease-in-out");
    }, 500);

    return () => clearTimeout(timeout);
  }, [domainInfo]);

  // Loading or chooser states
  if (!activeDomainId) return <DomainChooser />;
  if (loading) return <div className="pad-md text-muted">Loading domain…</div>;

  return (
    <div className={`relative bg-black ${fade}`}>
      <CurrentView view={view} />
    </div>
  );
}

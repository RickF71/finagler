// src/App.jsx
import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import Overview from "./views/Overview/Overview";
import Identities from "./views/Identities";
import NetworkGraph from "./views/NetworkGraph";
import TerraView from "./views/TerraView";
import OverlayViewer from "./components/OverlayViewer";
import ImportView from "./views/ImportView";
import BootstrapOverview from "./views/BootstrapOverview";
import BootstrapReconcileView from "./views/BootstrapReconcileView";
import ReconcileSchemas from "./views/ReconcileSchemas";
import ReconcileDomains from "./views/ReconcileDomains";
import DomainCSSEditor from "./views/DomainCSSEditor";
import DomainView from "./views/DomainView";
import DomainGraphView from "./components/DomainGraphView";
import DomainFileList from "./views/DomainFileList";
import DomainFileEditor from "./views/DomainFileEditor";
import { useDomain } from "./context/DomainContext";
import { useUI } from "./context/UIContext"; // new lightweight context for active view


export default function App() {
  const { domain, activeDomainId, loading, error } = useDomain();
  const { view, activeFile } = useUI();


  const [fadeClass, setFadeClass] = useState(
    "opacity-100 transition-opacity duration-700 ease-in-out"
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!domain) return;

    // Fade-out, update domain CSS/JSX while hidden, fade back in
    setIsTransitioning(true);
    setFadeClass("opacity-0 transition-opacity duration-500 ease-in-out");

    const fadeOutTime = 500;
    const timeout = setTimeout(() => {
      const css = domain?.data?.css || domain?.finagler?.css || "";
      const jsx = domain?.data?.jsx || domain?.finagler?.jsx || "";

      const oldStyle = document.getElementById("domain-style");
      if (oldStyle) oldStyle.remove();

      if (css && typeof css === "string") {
        const style = document.createElement("style");
        style.id = "domain-style";
        style.textContent = css;
        document.head.appendChild(style);
      }

      const oldJsx = document.getElementById("domain-jsx");
      if (oldJsx) oldJsx.remove();

      if (jsx && typeof jsx === "string") {
        const div = document.createElement("div");
        div.id = "domain-jsx";
        div.innerHTML = jsx;
        document.body.appendChild(div);
      }

      setTimeout(() => {
        setFadeClass("opacity-100 transition-opacity duration-700 ease-in-out");
        setIsTransitioning(false);
      }, 100);
    }, fadeOutTime);

    return () => clearTimeout(timeout);
  }, [domain]);

  if (loading) return <p>Loading domain...</p>;
  if (error) return <p>Error loading domain: {error.message}</p>;

  // Pause rendering while black
  if (isTransitioning) return <div className={`relative bg-black ${fadeClass}`} />;

  // --- View switcher (replaces all <Routes>) ---
  let CurrentView = null;
  switch (view) {
    case "overview":
      CurrentView = <Overview />;
      break;
    case "identities":
      CurrentView = <Identities />;
      break;
    case "network":
      CurrentView = <NetworkGraph />;
      break;
    case "terra":
      CurrentView = <TerraView />;
      break;
    case "world":
      CurrentView = <OverlayViewer region="world" />;
      break;
    case "usa":
      CurrentView = <OverlayViewer region="usa_states" />;
      break;
    case "domains":
      CurrentView = <DomainGraphView />;
      break;
    case "import":
      CurrentView = <ImportView />;
      break;
    case "bootstrap":
      CurrentView = <BootstrapOverview />;
      break;
    case "bootstrapReconcile":
      CurrentView = <BootstrapReconcileView />;
      break;
    case "reconcileSchemas":
      CurrentView = <ReconcileSchemas />;
      break;
    case "reconcileDomains":
      CurrentView = <ReconcileDomains />;
      break;
    case "domainView":
      CurrentView = <DomainView id={activeDomainId} />;
      break;
    case "domainCss":
      CurrentView = <DomainCSSEditor id={activeDomainId} />;
      break;
    case "files":
      CurrentView = <DomainFileList domainId={activeDomainId} />;
      break;
    case "editor":
      CurrentView = (
        <DomainFileEditor
          domainId={activeDomainId}
          filename={activeFile}
        />
      );
      break;
    default:
      CurrentView = <Overview />;
  }

  return (
    <div className={`relative bg-black ${fadeClass}`}>
      <Layout domainId={activeDomainId}>
        {CurrentView}
      </Layout>
    </div>
  );
}

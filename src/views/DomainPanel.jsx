// src/views/DomainPanel.jsx
import React from "react";
import { useUI } from "../context/UIContext";

// Core Views
import DomainView from "./DomainView";
import DomainFileList from "./DomainFileList";
import DomainFileEditor from "./DomainFileEditor";
import DomainCSSEditor from "./DomainCSSEditor";
import { useDomain } from "../context/DomainContext";

// Other Major Finagler Views
import Overview from "./Overview/Overview";
import Identities from ""
import ReconcileDomains from "./ReconcileDomains";
import BootstrapOverview from "./BootstrapOverview";
import BootstrapReconcileView from "./BootstrapReconcileView";
import ReconcileSchemas from "./ReconcileSchemas";
import NetworkGraph from "./NetworkGraph";
import TerraView from "./TerraView";
import ImportView from "./ImportView";
import DomainGraphView from "../components/DomainGraphView";
import AdminPanel from "../components/AdminPanel";
//import DomainSorter from "./DomainSorter";

// Optional overlays or domain-specific utilities could be added later

export default function DomainPanel() {

  const { view, activeFile } = useUI();

  const ui = useUI();


  switch (view) {
    // -----------------------------------------
    // CORE DASHBOARD VIEWS
    // -----------------------------------------
    case "overview":
      return <Overview />;

    case "identities":
      return <Identities />;

    case "reconcile":
      return <ReconcileDomains />;

    case "bootstrap":
      return <BootstrapOverview />;

    case "bootstrapreconcile":
      return <BootstrapReconcileView />;

    case "schemas":
      return <ReconcileSchemas />;

    case "network":
      return <NetworkGraph />;

    case "terra":
      return <TerraView />;

    case "import":
      return <ImportView />;

    case "domainsorter":
      return <DomainSorter />;

    // -----------------------------------------
    // DOMAIN CONTENT VIEWS
    // -----------------------------------------
    case "files":
      return <DomainFileList />;

    case "css-editor":
      return <DomainCSSEditor />;


    case "editor": {
      const { activeDomainId } = useDomain();
      if (activeFile) {
        return <DomainFileEditor domainId={activeDomainId} filename={activeFile} />;
      }
      return <DomainFileList />;
    }



    case "graph":
      return <DomainGraphView />;

    case "admin":
      return <AdminPanel userRole="root" authToken="admin-root-token" />;

    // -----------------------------------------
    // DEFAULT FALLBACK
    // -----------------------------------------
    default:
      console.log(`Unknown view: ${view}, falling back to DomainView`);
      return <DomainView />;
  }
}

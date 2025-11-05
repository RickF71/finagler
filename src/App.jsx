import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    fetch("http://localhost:8080/api/domain/dis/domain.user.rick")
      .then(res => res.json())
      .then(({ css, jsx }) => {
        // Inject CSS into the DOM
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);

        // Optionally render JSX content
        const div = document.createElement("div");
        div.innerHTML = jsx;
        document.body.appendChild(div);
      });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Layout wraps all subroutes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/overview" replace />} />

          {/* Domain + nested CSS Editor */}
          <Route path="domain/:id" element={<DomainView />}>
            <Route path="css" element={<DomainCSSEditor />} />
          </Route>

          <Route path="overview" element={<Overview />} />
          <Route path="identities" element={<Identities />} />
          <Route path="network" element={<NetworkGraph />} />
          <Route path="terra" element={<TerraView />} />
          <Route path="civic/world" element={<OverlayViewer region="world" />} />
          <Route path="domains" element={<DomainGraphView />} />
          <Route path="civic/world/usa" element={<OverlayViewer region="usa_states" />} />
          <Route path="import" element={<ImportView />} />
          <Route path="bootstrap" element={<BootstrapOverview />} />
          <Route path="bootstrap/:id" element={<BootstrapReconcileView />} /> 
          <Route path="reconcile/schemas" element={<ReconcileSchemas />} />
          <Route path="reconcile/domains" element={<ReconcileDomains />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


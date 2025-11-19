// src/views/DomainView.jsx
import React from "react";
import { useUI } from "../context/UIContext";
import DomainOverview from "./DomainOverview.jsx";
import DomainFileList from "./DomainFileList.jsx";
import DomainCSSEditor from "./DomainCSSEditor.jsx";
import DomainFileEditor from "./DomainFileEditor.jsx";
import RegoEditor from "./RegoEditor.jsx";
import DomainCreate from "./DomainCreate.jsx";

/**
 * DomainView Router
 * - Acts as a router for domain-related views
 * - Switches between DomainOverview, DomainFileList, DomainCSSEditor, DomainFileEditor, RegoEditor, and DomainCreate based on view state
 * - Logs current view for debugging
 */
export default function DomainView({ domain }) {
  const { view } = useUI();
  
  // Log the current view for debugging
  console.log("DomainView router - current view:", view);

  switch (view) {
    case "files":
      return <DomainFileList />;
    case "css-editor":
      return <DomainCSSEditor />;
    case "editor":
      return <DomainFileEditor />;
    case "rego":
      return <RegoEditor />;
    case "create-domain":
      return <DomainCreate parentDomain={domain} />;
    case "overview":
    default:
      return <DomainOverview />;
  }
}

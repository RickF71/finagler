import React from "react";
import OverlayViewer from "../components/OverlayViewer";

export default function TerraView() {
  return (
    <div className="pad-md">
      <h1 className="center pad-md" style={{ fontSize: '1.25rem', fontWeight: '600' }}>
        🌍 DIS Terra Overlay
      </h1>
      <OverlayViewer />
    </div>
  );
}

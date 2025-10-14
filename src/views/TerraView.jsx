import React from "react";
import OverlayViewer from "../components/OverlayViewer";

export default function TerraView() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4 text-center">
        🌍 DIS Terra Overlay
      </h1>
      <OverlayViewer />
    </div>
  );
}

// src/app/App.jsx
import React from "react";
import { FinaglerProvider } from "../context/FinaglerContext.jsx";
import { DomainProvider } from "../context/DomainContext.jsx";
import { DisCorePayloadProvider } from "../context/DisCorePayloadContext.jsx";
import { UIProvider } from "../context/UIContext.jsx";
import DisCorePayloadView from "../DisCorePayloadView.jsx"; // see next step

import "../base.css";

export default function App() {
  return (
    <FinaglerProvider>
      <DomainProvider>
        <DisCorePayloadProvider>
          <UIProvider>
            <DisCorePayloadView />
          </UIProvider>
        </DisCorePayloadProvider>
      </DomainProvider>
    </FinaglerProvider>
  );
}

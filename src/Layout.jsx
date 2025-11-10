// src/Layout.jsx
import React from "react";
import { useDomain } from "./context/DomainContext.jsx";
import FinaglerLayout from "./views/FinaglerLayout.jsx";
import DomainLayout from "./views/DomainLayout.jsx";

export default function Layout() {
  const { activeDomainId, NONE_DOMAIN_ID } = useDomain();
  const inFinaglerMode = activeDomainId === NONE_DOMAIN_ID;

  return inFinaglerMode ? <FinaglerLayout /> : <DomainLayout />;
}

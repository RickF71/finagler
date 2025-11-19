// src/components/DisPowerRing.jsx
import React from "react";
import "./DisPowerRing.css";
import { useDisStatus } from "../hooks/useDisStatus";

export default function DisPowerRing() {
  const online = useDisStatus();
  const color = online ? "ring-online" : "ring-offline";
  const label = online ? "Connected to DIS-Core" : "Offline";

  return <div className={`dis-power-ring ${color}`} title={label}></div>;
}

// src/components/SuperBar.jsx
import React, { useEffect } from "react";
import { useDisStatus } from "../hooks/useDisStatus.js";
import { useActiveUser } from "../context/ActiveUserContext.jsx";
import { useDomain } from "../context/DomainContext.jsx";
import finaglerIcon from "../assets/finagler-icon.png";

export default function SuperBar() {
  const serverOnline = useDisStatus(); // dis-core responds to ping
  const { activeUser } = useActiveUser();
  const { domain, activeDomainId } = useDomain();

  // DIS network connection = authenticated AND bound to corporeal domain
  const disConnected = activeUser?.authenticated && activeUser?.bound;

  // Status indicator: green (DIS connected), yellow (ping only), gray (offline)
  const statusColor = disConnected 
    ? 'bg-green-500' 
    : serverOnline 
      ? 'bg-yellow-500' 
      : 'bg-gray-500';
  
  const statusText = disConnected 
    ? 'connected' 
    : serverOnline 
      ? 'ping only' 
      : 'offline';

  const statusTitle = disConnected
    ? 'Connected to DIS network'
    : serverOnline
      ? 'Server online, not bound to corporeal domain'
      : 'Server offline';

  // Build domain ancestry path for breadcrumb display
  const ancestry = domain?.ancestry || [];
  const displayPath = ancestry.length > 0
    ? ancestry.map(d => d.name || d.id).join(" › ")
    : (domain?.name || activeDomainId);

  return (
    <header className="fixed top-0 left-0 right-0 flex items-center justify-between w-full px-4 bg-slate-900 border-b border-slate-800 z-[1000]" style={{ height: 'var(--superbar-height)' }}>
      {/* Left: Logo + Status */}
      <div className="flex items-center gap-3">
        <img src={finaglerIcon} alt="Finagler" className="h-5 w-auto" />
        <span className="text-sm font-semibold text-slate-200">
          Finagler
        </span>
        <div className="flex items-center gap-1">
          <div 
            className={`w-2 h-2 rounded-full ${statusColor}`}
            title={statusTitle}
          />
          <span className="text-xs text-slate-400">
            {statusText}
          </span>
        </div>
      </div>

      {/* Center: Domain Path / Breadcrumb */}
      <div className="flex-grow text-center">
        <span className="text-sm font-mono text-amber-400">
          {displayPath}
        </span>
      </div>

      {/* Right: Reserved for auth request indicator */}
      <div className="flex items-center gap-2">
        {/* TODO: Add auth request count/icon here when implemented */}
      </div>
    </header>
  );
}

import React from "react";
import { useUI } from "../context/UIContext";
import { useDomain } from "../context/DomainContext";
import { Loader2 } from "lucide-react";
import finaglerIcon from "../assets/finagler-icon.png";

export default function Sidebar() {
  const { setView, view } = useUI();
  const {
    activeDomainId,
    domain,
    loading: domainLoading,
    error: domainError,
    NONE_DOMAIN_ID,
    setActiveDomainId,
  } = useDomain();

  // Hide sidebar entirely when no domain is active
  if (!activeDomainId || activeDomainId === NONE_DOMAIN_ID) {
    return null;
  }

  const menuItems = [
    { label: "Overview", view: "overview" },
    { label: "CSS Editor", view: "css-editor" },
    { label: "Files", view: "files" },
    { label: "Identities", view: "identities" },
    { label: "Network Graph", view: "network" },
    { label: "Admin Panel", view: "admin" },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-100 flex flex-col border-r border-slate-800 transition-all duration-300">
      {/* Finagler Logo + Spinner */}
      <div className="flex items-center justify-center p-4 border-b border-slate-800 relative">
        <img
          src={finaglerIcon}
          alt="Finagler"
          className="w-full h-auto object-contain drop-shadow-[0_0_15px_rgba(16,255,128,0.3)]"
        />
        {domainLoading && (
          <Loader2
            className="absolute bottom-2 right-2 text-emerald-400 animate-spin"
            size={16}
          />
        )}
      </div>

      {/* Domain Name under graphic */}
      <div className="px-4 py-2 border-b border-slate-800 text-center">
        {domainError ? (
          <span className="text-red-400 text-sm">{domainError}</span>
        ) : (
          <>
            <h2 className="text-amber-400 font-semibold text-sm">
              {domain?.name || activeDomainId || "Unknown Domain"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Active Domain</p>
          </>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto">
        {menuItems.map(({ label, view: v }) => (
          <div
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 cursor-pointer transition-all duration-150 ${
              view === v
                ? "bg-slate-800 text-emerald-400"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            {label}
          </div>
        ))}
      </nav>

      {/* Return to Domain Chooser */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => setActiveDomainId(NONE_DOMAIN_ID)}
          className="w-full px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          Return to Domain Chooser
        </button>
      </div>
    </aside>
  );
}

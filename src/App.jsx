import React, { useState } from "react";
import NodeStatus from "./components/NodeStatus";
import "./index.css";
import IdentityList from "./components/IdentityList";

function Sidebar({ current, setCurrent }) {
  const items = [
    { key: "node", label: "Node Overview", icon: "🧩" },
    { key: "ids", label: "Identities", icon: "👤" },
  ];
  return (
    <aside className="w-56 bg-slate-950 border-r border-slate-800 min-h-screen">
      <div className="p-4 text-lg font-semibold text-blue-400">Finagler</div>
      <nav className="px-2 space-y-1">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => setCurrent(it.key)}
            className={`w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 ${
              current === it.key ? "bg-slate-800" : ""
            }`}
          >
            {it.icon} {it.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}


function Topbar() {
  return (
    <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 text-sm text-gray-300">
      <div>DIS-DOMAIN-CONSOLE • API: {import.meta.env.VITE_API_BASE}</div>
      <span className="text-xs text-gray-500">v0.1</span>
    </header>
  );
}

export default function App() {
  const [current, setCurrent] = useState("node");

  return (
    <div className="flex bg-slate-900 text-gray-100 min-h-screen">
      <Sidebar current={current} setCurrent={setCurrent} />
      <main className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-4 flex-1 overflow-auto">
          {current === "node" && <NodeStatus />}
          {current === "ids" && <IdentityList />}
        </div>
      </main>
    </div>
  );
}

import React from 'react';

export default function Overview() {
  return (
    <div className="p-8 text-slate-200">
      <h1 className="text-3xl font-light mb-4 text-[#7FC692]">
        Node Overview
      </h1>

      <p className="text-slate-400 mb-6 max-w-2xl leading-relaxed">
        Welcome to the Finagler Console.
        <br />
        The system is active, self-aware, and ready to synchronize with your domains.
      </p>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 rounded-xl border border-slate-700 bg-[#0B0F14] shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-lg font-semibold text-[#3B82F6] mb-2">System Status</h2>
          <p className="text-slate-400">All nodes are online and synchronized.</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-700 bg-[#0B0F14] shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-lg font-semibold text-[#00B97A] mb-2">Identity Anchor</h2>
          <p className="text-slate-400">Primary identity binding verified.</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-700 bg-[#0B0F14] shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-lg font-semibold text-[#E9A6A6] mb-2">Consent Gate</h2>
          <p className="text-slate-400">Awaiting handshake confirmation.</p>
        </div>
      </div>
    </div>
  );
}

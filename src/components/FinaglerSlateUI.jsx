import React from "react";

export default function FinaglerSlateUI() {
  return (
    <div className="flex min-h-screen bg-finagler-neutralDark text-finagler-neutralLight">
      {/* Sidebar */}
      <aside className="w-64 bg-finagler-slate-dark flex flex-col justify-between p-4">
        <div>
          <div className="text-2xl font-semibold text-finagler-emerald mb-6 tracking-wide">
            Finagler Console
          </div>
          <nav className="space-y-2">
            {["Node Overview", "Identities", "Network", "Settings"].map(
              (item, idx) => (
                <button
                  key={idx}
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-finagler-slate hover:text-finagler-harmony transition"
                >
                  {item}
                </button>
              )
            )}
          </nav>
        </div>

        <div className="mt-6">
          <button className="bg-finagler-cobalt hover:bg-finagler-cobaltDeep text-white w-full py-2 rounded-lg transition">
            + Create Identity
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gradient-to-br from-[#0A0F12] via-[#122124] via-40% to-[#1D3C2F] text-finagler-neutralLight">

  <h1 className="text-4xl font-semibold text-finagler-mint drop-shadow-md mb-4">
    Node Overview
  </h1>

  <p className="text-[#DDE8E6] mb-6 max-w-xl leading-relaxed">
    Welcome to your DIS node management interface. Finagler connects your
    core processes, identities, and network topology through a unified,
    consent-based interface.
  </p>

  <div className="grid grid-cols-3 gap-6">
    <div className="bg-[#10191E] p-4 rounded-xl shadow-lg hover:shadow-xl transition">
      <h2 className="text-lg font-semibold text-finagler-emerald">
        Node Health
      </h2>
      <p className="text-[#EEF9F7] mt-2">✅ Operational</p>
    </div>

    <div className="bg-[#10191E] p-4 rounded-xl shadow-lg hover:shadow-xl transition">
      <h2 className="text-lg font-semibold text-finagler-cobalt">
        Connections
      </h2>
      <p className="text-[#EEF5FA] mt-2">4 Active Peers</p>
    </div>

    <div className="bg-[#10191E] p-4 rounded-xl shadow-lg hover:shadow-xl transition">
      <h2 className="text-lg font-semibold text-finagler-harmony">
        Consent Ledger
      </h2>
      <p className="text-[#FCEBEC] mt-2">23 Valid Entries</p>
    </div>
  </div>
</main>

    </div>
  );
}

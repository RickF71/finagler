import React, { useState } from "react"
import { postImportYAML, listImports } from "../lib/api/import.js"

export default function ImportView() {
  const [yamlText, setYamlText] = useState("")
  const [filename, setFilename] = useState("domain.test.yaml")
  const [category, setCategory] = useState("domain")
  const [status, setStatus] = useState("")
  const [recent, setRecent] = useState([])

  async function handleImport() {
    try {
      const data = await postImportYAML({ filename, category, content: yamlText })
      setStatus(`✅ Imported: ${data.receipt.target}`)
      const list = await listImports()
      setRecent(list.imports || [])
    } catch (err) {
      setStatus(`❌ ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e1116] text-gray-100 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-emerald-400 tracking-tight">
          YAML Importer
        </h2>
        <p className="text-gray-400 text-sm">
          Paste or upload YAML configuration files directly into DIS-Core. Each
          import generates a signed ledger receipt.
        </p>

        {/* Input Row */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            value={filename}
            onChange={e => setFilename(e.target.value)}
            placeholder="filename.yaml"
            className="bg-[#1a1d23] border border-[#2a2e37] text-gray-100 placeholder-gray-500 
                       px-3 py-2 rounded-lg w-1/2 focus:outline-none 
                       focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-[#1a1d23] border border-[#2a2e37] text-gray-100 px-3 py-2 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option>domain</option>
            <option>schema</option>
            <option>policy</option>
            <option>overlay</option>
          </select>
          <button
            onClick={handleImport}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 
                       rounded-lg font-medium transition-all shadow-md 
                       hover:shadow-emerald-500/20 focus:ring-2 focus:ring-emerald-500"
          >
            Import YAML
          </button>
        </div>

        {/* YAML Editor */}
        <div>
          <textarea
            value={yamlText}
            onChange={e => setYamlText(e.target.value)}
            placeholder="Paste YAML here..."
            className="w-full h-56 bg-[#1a1d23] border border-[#2a2e37] text-gray-100 
                       font-mono p-3 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-emerald-500 resize-y placeholder-gray-500"
          />
        </div>

        {/* Status Message */}
        <div
          className={`text-sm ${
            status.startsWith("✅")
              ? "text-emerald-400"
              : status.startsWith("❌")
              ? "text-rose-400"
              : "text-gray-500"
          }`}
        >
          {status}
        </div>

        {/* Recent Imports */}
        {recent.length > 0 && (
          <div className="bg-[#14171c] border border-[#23272f] p-4 rounded-lg mt-6 shadow-inner">
            <h3 className="font-semibold mb-2 text-emerald-400">
              Recent Imports
            </h3>
            <ul className="space-y-1 text-sm">
              {recent.map(r => (
                <li key={r.id} className="text-gray-300">
                  🪣{" "}
                  <span className="text-gray-100 font-medium">{r.target}</span> —{" "}
                  {r.summary}
                  <span className="text-gray-500">
                    {" "}
                    ({new Date(r.timestamp).toLocaleTimeString()})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

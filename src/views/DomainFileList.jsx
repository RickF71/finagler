// src/views/DomainFileList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useDomain } from "../context/DomainContext";
import { useUI } from "../context/UIContext";
import DomainSingleFile from "../components/DomainSingleFile";
import { createDISInterface } from "../dis/interface.js";

export default function DomainFileList({ domainId }) {
  const { activeDomainId, API_BASE } = useDomain();
  const domain = domainId || activeDomainId;

  const { view, setView, activeFile, setActiveFile } = useUI();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  
  // Initialize DIS interface
  const dis = createDISInterface(API_BASE);

  // -------------------------------------------------------
  // Load files
  // -------------------------------------------------------
  const loadFiles = useCallback(async () => {
    if (!domain) return;
    setLoading(true);
    try {
      const json = await dis.listFiles(domain);

      if (Array.isArray(json.files)) {
        setFiles(json.files);
      } else if (json && typeof json === "object") {
        setFiles(Object.keys(json));
      } else {
        setFiles([]);
      }

      setStatus("");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    loadFiles();
  }, [domain, loadFiles]);

  // -------------------------------------------------------
  // Create new file instantly and open in editor
  // -------------------------------------------------------
  const handleCreateFile = useCallback(async () => {
    if (!domain) return;

    try {
      let base = "Untitled";
      let counter = 1;
      let filename = `${base}.md`;
      while (files.includes(filename)) {
        filename = `${base} ${counter}.md`;
        counter++;
      }

      await dis.saveFile(domain, filename, "");

      // reload list and open editor for the new file
      await loadFiles();
      setActiveFile(filename);
      setView("editor");
    } catch (err) {
      setStatus(`Error creating file: ${err.message}`);
    }
  }, [domain, files, loadFiles, setActiveFile, setView, dis]);

  // -------------------------------------------------------
  // Always clear stale activeFile when in list view
  // -------------------------------------------------------
  useEffect(() => {
    if (view === "files" && activeFile) {
      setActiveFile(null);
    }
  }, [view]);

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <div className="flex flex-col h-full bg-slate-900/80 rounded-2xl border border-slate-700 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-amber-300">
          Files in {domain}
        </h2>
        <button
          onClick={handleCreateFile}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-slate-900 text-sm font-medium shadow-md"
        >
          + New File
        </button>
      </div>

      {/* File Grid */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="text-slate-400 text-sm">Loading...</div>
        ) : status ? (
          <div className="text-red-400 text-sm">{status}</div>
        ) : files.length === 0 ? (
          <div className="text-slate-500 text-sm italic">
            No files found in this domain.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((f) => (
              <DomainSingleFile
                key={f}
                domainId={domain}
                filename={f}
                onDeleted={loadFiles}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

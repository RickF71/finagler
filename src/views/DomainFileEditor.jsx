// src/views/DomainFileEditor.jsx
import React, { useState, useEffect } from "react";
import { useUI } from "../context/UIContext";
import { toast } from "react-hot-toast";
import { createDISInterface } from "../dis/interface.js";
import { useDomain } from "../context/DomainContext.jsx";

export default function DomainFileEditor({ domainId, filename: initialFilename }) {
  const { setView, setActiveFile } = useUI();
  const { API_BASE } = useDomain();

  const [filename, setFilename] = useState(initialFilename);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(initialFilename);
  
  // Initialize DIS interface
  const dis = createDISInterface(API_BASE);

  // -------------------------------------------------------
  // Load file contents
  // -------------------------------------------------------
  useEffect(() => {
    if (!domainId || !filename) return;
    setLoading(true);
    dis.getFile(domainId, filename)
      .then((t) => setContent(t))
      .catch((err) => toast.error(`Load failed: ${err.message}`))
      .finally(() => setLoading(false));
  }, [domainId, filename, dis]);

  // -------------------------------------------------------
  // Save handler
  // -------------------------------------------------------
  async function handleSave() {
    if (!domainId || !filename) return;
    try {
      setSaving(true);
      await dis.saveFile(domainId, filename, content);
      toast.success(`${filename} saved`);
      setActiveFile(null);
      setView("files");
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  // -------------------------------------------------------
  // Rename handler (implemented as copy + delete)
  // -------------------------------------------------------
  async function handleRename() {
    if (newName === filename || !newName.trim()) {
      setRenaming(false);
      return;
    }

    try {
      setRenaming(true);
      // First save content to new filename
      await dis.saveFile(domainId, newName, content);
      // Then delete old file
      await dis.deleteFile(domainId, filename);

      toast.success(`Renamed to ${newName}`);
      setFilename(newName);
      setActiveFile(newName);
    } catch (err) {
      toast.error(`Rename failed: ${err.message}`);
      setNewName(filename);
    } finally {
      setRenaming(false);
    }
  }

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <div className="flex flex-col h-full bg-slate-900/80 rounded-2xl border border-slate-700 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-950/70 rounded-t-2xl">
        <div className="flex items-center gap-3">
          {renaming ? (
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              className="bg-transparent border-b border-amber-400 outline-none text-lg px-1 text-amber-300 font-semibold"
            />
          ) : (
            <h2
              onClick={() => setRenaming(true)}
              className="cursor-pointer text-lg font-semibold text-amber-300 hover:text-amber-400 transition"
              title="Click to rename"
            >
              {filename}
            </h2>
          )}
          <span className="text-xs text-slate-400">
            Domain: {domainId}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveFile(null);
              setView("files");
            }}
            className="px-3 py-1 text-sm rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1 text-sm rounded bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium shadow-md disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          <div className="text-slate-400 text-sm">Loading...</div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full bg-slate-900 text-slate-100 rounded-lg border border-slate-700 p-3 font-mono text-sm focus:border-amber-400 focus:outline-none"
          />
        )}
      </div>
    </div>
  );
}

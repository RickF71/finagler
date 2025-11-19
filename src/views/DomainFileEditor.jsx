// src/views/DomainFileEditor.jsx
import React, { useState, useEffect } from "react";
import { useUI } from "../context/UIContext";
import { toast } from "react-hot-toast";
import { createDISInterface } from "../dis/interface.js";
import { useDomain } from "../context/DomainContext.jsx";

export default function DomainFileEditor() {
  const { setView, activeFile, setActiveFile } = useUI();
  const { activeDomainId, API_BASE } = useDomain();

  const [filename, setFilename] = useState(activeFile || "");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(activeFile || "");
  
  // Initialize DIS interface
  const dis = createDISInterface(API_BASE);
  
  // Use activeDomainId from context
  const domainId = activeDomainId;
  
  // Update filename when activeFile changes
  useEffect(() => {
    if (activeFile) {
      setFilename(activeFile);
      setNewName(activeFile);
    }
  }, [activeFile]);

  // -------------------------------------------------------
  // Load file contents
  // -------------------------------------------------------
  useEffect(() => {
    if (!domainId || !filename) return;
    setLoading(true);
    dis.file.getFile(domainId, filename)
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
      await dis.file.saveFile(domainId, filename, content);
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
      await dis.file.saveFile(domainId, newName, content);
      // Then delete old file
      await dis.file.deleteFile(domainId, filename);

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
    <div className="panel column h-full" style={{ borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
      {/* Header */}
      <div className="toolbar" style={{ padding: '12px 16px', borderRadius: '16px 16px 0 0' }}>
        <div className="flex center gap-sm">
          {renaming ? (
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              className="field text-lg font-bold text-accent"
              style={{ background: 'transparent', borderBottom: '1px solid var(--accent)', outline: 'none', padding: '4px' }}
            />
          ) : (
            <h2
              onClick={() => setRenaming(true)}
              className="text-lg font-bold text-accent"
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              title="Click to rename"
            >
              {filename}
            </h2>
          )}
          <span className="text-sm text-muted">
            Domain: {domainId}
          </span>
        </div>

        <div className="flex gap-sm">
          <button
            onClick={() => {
              setActiveFile(null);
              setView("files");
            }}
            className="button text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="button text-sm font-bold"
            style={{ 
              backgroundColor: '#f59e0b',
              color: 'black',
              ...(saving ? { opacity: '0.6' } : {})
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="pad-md" style={{ flex: '1', overflow: 'auto' }}>
        {loading ? (
          <div className="text-muted text-sm">Loading...</div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="field"
            style={{ 
              width: '100%', 
              height: '100%', 
              fontFamily: 'monospace', 
              fontSize: '0.875rem',
              resize: 'none'
            }}
          />
        )}
      </div>
    </div>
  );
}

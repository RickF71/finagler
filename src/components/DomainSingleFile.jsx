// src/views/DomainSingleFile.jsx
import React, { useEffect, useState } from "react";
import { useUI } from "../context/UIContext";
import { Trash2, Edit3, FilePlus2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { createDISInterface } from "../dis/interface.js";
import { useDomain } from "../context/DomainContext.jsx";

export default function DomainSingleFile({ domainId, filename, autoOpen, onDeleted }) {
  const { setView, setActiveFile } = useUI();
  const { API_BASE } = useDomain();
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteHover, setDeleteHover] = useState(false);
  const [editHover, setEditHover] = useState(false);
  const [fileHover, setFileHover] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Initialize DIS interface
  const dis = createDISInterface(API_BASE);

  // --------------------------------------------------
  // Empty / Not Found handling
  // --------------------------------------------------
  if (!filename || filename === "Not Found") {
    return (
      <div className="flex flex-col items-center justify-center p-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
        <p className="mb-3 text-lg text-slate-200">
          No files found in this domain.
        </p>
        <button
          onClick={async () => {
            const name = prompt("Enter a new file name (e.g. readme.md)");
            if (!name) return;

            try {
              await dis.saveFile(domainId, name, "");

              toast.success("New file created!");
              setActiveFile(name);
              setView("editor");
            } catch (err) {
              toast.error(`Create failed: ${err.message}`);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg font-semibold transition"
        >
          <FilePlus2 size={18} /> Create New File
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // Preview fetch
  // --------------------------------------------------
  useEffect(() => {
    if (!domainId || !filename) return;
    setLoading(true);
    dis.getFile(domainId, filename)
      .then((t) => setPreview(t.length > 200 ? t.slice(0, 200) + "…" : t))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [domainId, filename, dis]);

  // --------------------------------------------------
  // Delete handler
  // --------------------------------------------------
  async function handleDeleteConfirm() {
    try {
      await dis.deleteFile(domainId, filename);

      toast.success(`${filename} deleted`);
      setConfirmDelete(false);

      if (typeof onDeleted === "function") onDeleted();
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
      setConfirmDelete(false);
    }
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  const borderColor = deleteHover
    ? "border-red-500"
    : editHover
    ? "border-amber-400"
    : "border-slate-700";

  return (
    <div
      onMouseEnter={() => setFileHover(true)}
      onMouseLeave={() => setFileHover(false)}
      className={`relative rounded-xl p-4 transition-all duration-300 overflow-hidden bg-slate-800 border ${borderColor} ${
        fileHover && !editHover && !deleteHover
          ? "shadow-[0_0_12px_rgba(255,255,255,0.08)]"
          : ""
      }`}
    >
      {/* Subtle glow background on hover */}
      <div
        className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200 ${
          deleteHover
            ? "opacity-30 bg-red-600/40"
            : editHover
            ? "opacity-25 bg-amber-400/30 shadow-[0_0_20px_rgba(255,191,0,0.3)]"
            : "opacity-0"
        }`}
      ></div>

      {/* Hash overlay on delete hover */}
      {deleteHover && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none z-10 transition-opacity duration-200"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,0,0,0.35) 0, rgba(255,0,0,0.35) 2px, transparent 2px, transparent 6px)",
          }}
        />
      )}

      {/* Tabs bar */}
      <div className="absolute top-0 left-0 right-0 h-7 flex justify-between items-center px-3 z-20">
        {/* Edit tab */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveFile(filename);
            setView("editor");
          }}
          onMouseEnter={() => setEditHover(true)}
          onMouseLeave={() => setEditHover(false)}
          title="Edit file"
          className={`relative flex items-center justify-center 
                      px-3 py-[5px] ml-[5px] rounded-b-md border border-b-0
                      transition-all duration-150
                      ${
                        editHover
                          ? "text-slate-900 border-amber-400 shadow-[0_0_10px_rgba(255,191,0,0.8)]"
                          : "bg-slate-900 text-slate-400 border-slate-700 hover:text-amber-400"
                      }`}
          style={{ top: "-6px" }}
        >
          <div
            className={`absolute inset-0 rounded-b-md transition-colors duration-150 ${
              editHover ? "bg-amber-400" : "bg-slate-900"
            }`}
          />
          <Edit3 size={18} strokeWidth={2} className="relative z-10" />
        </button>

        {/* Trash tab */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setConfirmDelete(true);
          }}
          onMouseEnter={() => setDeleteHover(true)}
          onMouseLeave={() => setDeleteHover(false)}
          title="Delete file"
          className={`relative flex items-center justify-center 
                      px-3 py-[5px] mr-[5px] rounded-b-md border border-b-0
                      transition-all duration-150
                      ${
                        deleteHover
                          ? "text-white border-red-500 shadow-[0_0_10px_rgba(255,0,0,0.8)]"
                          : "bg-slate-900 text-slate-400 border-slate-700 hover:text-amber-400"
                      }`}
          style={{ top: "-6px" }}
        >
          <div
            className={`absolute inset-0 rounded-b-md transition-colors duration-150 ${
              deleteHover ? "bg-red-600" : "bg-slate-900"
            }`}
          />
          <Trash2 size={18} strokeWidth={2} className="relative z-10" />
        </button>
      </div>

      {/* File body */}
      <div className="relative z-20 mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-100 font-semibold text-sm truncate">
            {filename}
          </span>
        </div>

        {loading ? (
          <div className="text-slate-400 text-sm">Loading…</div>
        ) : error ? (
          <div className="text-red-400 text-xs">{error}</div>
        ) : (
          <div className="text-slate-300 text-xs whitespace-pre-wrap max-h-24 overflow-y-auto border-t border-slate-700 pt-1">
            {preview || "— empty file —"}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-slate-800 p-6 rounded-xl border border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.3)] w-80">
            <h3 className="text-lg font-semibold text-red-400 mb-3">
              Delete {filename}?
            </h3>
            <p className="text-slate-300 text-sm mb-5">
              This action <span className="text-red-400 font-semibold">cannot</span> be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1 text-sm rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

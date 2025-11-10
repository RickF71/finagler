import React, { useEffect, useState, useRef, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { useDomain } from "../context/DomainContext";
import { useUI } from "../context/UIContext";
import FadeContainer from "../components/FadeContainer";
import { toast } from "react-hot-toast";
import { createDISInterface } from "../dis/interface.js";

export default function DomainCSSEditor() {
  const { activeDomainId, API_BASE } = useDomain();
  const { setView } = useUI();

  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);

  // ⚙️ create the dis interface once per API_BASE (not every render)
  const dis = useMemo(() => createDISInterface(API_BASE), [API_BASE]);

  // ----------------------------------------------------
  // Load CSS once per domain change
  // ----------------------------------------------------
  useEffect(() => {
    if (!activeDomainId || activeDomainId === "none") return;
    setLoading(true);
    setStatus("Loading…");

    dis.domain
      .getDomainCSS(activeDomainId)
      .then((cssText) => {
        const css = cssText?.trim() || "/* No CSS defined for this domain */\n";
        setValue(css);
        setStatus("");
      })
      .catch((err) => setStatus(`❌ Error: ${err.message}`))
      .finally(() => setLoading(false));
  }, [activeDomainId, dis]);

  // ----------------------------------------------------
  // Ensure Monaco layout only when visible
  // ----------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      if (editorRef.current) editorRef.current.layout();
    }, 300);
    return () => clearTimeout(timer);
  }, [loading]);

  // ----------------------------------------------------
  // Save CSS back to domain
  // ----------------------------------------------------
  const handleSave = async () => {
    try {
      await dis.domain.saveDomainCSS(activeDomainId, value);
      toast.success("CSS Saved!");
      setStatus("✅ Saved");

      // Apply live immediately (override existing)
      let style = document.getElementById("domain-style");
      if (!style) {
        style = document.createElement("style");
        style.id = "domain-style";
        document.head.appendChild(style);
      }
      style.textContent = value;

      // Return to overview after short delay
      setTimeout(() => setView("overview"), 350);
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
      setStatus(`❌ Save failed: ${err.message}`);
    }
  };

  const handleCancel = () => setView("overview");

  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------
  return (
    <FadeContainer>
      <div className="flex flex-col h-full bg-slate-900/80 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="text-sm text-amber-400 hover:text-amber-300"
              title="Back to Overview"
            >
              ←
            </button>
            <div>
              <h2 className="text-lg font-semibold text-amber-300">
                Domain CSS
              </h2>
              <p className="text-xs text-slate-400">Domain: {activeDomainId}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0 relative">
          {loading ? (
            <div className="p-4 text-slate-400 text-sm">Loading CSS…</div>
          ) : (
            <div className="absolute inset-0">
              <Editor
                onMount={(editor) => (editorRef.current = editor)}
                className="w-full h-full"
                language="css"
                theme="vs-dark"
                value={value}
                onChange={(val) => setValue(val || "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  automaticLayout: true,
                  folding: true,
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 text-xs text-slate-400 border-t border-slate-700 shrink-0 text-center">
          {status || "Ready"}
        </div>
      </div>
    </FadeContainer>
  );
}

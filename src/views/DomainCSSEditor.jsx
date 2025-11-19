import React, { useEffect, useState, useRef, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { useDomain } from "../context/DomainContext";
import { useUI } from "../context/UIContext";
import FadeContainer from "../components/FadeContainer";
import { toast } from "react-hot-toast";
import { createDISInterface } from "../dis/interface.js";
import useDomainCSSEditor from "../hooks/useDomainCSSEditor.js";
import useCSSPreview from "../hooks/useCSSPreview.js";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/Tabs";
import DomainCSSVariables from "../components/DomainCSSVariables";

const StatusIndicator = ({ status, verificationHash }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return { color: 'text-green-600', icon: '✅', label: 'Verified' };
      case 'modified':
        return { color: 'text-yellow-600', icon: '⚠️', label: 'Modified (Unsaved)' };
      case 'invalid':
        return { color: 'text-red-600', icon: '❌', label: 'Invalid' };
      default:
        return { color: 'text-gray-500', icon: '⚪', label: 'Ready' };
    }
  };

  const { color, icon, label } = getStatusConfig();

  return (
    <div className={`flex items-center space-x-2 ${color}`}>
      <span>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      {verificationHash && (
        <span className="text-xs text-gray-500 font-mono">
          Hash: {verificationHash.substring(0, 8)}...
        </span>
      )}
    </div>
  );
};

const ModeToggle = ({ mode, setMode }) => (
  <div className="flex rounded-md bg-gray-100 p-1">
    <button
      onClick={() => setMode('text')}
      className={`px-3 py-1 text-sm rounded transition-colors ${
        mode === 'text'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      Text Mode
    </button>
    <button
      onClick={() => setMode('json')}
      className={`px-3 py-1 text-sm rounded transition-colors ${
        mode === 'json'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      JSON Mode
    </button>
  </div>
);

export default function DomainCSSEditor() {
  const { activeDomainId, API_BASE, reloadDomain } = useDomain();
  const { setView } = useUI();
  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const [activeTab, setActiveTab] = useState("editor");

  const {
    css,
    cssData,
    loading,
    saving,
    verifying,
    error,
    status,
    verificationHash,
    mode,
    setMode,
    updateCSS,
    saveCSS,
    verifyCSS,
    reloadCSS
  } = useDomainCSSEditor();

  const { isUpdating, applyToElement } = useCSSPreview(css);

  // Apply preview styles
  useEffect(() => {
    if (previewRef.current) {
      applyToElement(previewRef.current);
    }
  }, [css, applyToElement]);

  // Ensure Monaco layout only when visible
  useEffect(() => {
    const timer = setTimeout(() => {
      if (editorRef.current) editorRef.current.layout();
    }, 300);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleSave = async () => {
    const success = await saveCSS();
    if (success) {
      toast.success("CSS Saved!");
      
      // Remove preview style tag - let useDomainCSS hook handle the real CSS
      const previewStyle = document.getElementById("domain-style-preview");
      if (previewStyle) {
        previewStyle.remove();
        console.log("🔧 Removed preview style tag");
      }

      // Reload domain to update payload.css in memory (Phase 10J.4)
      // This will trigger useDomainCSS to refresh the CSS link
      reloadDomain();

      // Return to overview after short delay
      setTimeout(() => setView("overview"), 350);
    }
  };

  const handleVerify = async () => {
    const result = await verifyCSS();
    if (result) {
      toast.success(`CSS verified! Hash: ${result.hash.substring(0, 8)}...`);
    }
  };

  const handleCancel = () => setView("overview");

  const editorValue = mode === 'json' ? JSON.stringify(cssData, null, 2) : css;
  const editorLanguage = mode === 'json' ? 'json' : 'css';

  return (
    <FadeContainer>
      <div className="panel column h-full" style={{ borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
        {/* Header */}
        <div className="toolbar" style={{ padding: '16px', flexShrink: 0 }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="text-sm"
                style={{ color: '#fbbf24' }}
                title="Back to Overview"
              >
                ←
              </button>
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#fcd34d' }}>
                  Domain CSS Editor
                </h2>
                <p className="text-sm text-muted">Domain: {activeDomainId}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <StatusIndicator status={status} verificationHash={verificationHash} />
              <ModeToggle mode={mode} setMode={setMode} />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="editor">
                  📝 Editor
                </TabsTrigger>
                <TabsTrigger value="variables">
                  🎨 Variables
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Toolbar buttons */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="button"
                style={{ fontSize: '0.875rem', fontWeight: '500' }}
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={verifying || loading}
                className="button"
                style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  backgroundColor: '#3b82f6',
                  color: 'white'
                }}
              >
                {verifying ? '⏳ Verifying...' : '🔍 Verify'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="button"
                style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  backgroundColor: '#f59e0b',
                  color: 'black'
                }}
              >
                {saving ? '⏳ Saving...' : '💾 Save'}
              </button>
            </div>

            <button
              onClick={reloadCSS}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-gray-700"
              title="Reload CSS"
            >
              🔄 Reload
            </button>
          </div>

          {/* Error display */}
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Main content area - tab-based */}
        <div className="flex-1 flex min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Editor Tab */}
            <TabsContent value="editor">
              <div className="flex h-full min-h-0">
                {/* Editor pane */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="p-2 bg-gray-50 border-b text-sm font-medium text-gray-700">
                    Editor {isUpdating && <span className="text-yellow-600">⏳ Updating preview...</span>}
                  </div>
                  <div style={{ flex: '1', minHeight: '0', position: 'relative' }}>
                    {loading ? (
                      <div className="pad-md text-muted">Loading CSS…</div>
                    ) : (
                      <div style={{ position: 'absolute', inset: '0' }}>
                        <Editor
                          onMount={(editor) => (editorRef.current = editor)}
                          style={{ width: '100%', height: '100%' }}
                          language={editorLanguage}
                          theme="vs-dark"
                          value={editorValue}
                          onChange={(val) => {
                            if (mode === 'json') {
                              try {
                                const parsed = JSON.parse(val || '{}');
                                updateCSS(parsed.css || '');
                              } catch {
                                // Invalid JSON, don't update
                              }
                            } else {
                              updateCSS(val || '');
                            }
                          }}
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
                </div>

                {/* Preview pane */}
                <div className="w-1/2 flex flex-col border-l border-gray-300">
                  <div className="p-2 bg-gray-50 border-b text-sm font-medium text-gray-700">
                    Live Preview
                  </div>
                  <div className="flex-1 p-4 bg-white" ref={previewRef}>
                    <div className="preview-content">
                      <h3 className="text-lg font-bold mb-2">Preview Content</h3>
                      <p className="mb-4">This content will reflect your CSS changes in real-time.</p>
                      
                      <div className="space-y-4">
                        <div className="p-4 border border-gray-200 rounded">
                          <h4 className="font-semibold mb-2">Sample Card</h4>
                          <p>Your domain CSS styles will be applied here automatically.</p>
                        </div>
                        
                        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                          Sample Button
                        </button>
                        
                        <div className="text-sm text-gray-600">
                          <p>✨ CSS Bridge Status: <span className="font-semibold text-green-600">Active</span></p>
                          <p>🔄 Auto-update: <span className="font-semibold">Enabled</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Variables Tab */}
            <TabsContent value="variables">
              <div className="h-full">
                <DomainCSSVariables cssContent={css} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="toolbar text-muted center" style={{ fontSize: '0.75rem', flexShrink: 0 }}>
          {loading && "Loading..."}
          {saving && "Saving changes..."}
          {verifying && "Verifying CSS..."}
          {!loading && !saving && !verifying && (
            <>
              Mode: {mode} | Status: {status} | Tab: {activeTab}
              {verificationHash && ` | Hash: ${verificationHash.substring(0, 12)}...`}
            </>
          )}
        </div>
      </div>
    </FadeContainer>
  );
}

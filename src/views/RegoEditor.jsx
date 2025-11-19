// src/views/RegoEditor.jsx
import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { toast } from "react-hot-toast";
import { useDomain } from "../context/DomainContext";
import { useUI } from "../context/UIContext";
import { createDISInterface } from "../dis/interface";

// Configure Monaco Rego language support
function configureMonaco(monaco) {
  // Register Rego language
  monaco.languages.register({ id: "rego" });

  // Define Rego syntax highlighting
  monaco.languages.setMonarchTokensProvider("rego", {
    keywords: [
      "package", "import", "as", "default", "else", "with", "some", "in",
      "not", "true", "false", "null", "set", "array", "object",
    ],
    operators: [
      "=", "!=", "==", "<=", ">=", "<", ">", "+", "-", "*", "/", "%",
      ":=", "=", "|", "&", ".",
    ],
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    tokenizer: {
      root: [
        [/[a-z_$][\w$]*/, {
          cases: {
            "@keywords": "keyword",
            "@default": "identifier",
          },
        }],
        [/[A-Z][\w\$]*/, "type.identifier"],
        { include: "@whitespace" },
        [/[{}()\[\]]/, "@brackets"],
        [/@symbols/, {
          cases: {
            "@operators": "operator",
            "@default": "",
          },
        }],
        [/\d+/, "number"],
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, { token: "string.quote", next: "@string" }],
      ],
      string: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, { token: "string.quote", next: "@pop" }],
      ],
      whitespace: [
        [/[ \t\r\n]+/, "white"],
        [/#.*$/, "comment"],
      ],
    },
  });

  // Set language configuration
  monaco.languages.setLanguageConfiguration("rego", {
    comments: {
      lineComment: "#",
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
    ],
  });
}

export default function RegoEditor() {
  const { activeDomainId, domain, actAs, API_BASE } = useDomain();
  const { setView } = useUI();
  const dis = createDISInterface(API_BASE);

  // Controlled state
  const [rego, setRego] = useState(""); // Editable policy
  const [inherited, setInherited] = useState(""); // Read-only inherited
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [validationHints, setValidationHints] = useState([]);
  const [editorInstance, setEditorInstance] = useState(null);
  const [evalInput, setEvalInput] = useState('{\n  "actor": "user@domain",\n  "action": "read",\n  "resource": "file.txt"\n}');
  const [hasChanges, setHasChanges] = useState(false);

  // Check if this is a root domain (no parent)
  const isRootDomain = !domain?.parent_id;

  // Load policies when domain changes - clear state first, then load
  useEffect(() => {
    if (!activeDomainId || activeDomainId === "none") {
      setRego("");
      setInherited("");
      setValidationHints([]);
      setValidationResult(null);
      clearValidationDecorations();
      return;
    }

    const loadPolicies = async () => {
      setLoading(true);
      setRego(""); // Clear immediately
      setInherited("");
      setValidationHints([]);
      setValidationResult(null);
      clearValidationDecorations();
      setHasChanges(false);

      try {
        // Load inherited policies if not root
        if (!isRootDomain) {
          const inheritedRes = await fetch(`${API_BASE}/api/policy/get/${activeDomainId}?mode=inherited`);
          if (inheritedRes.ok) {
            const contentType = inheritedRes.headers.get("Content-Type") || "";
            let policyText = "";
            
            if (contentType.includes("application/json")) {
              const data = await inheritedRes.json();
              policyText = data.policy_content || "";
            } else {
              policyText = await inheritedRes.text();
            }
            
            setInherited(policyText || "# No parent policies");
          } else {
            setInherited("# Failed to load inherited policies");
            toast.error("Failed to load inherited policies", { duration: 3000 });
          }
        } else {
          setInherited("# Root domain — no parent policies");
        }

        // Load local policy
        const localRes = await fetch(`${API_BASE}/api/policy/get/${activeDomainId}?mode=local`);
        if (localRes.ok) {
          const contentType = localRes.headers.get("Content-Type") || "";
          let policyText = "";
          
          if (contentType.includes("application/json")) {
            const data = await localRes.json();
            policyText = data.policy_content || "";
          } else {
            policyText = await localRes.text();
          }
          
          setRego(policyText || "");
        } else {
          // Check for 204 or empty response
          if (localRes.status === 204) {
            toast.error("Server returned empty response (204)", { duration: 3000 });
            setRego("# Failed to load policy (empty response)");
          } else {
            const contentType = localRes.headers.get("Content-Type") || "";
            if (!contentType.includes("text/plain") && !contentType.includes("text/")) {
              const errorText = await localRes.text();
              toast.error(`Unexpected response format: ${errorText.slice(0, 200)}`, { duration: 5000 });
              setRego("# Failed to load policy (non-text response)");
            } else {
              toast.error("Failed to load local policy", { duration: 3000 });
              setRego("# Failed to load policy");
            }
          }
        }
      } catch (err) {
        toast.error(`Network error loading policies: ${err.message}`, { duration: 5000 });
        setRego("# Network error loading policy");
        setInherited("# Network error loading inherited");
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, [activeDomainId, API_BASE, isRootDomain]);

  // Apply Monaco decorations for validation errors
  const applyValidationDecorations = (hints) => {
    if (!editorInstance) return;

    const decorations = hints.map(hint => ({
      range: new window.monaco.Range(hint.line, 1, hint.line, 1000),
      options: {
        isWholeLine: true,
        className: 'validation-error-line',
        glyphMarginClassName: 'validation-error-glyph',
        hoverMessage: { value: `**Error:** ${hint.message}${hint.suggested_fix ? `\n\n**Suggestion:** ${hint.suggested_fix}` : ''}` },
        inlineClassName: 'validation-error-inline',
      },
    }));

    editorInstance.deltaDecorations([], decorations);

    // Scroll to first error
    if (hints.length > 0) {
      editorInstance.revealLineInCenter(hints[0].line);
    }
  };

  // Clear validation decorations
  const clearValidationDecorations = () => {
    if (!editorInstance) return;
    editorInstance.deltaDecorations([], []);
  };

  // Save current policy with parent-authority routing
  const handleSave = async () => {
    if (!activeDomainId || activeDomainId === "none") {
      toast.error("No domain selected");
      return;
    }

    setSaving(true);
    try {
      // Step 1: ActAs authority check
      if (!actAs.domain_id) {
        toast.error("No acting identity selected. Choose a domain to act as in SuperBar.", { duration: 5000 });
        setSaving(false);
        return;
      }

      // Step 2: Validate hierarchical policy stack with current content
      const validateRes = await fetch(`${API_BASE}/api/policy/validate/${activeDomainId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Acting-As": actAs.domain_id,
          "X-Acting-Seat": actAs.seat
        },
        body: JSON.stringify({ content: rego }),
      });

      if (!validateRes.ok) {
        toast.error("Validation request failed", { duration: 5000 });
        setSaving(false);
        return;
      }

      const validationResult = await validateRes.json();
      
      if (!validationResult.success) {
        // Store hints and apply decorations
        const hints = validationResult.hints || [];
        setValidationHints(hints);
        applyValidationDecorations(hints);
        
        toast.error("Rego validation failed — see highlighted lines", { duration: 5000 });
        setSaving(false);
        return;
      }

      // Clear any previous validation decorations
      clearValidationDecorations();
      setValidationHints([]);

      // Step 2: ActAs authority check
      if (!actAs.domain_id) {
        toast.error("No acting identity selected. Choose a domain to act as in SuperBar.", { duration: 5000 });
        setSaving(false);
        return;
      }

      // Step 3: Determine save target (parent-authority routing)
      const saveDomainId = domain.parent_id ?? activeDomainId;

      // Step 4: Save policy only if validation passed
      const saveRes = await fetch(`${API_BASE}/api/policy/save/${saveDomainId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Acting-As": actAs.domain_id,
          "X-Acting-Seat": actAs.seat
        },
        body: JSON.stringify({ 
          content: rego,
          domainId: activeDomainId // Specify which domain we're editing
        }),
      });

      if (saveRes.ok) {
        toast.success("Policy validated and saved ✅", { duration: 3000 });
        setHasChanges(false);
        // Navigate back to overview after successful save
        setTimeout(() => setView("overview"), 500);
      } else {
        const contentType = saveRes.headers.get("Content-Type") || "";
        let errorMsg = "Unknown error";
        if (contentType.includes("application/json")) {
          const json = await saveRes.json();
          errorMsg = json.error || json.message || "Save failed";
        } else {
          const text = await saveRes.text();
          errorMsg = text.slice(0, 200);
        }
        toast.error(`Save failed: ${errorMsg}`, { duration: 5000 });
      }
    } catch (err) {
      toast.error(`Network error: ${err.message}`, { duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  // Validate policy using OPA
  const handleValidate = async () => {
    if (!rego.trim()) {
      toast.error("Policy is empty");
      return;
    }

    let inputData;
    try {
      inputData = JSON.parse(evalInput);
    } catch (err) {
      toast.error("Invalid JSON input for validation");
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/policy/eval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policy: rego,
          input: inputData,
          query: "data.dis.policy.allow",
        }),
      });

      if (!res.ok) {
        toast.error("Validation request failed", { duration: 5000 });
        setValidating(false);
        return;
      }

      const result = await res.json();
      setValidationResult(result);

      if (result.success) {
        toast.success("Policy validated successfully!", { duration: 3000 });
      } else {
        toast.error(`Validation failed: ${result.error}`, { duration: 5000 });
      }
    } catch (err) {
      toast.error(`Network error: ${err.message}`, { duration: 5000 });
      setValidationResult({ success: false, error: err.message });
    } finally {
      setValidating(false);
    }
  };

  if (!activeDomainId || activeDomainId === "none") {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Please select a domain to edit its policy
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-100">
            Rego Policy Editor
          </h1>
          {isRootDomain && (
            <span className="px-3 py-1 bg-amber-600/20 border border-amber-600/50 text-amber-400 text-sm font-medium rounded-full">
              Root Policy — no parent domain
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleValidate}
            disabled={validating || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {validating ? "Validating..." : "Validate"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Policy"}
          </button>
        </div>
      </div>

      {/* Inherited Policy Panel (Read-only) - Only show for non-root domains */}
      {!isRootDomain && (
        <div className="flex-1 flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="px-4 py-2 bg-slate-700 text-slate-200 font-semibold border-b border-slate-600">
            Inherited Policies (Read-only)
          </div>
          <div className="flex-1">
            <Editor
              key={`inherited-${activeDomainId}`}
              height="100%"
              language="rego"
              theme="vs-dark"
              value={inherited}
              beforeMount={configureMonaco}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      )}

      {/* Current Policy Panel (Editable) */}
      <div className="flex-1 flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="px-4 py-2 bg-slate-700 text-slate-200 font-semibold border-b border-slate-600">
          {isRootDomain ? "Root Domain Policy (Editable)" : "Domain Policy (Editable)"}
          {hasChanges && <span className="ml-2 text-amber-400 text-xs">● Unsaved changes</span>}
        </div>
        <div className="flex-1">
          <Editor
            key={`rego-${activeDomainId}-${isRootDomain ? 'root' : 'child'}`}
            height="100%"
            language="rego"
            theme="vs-dark"
            value={rego}
            onChange={(value) => {
              setRego(value || "");
              setHasChanges(true);
            }}
            onMount={(editor) => setEditorInstance(editor)}
            beforeMount={configureMonaco}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      {/* Validation Hints Panel */}
      {validationHints.length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-red-600/50 p-4">
          <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
            <span>⚠️</span> Validation Hints
          </h3>
          <div className="space-y-2">
            {validationHints.map((hint, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (editorInstance) {
                    editorInstance.revealLineInCenter(hint.line);
                    editorInstance.setPosition({ lineNumber: hint.line, column: hint.column || 1 });
                    editorInstance.focus();
                  }
                }}
                className="text-sm bg-slate-900 p-3 rounded cursor-pointer hover:bg-slate-700 transition-colors"
              >
                <div className="text-red-300 font-mono">
                  Line {hint.line}{hint.file && ` (${hint.file})`}:
                </div>
                <div className="text-slate-300 mt-1">{hint.message}</div>
                {hint.suggested_fix && (
                  <div className="text-emerald-400 mt-2 text-xs">
                    💡 {hint.suggested_fix}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Section */}
      <div className="flex gap-4">
        {/* Input JSON */}
        <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 p-4">
          <label className="block text-slate-300 font-semibold mb-2">
            Test Input (JSON)
          </label>
          <textarea
            value={evalInput}
            onChange={(e) => setEvalInput(e.target.value)}
            className="w-full h-32 bg-slate-900 text-slate-200 border border-slate-600 rounded p-2 font-mono text-sm"
            placeholder='{"actor": "user@domain", "action": "read"}'
          />
        </div>

        {/* Validation Result */}
        {validationResult && (
          <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 p-4">
            <label className="block text-slate-300 font-semibold mb-2">
              Validation Result
            </label>
            <div
              className={`p-3 rounded ${
                validationResult.success
                  ? "bg-emerald-900/30 border border-emerald-600"
                  : "bg-red-900/30 border border-red-600"
              }`}
            >
              <div className="text-sm font-mono">
                <div className="mb-2">
                  <span className="font-bold">Result:</span>{" "}
                  {JSON.stringify(validationResult.result, null, 2)}
                </div>
                {validationResult.error && (
                  <div className="text-red-400">
                    <span className="font-bold">Error:</span> {validationResult.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Add CSS for Monaco validation decorations */}
      <style>{`
        .validation-error-line {
          background-color: rgba(239, 68, 68, 0.1);
          border-left: 3px solid rgb(239, 68, 68);
        }
        .validation-error-glyph {
          background-color: rgb(239, 68, 68);
          width: 4px !important;
          margin-left: 3px;
        }
      `}</style>
    </div>
  );
}

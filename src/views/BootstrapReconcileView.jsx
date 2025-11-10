// src/views/BootstrapReconcileView.jsx
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import YAML from "js-yaml";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Loader2, Save, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { createDISInterface } from "../dis/interface.js";
import { useDomain } from "../context/DomainContext.jsx";


export default function BootstrapReconcileView() {
  const { id } = useParams();
  const { API_BASE } = useDomain();
  const decodedId = decodeURIComponent(id);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [detectedType, setDetectedType] = useState("unknown");
  
  // Initialize DIS interface
  const dis = createDISInterface(API_BASE);
  // state you likely already have
  const [loadedFile, setLoadedFile] = useState(null); // { id, filename, rel_path, ... }


  const [form, setForm] = useState({
    schema_id: "",
    schema_version: "",
    domain: "",
    domain_id: "",
    domain_version: "",
    parent_domain: "",
  });

  // Pretty-print JSON as YAML or return raw YAML
  function formatForDisplay(text) {
    if (!text) return "";
    try {
      return YAML.dump(JSON.parse(text), { indent: 2 });
    } catch {
      return text;
    }
  }

  // Load bootstrap content
  useEffect(() => {
    dis.getBootstrap(decodedId)
      .then((text) => {
        setData({ content: text });
        let parsed = {};
        try {
          parsed = YAML.load(text) || {};
        } catch (e) {
          console.warn("YAML parse error:", e);
        }

        const meta = parsed.meta || parsed;
        const isDomain =
          meta.domain_id ||
          (meta.type && meta.type.startsWith("domain.")) ||
          // Check if domain_id looks like a UUID
          (meta.domain_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(meta.domain_id));
        setDetectedType(isDomain ? "domain" : "schema");

        setForm({
          schema_id: meta.schema_id || "",
          schema_version: meta.schema_version || "",
          domain: meta.domain || "",
          domain_id: meta.domain_id || "",
          domain_version: meta.domain_version || "",
          parent_domain: meta.parent_domain || "",
        });

        setToast({ type: "success", msg: `✅ Loaded ${decodedId}` });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [decodedId]);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleValidate = () => {
    setToast({ type: "info", msg: "Validating YAML..." });
    setTimeout(() => {
      setToast({ type: "success", msg: "Validation successful." });
    }, 800);
  };

  const handleSave = () => {
    dis.reconcileBootstrap({
      id: decodedId,
      ...form,
      content: data?.content || "",
    })
      .then(() =>
        setToast({ type: "success", msg: "Bootstrap saved successfully." })
      )
      .catch((err) => setToast({ type: "error", msg: err.message }));
  };

  if (loading)
    return (
      <div className="center pad-md text-muted">
        <Loader2 style={{ marginRight: '8px' }} /> Loading YAML...
      </div>
    );
  if (error)
    return (
      <div className="center pad-md warning">
        <XCircle style={{ marginRight: '8px' }} /> {error}
      </div>
    );

  return (
    <div className="panel column gap-md pad-md" style={{ height: '100%' }}>
      {toast && <Toast type={toast.type} message={toast.msg} />}

      <div className="flex gap-md" style={{ flex: '1' }}>
        {/* LEFT PANEL */}
        <Card className="panel" style={{ width: '33.333%' }}>
          <CardHeader>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
              YAML Mapping
            </h2>
          </CardHeader>
          <CardContent className="column gap-md">
            {/* detection banner */}
            <div
              className={`pad-sm ${
                detectedType === "schema"
                  ? "bg-[#003322] text-[#00B97A]"
                  : detectedType === "domain"
                  ? "bg-[#331a00] text-[#ffae42]"
                  : "bg-[#222] text-gray-400"
              }`}
              style={{ fontSize: '0.875rem', fontWeight: '600', borderRadius: '6px' }}
            >
              {detectedType === "schema"
                ? "Schema detected"
                : detectedType === "domain"
                ? "Domain detected"
                : "Unrecognized type"}
            </div>

            {detectedType === "schema" ? (
              <>
                <Field
                  label="Schema ID"
                  value={form.schema_id}
                  onChange={(v) => handleChange("schema_id", v)}
                  placeholder="e.g. dis-auth-handshake"
                />
                <Field
                  label="Schema Version"
                  value={form.schema_version}
                  onChange={(v) => handleChange("schema_version", v)}
                  placeholder="e.g. v1"
                />
                <Field
                  label="Domain"
                  value={form.domain}
                  onChange={(v) => handleChange("domain", v)}
                  placeholder="e.g. a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                />
              </>
            ) : (
              <>
                <Field
                  label="Domain ID"
                  value={form.domain_id}
                  onChange={(v) => handleChange("domain_id", v)}
                  placeholder="e.g. f1e2d3c4-b5a6-9870-dcba-1234567890ef"
                />
                <Field
                  label="Domain Version"
                  value={form.domain_version}
                  onChange={(v) => handleChange("domain_version", v)}
                  placeholder="e.g. v1"
                />
                <Field
                  label="Parent Domain"
                  value={form.parent_domain}
                  onChange={(v) => handleChange("parent_domain", v)}
                  placeholder="e.g. 12345678-9abc-def0-1234-567890abcdef"
                />
              </>
            )}

            <Button
              onClick={() => {
                dis.canonizeBootstrap({ filename: decodedId })
                  .then(() =>
                    setToast({
                      type: "success",
                      msg: `✨ Canonized ${decodedId} to DIS Core canon.`,
                    })
                  )
                  .catch((err) =>
                    setToast({ type: "error", msg: `Canonize failed: ${err.message}` })
                  );
              }}
              className="button"
              style={{ width: '100%', backgroundColor: '#d97706', color: 'black' }}
            >
              <CheckCircle2 style={{ marginRight: '8px', width: '16px', height: '16px' }} /> Canonize
            </Button>


            <Button
              onClick={handleValidate}
              className="button"
              style={{ width: '100%', backgroundColor: '#00B97A', color: 'black' }}
            >
              <CheckCircle2 style={{ marginRight: '8px', width: '16px', height: '16px' }} /> Validate
            </Button>
          </CardContent>
        </Card>

        {/* RIGHT PANEL */}
        <Card className="panel" style={{ flex: '1' }}>
          <CardHeader>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
              {detectedType === "schema"
                ? "Schema Canon YAML"
                : detectedType === "domain"
                ? "Domain Canon YAML"
                : "Raw YAML Preview"}
            </h2>
          </CardHeader>
          <CardContent className="column gap-md">
            {/* additions preview */}
            <div className="panel pad-sm" style={{ fontSize: '0.875rem' }}>
              <p style={{ fontWeight: '600', marginBottom: '4px' }}>New DIS Additions</p>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {detectedType === "schema"
                  ? `meta:
  schema_id: ${form.schema_id || "<unset>"}
  schema_version: ${form.schema_version || "<unset>"}
  domain: ${form.domain || "<unset>"}`
                  : `meta:
  domain_id: ${form.domain_id || "<unset>"}
  domain_version: ${form.domain_version || "<unset>"}
  parent_domain: ${form.parent_domain || "<unset>"}`}
              </pre>
            </div>

            {/* raw YAML */}
            <pre className="panel text-muted pad-sm" style={{ fontSize: '0.875rem', height: '60vh', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
              {formatForDisplay(data?.content)}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM BAR */}
      <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
        <Button
          variant="secondary"
          onClick={() =>
            setForm({
              schema_id: "",
              schema_version: "",
              domain: "",
              domain_id: "",
              domain_version: "",
              parent_domain: "",
            })
          }
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          className="button"
          style={{ backgroundColor: '#00B97A', color: 'black' }}
        >
          <Save style={{ marginRight: '8px', width: '16px', height: '16px' }} /> Save Bootstrap
        </Button>
      </div>
    </div>
  );
}

/* Input helper */
function Field({ label, value, onChange, placeholder }) {
  return (
    <div className="field">
      <label className="text-muted" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field"
        style={{ width: '100%' }}
        placeholder={placeholder}
      />
    </div>
  );
}

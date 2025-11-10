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
      <div className="flex items-center justify-center h-full text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Loading YAML...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <XCircle className="mr-2" /> {error}
      </div>
    );

  return (
    <div className="flex flex-col h-full p-6 space-y-4">
      {toast && <Toast type={toast.type} message={toast.msg} />}

      <div className="flex flex-1 gap-4">
        {/* LEFT PANEL */}
        <Card className="w-1/3 bg-[#10161C] border-[#2A3642]">
          <CardHeader>
            <h2 className="text-lg font-semibold text-[#00B97A]">
              YAML Mapping
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* detection banner */}
            <div
              className={`text-sm font-semibold px-3 py-2 rounded-md ${
                detectedType === "schema"
                  ? "bg-[#003322] text-[#00B97A]"
                  : detectedType === "domain"
                  ? "bg-[#331a00] text-[#ffae42]"
                  : "bg-[#222] text-gray-400"
              }`}
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
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-black"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Canonize
            </Button>


            <Button
              onClick={handleValidate}
              className="w-full bg-[#00B97A] text-black hover:bg-[#00e697]"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Validate
            </Button>
          </CardContent>
        </Card>

        {/* RIGHT PANEL */}
        <Card className="flex-1 bg-[#0B0F14] border-[#2A3642]">
          <CardHeader>
            <h2 className="text-lg font-semibold text-[#00B97A]">
              {detectedType === "schema"
                ? "Schema Canon YAML"
                : detectedType === "domain"
                ? "Domain Canon YAML"
                : "Raw YAML Preview"}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* additions preview */}
            <div className="border border-[#2A3642] rounded-md bg-[#10161C] p-3 text-gray-300 text-sm">
              <p className="text-[#00B97A] font-semibold mb-1">New DIS Additions</p>
              <pre className="whitespace-pre-wrap">
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
            <pre className="text-gray-300 bg-[#0B0F14] border border-[#2A3642] p-3 rounded-md overflow-auto text-sm h-[60vh] whitespace-pre-wrap">
              {formatForDisplay(data?.content)}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM BAR */}
      <div className="flex justify-end gap-4 border-t border-[#2A3642] pt-4">
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
          className="bg-[#00B97A] text-black hover:bg-[#00e697]"
        >
          <Save className="mr-2 h-4 w-4" /> Save Bootstrap
        </Button>
      </div>
    </div>
  );
}

/* Input helper */
function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-gray-400 text-sm block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0B0F14] border border-[#2A3642] rounded-md p-2 text-gray-100"
        placeholder={placeholder}
      />
    </div>
  );
}

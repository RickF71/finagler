import React, { useState } from "react";
import { useDomain } from "../context/DomainContext.jsx";
import { useUI } from "../context/UIContext.jsx";

export default function DomainCreate({ parentDomain }) {
  const { API_BASE, setActiveDomainId, actAs } = useDomain();
  const { setView } = useUI();

  const domain = parentDomain;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ActAs authority check
      if (!actAs.domain_id) {
        setError("No acting identity selected. Choose a domain to act as in SuperBar.");
        setLoading(false);
        return;
      }

      // Build data object with name and optional description
      const dataPayload = {
        name: formData.name,
      };
      
      if (formData.description) {
        dataPayload.description = formData.description;
      }

      // Backend expects: { name: string, parent_id?: uuid, data: json }
      const payload = {
        name: formData.name, // Used for ledger/logging
        parent_id: domain?.id || null,
        data: dataPayload, // Actual domain data stored in payload
      };

      console.log(`🔧 Creating domain with payload (acting as ${actAs.label}):`, payload);

      const response = await fetch(`${API_BASE}/api/domain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Acting-As": actAs.domain_id,
          "X-Acting-Seat": actAs.seat
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to get detailed error from backend
        const errorText = await response.text();
        let errorMessage = `Failed to create domain: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If not JSON, use raw text if available
          if (errorText) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("✅ Domain created successfully:", data);

      // Switch to newly created domain (triggers DomainContext to load it)
      setActiveDomainId(data.id);
      
      // Navigate to overview of the new domain
      setView("overview");
      
      // Reset form
      setFormData({ name: "", description: "" });
    } catch (err) {
      console.error("❌ Domain creation failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setView("overview");
  };

  return (
    <div
      className="panel"
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        marginTop: "32px",
        backgroundColor: "var(--panel-bg)",
        border: "1px solid var(--panel-border)",
        color: "var(--text-color)",
        padding: "24px",
        borderRadius: "8px",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          marginBottom: "12px",
          color: "var(--text-strong)",
        }}
      >
        Create New Domain
      </h2>

      {domain && (
        <div
          style={{
            marginBottom: "20px",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
          }}
        >
          Parent Domain:{" "}
          <span
            style={{
              color: "var(--accent)",
              fontWeight: 500,
            }}
          >
            {domain.name || domain.id || activeDomainId}
          </span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "16px",
            backgroundColor: "var(--warning-bg)",
            border: "1px solid var(--warning-border)",
            color: "var(--warning-text)",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Display Name */}
        <div>
          <label
            htmlFor="name"
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 500,
              color: "var(--text-strong)",
            }}
          >
            Display Name <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Testmech, My Domain"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              backgroundColor: "var(--field-bg)",
              border: "1px solid var(--field-border)",
              color: "var(--field-text)",
              outline: "none",
            }}
            onFocus={(e) =>
              (e.target.style.backgroundColor = "var(--field-bg-focus)")
            }
            onBlur={(e) =>
              (e.target.style.backgroundColor = "var(--field-bg)")
            }
            disabled={loading}
          />
          <small style={{ color: "var(--text-muted)" }}>
            Human-readable name for this domain
          </small>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 500,
              color: "var(--text-strong)",
            }}
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional description"
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "10px",
              borderRadius: "6px",
              backgroundColor: "var(--field-bg)",
              border: "1px solid var(--field-border)",
              color: "var(--field-text)",
              outline: "none",
            }}
            onFocus={(e) =>
              (e.target.style.backgroundColor = "var(--field-bg-focus)")
            }
            onBlur={(e) =>
              (e.target.style.backgroundColor = "var(--field-bg)")
            }
            disabled={loading}
          />
          <small style={{ color: "var(--text-muted)" }}>
            Optional description for this domain
          </small>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          <button
            type="submit"
            disabled={loading || !formData.name}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "var(--accent)",
              color: "var(--accent-text)",
              border: "1px solid var(--button-border)",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating..." : "Create Domain"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "var(--button-secondary-bg)",
              color: "var(--button-secondary-text)",
              border: "1px solid var(--button-border)",
              borderRadius: "6px",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

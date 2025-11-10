// src/views/DomainOverview.jsx
import React from "react";
import { useDomain } from "../context/DomainContext";

/**
 * DomainOverview
 * - Displays full domain data structure (read-only)
 * - Reflects the currently loaded domain from DomainContext
 * - Useful for debugging, editing, or viewing nested fields (finagler, meta, etc.)
 */
export default function DomainOverview() {
  const { domain, activeDomainId, loading, error } = useDomain();

  if (loading) return <p className="text-muted">Loading domain...</p>;
  if (error) return <p className="warning">Error: {error.message}</p>;
  if (!domain)
    return (
      <p className="text-muted">
        No domain loaded. (Active ID: {activeDomainId || "none"})
      </p>
    );

  const d = domain || {};
  const finagler = d.finagler || {};

  return (
    <div className="panel">
      <h2 className="text-xl font-bold mb-2 text-yellow-400">
        {d.name || d.id}
      </h2>
      <p className="text-muted">{d.description || "No description"}</p>

      {/* Core details */}
      <section className="panel">
        <p><strong>ID:</strong> {d.id}</p>
        {d.parent_id && <p><strong>Parent:</strong> {d.parent_id}</p>}
        <p><strong>Version:</strong> {d.version || "v1.0"}</p>
        <p><strong>Owner:</strong> {d.owner_ref || "none"}</p>
      </section>

      {/* Finagler block */}
      {finagler && (
        <section className="panel">
          <h3 className="font-semibold text-yellow-300 mb-2">Finagler Theme</h3>
          {finagler.accent && (
            <p>
              <strong>Accent:</strong>{" "}
              <span className="text-accent">{finagler.accent}</span>
            </p>
          )}
          {finagler.icon && (
            <p>
              <strong>Icon:</strong> {finagler.icon}
            </p>
          )}
          {finagler.css && (
            <>
              <p className="text-muted">CSS:</p>
              <pre className="field">
                {finagler.css}
              </pre>
            </>
          )}
          {finagler.jsx && (
            <>
              <p className="text-muted">JSX:</p>
              <pre className="field">
                {finagler.jsx}
              </pre>
            </>
          )}
        </section>
      )}

      {/* Meta data */}
      {d.meta && Object.keys(d.meta).length > 0 && (
        <section className="panel">
          <h3 className="font-semibold text-yellow-300 mb-2">Meta</h3>
          <pre className="field">
            {JSON.stringify(d.meta, null, 2)}
          </pre>
        </section>
      )}

      {/* Raw data (for debug) */}
      <section className="panel">
        <details>
          <summary className="cursor-pointer text-yellow-400 hover:text-yellow-300">
            Raw domain JSON
          </summary>
          <pre className="field">
            {JSON.stringify(domain, null, 2)}
          </pre>
        </details>
      </section>
    </div>
  );
}
// src/views/DomainOverview.jsx
import React from "react";
import { useDomain } from "../context/DomainContext";
import { useActiveUser } from "../context/ActiveUserContext";

/**
 * DomainOverview
 * - Displays full domain data structure (read-only)
 * - Reflects the currently loaded domain from DomainContext
 * - Useful for debugging, editing, or viewing nested fields (finagler, meta, etc.)
 */
export default function DomainOverview() {
  const { domain, activeDomainId, loading, error } = useDomain();
  const { activeUser } = useActiveUser();

  if (loading) return <p className="text-muted">Loading domain...</p>;
  if (error) return <p className="warning">Error: {error.message}</p>;
  if (!domain)
    return (
      <p className="text-muted">
        No domain loaded. (Active ID: {activeDomainId || "none"})
      </p>
    );

  const d = domain || {};
  const payload = d.payload || {};
  const meta = payload.meta || {};
  const css = payload.css || {};
  const finagler = d.finagler || {};

  return (
    <div className="panel">
      <h2 className="text-xl font-bold mb-2 text-yellow-400">
        {d.name || d.id}
      </h2>
      <p className="text-muted">{d.description || "No description"}</p>

      {/* Debug Panel: Current User & Domain Info */}
      <section className="panel bg-slate-800 border border-blue-500 mb-4">
        <h3 className="font-semibold text-blue-400 mb-3">🐛 Debug Info</h3>
        
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-blue-300 mb-1">Active User:</h4>
          {activeUser ? (
            <pre className="text-xs bg-slate-900 p-2 rounded overflow-auto">
              {JSON.stringify(activeUser, null, 2)}
            </pre>
          ) : (
            <p className="text-xs text-gray-400">No user loaded</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-blue-300 mb-1">Active Domain Context:</h4>
          <pre className="text-xs bg-slate-900 p-2 rounded overflow-auto">
            {JSON.stringify({
              activeDomainId,
              domainName: d.name,
              domainId: d.id,
              parentId: d.parent_id,
              state: domain?.state,
              hasPayload: !!payload,
              payloadKeys: Object.keys(payload)
            }, null, 2)}
          </pre>
        </div>
      </section>

      {/* Core details */}
      <section className="panel">
        <p><strong>ID:</strong> {d.id}</p>
        {d.parent_id && <p><strong>Parent:</strong> {d.parent_id}</p>}
        <p><strong>Schema Version:</strong> {meta.schema_version || "unknown"}</p>
        {d.created_at && <p><strong>Created:</strong> {new Date(d.created_at).toLocaleString()}</p>}
        {d.updated_at && <p><strong>Updated:</strong> {new Date(d.updated_at).toLocaleString()}</p>}
      </section>

      {/* CSS Section (Phase 10J.4: from payload.css) */}
      {css.content && (
        <section className="panel">
          <h3 className="font-semibold text-yellow-300 mb-2">Domain CSS</h3>
          <p className="text-muted text-sm mb-2">
            Last updated: {css.updated_at ? new Date(css.updated_at).toLocaleString() : "unknown"}
            {css.verified && <span className="text-green-400 ml-2">✓ Verified</span>}
          </p>
          <pre className="field text-sm">
            {css.content}
          </pre>
        </section>
      )}

      {/* Finagler block */}
      {finagler && Object.keys(finagler).length > 0 && (
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
              <p className="text-muted">Custom CSS:</p>
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
      {meta && Object.keys(meta).length > 0 && (
        <section className="panel">
          <h3 className="font-semibold text-yellow-300 mb-2">Meta</h3>
          <pre className="field">
            {JSON.stringify(meta, null, 2)}
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
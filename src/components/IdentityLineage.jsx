import React, { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * IntegrityBadge - Visual indicator for hash chain integrity status
 */
function IntegrityBadge({ valid, isRoot }) {
  if (isRoot) {
    return <span className="integrity-badge root" title="Root receipt">⚑</span>;
  }
  if (valid) {
    return <span className="integrity-badge valid" title="Hash chain valid">✓</span>;
  }
  return <span className="integrity-badge broken" title="Hash chain broken">✖</span>;
}

/**
 * IdentityLineage - Component for displaying identity receipt lineage
 * Shows chronological identity actions with hash chain integrity verification
 */
export default function IdentityLineage({ actorId }) {
  const [lineage, setLineage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!actorId) return;
    fetchLineage();
  }, [actorId]);

  async function fetchLineage() {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/identity/lineage/${actorId}`);
      setLineage(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch identity lineage');
    } finally {
      setLoading(false);
    }
  }

  function exportAsJSON() {
    if (!lineage) return;
    const exportData = {
      exported_at: new Date().toISOString(),
      actor_id: actorId,
      lineage,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `identity-lineage-${actorId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <div className="identity-lineage loading">Loading lineage...</div>;
  }

  if (error) {
    return <div className="identity-lineage error">Error: {error}</div>;
  }

  if (!lineage || !lineage.entries || lineage.entries.length === 0) {
    return <div className="identity-lineage empty">No identity receipts found.</div>;
  }

  const { integrity } = lineage;

  return (
    <div className="identity-lineage">
      <div className="lineage-header">
        <h3>Identity Lineage</h3>
        <button onClick={exportAsJSON} className="export-btn">
          Export JSON
        </button>
      </div>

      <div className="integrity-summary">
        <div className="integrity-stat">
          <span className="label">Total Receipts:</span>
          <span className="value">{integrity.total_receipts}</span>
        </div>
        <div className="integrity-stat">
          <span className="label">Valid Chains:</span>
          <span className="value valid">{integrity.valid_chains}</span>
        </div>
        <div className="integrity-stat">
          <span className="label">Broken Chains:</span>
          <span className="value broken">{integrity.broken_chains}</span>
        </div>
        <div className="integrity-stat">
          <span className="label">Root Receipts:</span>
          <span className="value root">{integrity.root_receipts}</span>
        </div>
      </div>

      {integrity.issues && integrity.issues.length > 0 && (
        <div className="integrity-issues">
          <h4>Integrity Issues:</h4>
          <ul>
            {integrity.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="lineage-entries">
        {lineage.entries.map((entry, idx) => (
          <div key={entry.id} className="lineage-entry">
            <div className="entry-header">
              <IntegrityBadge
                valid={entry.valid}
                isRoot={entry.prev_id === null}
              />
              <span className="entry-action">{entry.action}</span>
              <span className="entry-timestamp">
                {new Date(entry.created_at).toLocaleString()}
              </span>
            </div>

            <div className="entry-details">
              <div className="detail-row">
                <span className="detail-label">ID:</span>
                <span className="detail-value mono">{entry.id}</span>
              </div>
              {entry.prev_id && (
                <div className="detail-row">
                  <span className="detail-label">Prev ID:</span>
                  <span className="detail-value mono">{entry.prev_id}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Hash:</span>
                <span className="detail-value mono">{entry.hash}</span>
              </div>
              {entry.consent_by && (
                <div className="detail-row">
                  <span className="detail-label">Consent By:</span>
                  <span className="detail-value mono">{entry.consent_by}</span>
                </div>
              )}
              {entry.domain_id && (
                <div className="detail-row">
                  <span className="detail-label">Domain:</span>
                  <span className="detail-value mono">{entry.domain_id}</span>
                </div>
              )}
              {entry.payload && Object.keys(entry.payload).length > 0 && (
                <div className="detail-row payload">
                  <span className="detail-label">Payload:</span>
                  <pre className="detail-value">
                    {JSON.stringify(entry.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .identity-lineage {
          padding: 1rem;
          background: var(--bg-secondary, #f9f9f9);
          border-radius: 8px;
        }

        .lineage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .lineage-header h3 {
          margin: 0;
        }

        .export-btn {
          padding: 0.5rem 1rem;
          background: var(--accent-color, #007acc);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .export-btn:hover {
          background: var(--accent-hover, #005a9e);
        }

        .integrity-summary {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: white;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .integrity-stat {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .integrity-stat .label {
          font-size: 0.85rem;
          color: var(--text-secondary, #666);
        }

        .integrity-stat .value {
          font-size: 1.25rem;
          font-weight: bold;
        }

        .integrity-stat .value.valid {
          color: green;
        }

        .integrity-stat .value.broken {
          color: red;
        }

        .integrity-stat .value.root {
          color: orange;
        }

        .integrity-issues {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 6px;
        }

        .integrity-issues h4 {
          margin: 0 0 0.5rem 0;
          color: #856404;
        }

        .integrity-issues ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .integrity-issues li {
          color: #856404;
        }

        .lineage-entries {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .lineage-entry {
          background: white;
          border-radius: 6px;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .entry-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .integrity-badge {
          font-size: 1.25rem;
          line-height: 1;
        }

        .integrity-badge.valid {
          color: green;
        }

        .integrity-badge.broken {
          color: red;
        }

        .integrity-badge.root {
          color: orange;
        }

        .entry-action {
          font-weight: 600;
          color: var(--text-primary, #333);
        }

        .entry-timestamp {
          margin-left: auto;
          font-size: 0.85rem;
          color: var(--text-secondary, #666);
        }

        .entry-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-row {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
        }

        .detail-row.payload {
          flex-direction: column;
        }

        .detail-label {
          font-weight: 500;
          color: var(--text-secondary, #666);
          min-width: 100px;
        }

        .detail-value {
          color: var(--text-primary, #333);
          word-break: break-all;
        }

        .detail-value.mono {
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }

        .detail-value pre {
          margin: 0;
          padding: 0.5rem;
          background: #f5f5f5;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.85rem;
        }

        .loading,
        .error,
        .empty {
          padding: 2rem;
          text-align: center;
          color: var(--text-secondary, #666);
        }

        .error {
          color: red;
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { getStatus, getDomain } from "../lib/api";
import { useDomain } from "../context/DomainContext";

export default function NodeStatus() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { activeDomainId } = useDomain();

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await getStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 5000);
    return () => clearInterval(timer);
  }, []);

  // Load domain styling using the active domain UUID
  useEffect(() => {
    if (!activeDomainId) return;

    async function loadDomainStyles() {
      try {
        const domainData = await getDomain(activeDomainId);
        const { css, jsx } = domainData;
        
        if (css) {
          // Remove any existing domain styles
          const existingStyle = document.getElementById("domain-node-styles");
          if (existingStyle) existingStyle.remove();
          
          const style = document.createElement("style");
          style.id = "domain-node-styles";
          style.innerHTML = css;
          document.head.appendChild(style);
        }
        
        // Note: JSX injection is commented out as it could override the React app
        // if (jsx) {
        //   document.getElementById("root").innerHTML = jsx;
        // }
      } catch (err) {
        console.warn("Failed to load domain styles:", err);
      }
    }
    
    loadDomainStyles();
  }, [activeDomainId]);

  return (
    <div className="pad-md">
      <div className="flex center gap-md" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>🧩 Node Overview</h2>
        <button
          onClick={fetchStatus}
          className="button"
        >
          Refresh
        </button>
      </div>
      {loading && <div className="text-muted">Loading...</div>}
      {error && <div className="warning">Error: {error}</div>}
      {status && (
        <pre className="panel pad-md text-muted" style={{ fontSize: '0.875rem', overflow: 'auto' }}>
          {JSON.stringify(status, null, 2)}
        </pre>
      )}
    </div>
  );
}

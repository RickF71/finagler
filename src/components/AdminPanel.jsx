import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './AdminPanel.css';
import { createDISInterface } from "../dis/interface.js";
import { useDomain } from "../context/DomainContext.jsx";

const AdminPanel = ({ userRole, authToken }) => {
  const { API_BASE } = useDomain();
  const [activeTab, setActiveTab] = useState('receipts');
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [freezeTarget, setFreezeTarget] = useState('');
  const [freezeReason, setFreezeReason] = useState('');
  const [policyType, setPolicyType] = useState('');

  // Check if user has admin privileges
  const isAdmin = userRole === 'root' || userRole === 'policy.admin';

  // Fetch recent receipts
  const fetchReceipts = async () => {
    if (!authToken) {
      toast.error('No authentication token available');
      return;
    }

    setLoading(true);
    try {
      const dis = createDISInterface(API_BASE);
      const data = await dis.getAdminRecentReceipts(authToken);
      setReceipts(data.receipts || []);
      toast.success(`Loaded ${data.count} receipts`);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
      toast.error(`Failed to fetch receipts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle freeze action
  const handleFreeze = async (e) => {
    e.preventDefault();
    if (!freezeTarget.trim()) {
      toast.error('Target is required for freeze action');
      return;
    }

    setLoading(true);
    try {
      const dis = createDISInterface(API_BASE);
      const data = await dis.adminFreeze(freezeTarget, freezeReason, authToken);
      toast.success(`Successfully froze: ${data.target}`);
      setFreezeTarget('');
      setFreezeReason('');
    } catch (error) {
      console.error('Failed to freeze target:', error);
      toast.error(`Failed to freeze: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle policy reload
  const handlePolicyReload = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dis = createDISInterface(API_BASE);
      const data = await dis.adminReloadPolicy(policyType, authToken);
      toast.success('Policy reload completed successfully');
      setPolicyType('');
    } catch (error) {
      console.error('Failed to reload policy:', error);
      toast.error(`Failed to reload policy: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch receipts when component mounts or tab changes to receipts
  useEffect(() => {
    if (activeTab === 'receipts' && isAdmin) {
      fetchReceipts();
    }
  }, [activeTab, isAdmin]);

  // Don't render if user doesn't have admin privileges
  if (!isAdmin) {
    return (
      <div className="admin-panel">
        <div className="admin-access-denied">
          <h3>Access Denied</h3>
          <p>You need admin privileges to access this panel.</p>
          <p>Current role: {userRole || 'none'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>🛡️ DIS Authority Console</h2>
        <p>Manage domains and policies with admin privileges</p>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'receipts' ? 'active' : ''}`}
          onClick={() => setActiveTab('receipts')}
        >
          📋 Receipts Viewer
        </button>
        <button
          className={`admin-tab ${activeTab === 'freeze' ? 'active' : ''}`}
          onClick={() => setActiveTab('freeze')}
        >
          🧊 Freeze Control
        </button>
        <button
          className={`admin-tab ${activeTab === 'policy' ? 'active' : ''}`}
          onClick={() => setActiveTab('policy')}
        >
          🔄 Policy Reload
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-tab-content">
        {activeTab === 'receipts' && (
          <div className="receipts-viewer">
            <div className="receipts-header">
              <h3>Recent Receipts (Last 50)</h3>
              <button onClick={fetchReceipts} disabled={loading}>
                {loading ? '⏳ Loading...' : '🔄 Refresh'}
              </button>
            </div>

            {receipts.length > 0 ? (
              <div className="receipts-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Actor</th>
                      <th>Target</th>
                      <th>Domain</th>
                      <th>Created</th>
                      <th>Payload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((receipt) => (
                      <tr key={receipt.id}>
                        <td className="receipt-id">{receipt.id.substring(0, 8)}...</td>
                        <td className="receipt-type">{receipt.type}</td>
                        <td className="receipt-actor">{receipt.actor}</td>
                        <td className="receipt-target">{receipt.target}</td>
                        <td className="receipt-domain">{receipt.domain}</td>
                        <td className="receipt-created">
                          {new Date(receipt.created_at).toLocaleString()}
                        </td>
                        <td className="receipt-payload">
                          <details>
                            <summary>View</summary>
                            <pre>{JSON.stringify(receipt.payload, null, 2)}</pre>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-receipts">
                <p>No receipts found. {loading ? 'Loading...' : 'Click refresh to load receipts.'}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'freeze' && (
          <div className="freeze-control">
            <h3>🧊 Freeze Domain or Resource</h3>
            <form onSubmit={handleFreeze}>
              <div className="form-group">
                <label htmlFor="freeze-target">Target to Freeze:</label>
                <input
                  id="freeze-target"
                  type="text"
                  value={freezeTarget}
                  onChange={(e) => setFreezeTarget(e.target.value)}
                  placeholder="e.g., domain.example, canon.import"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="freeze-reason">Reason (optional):</label>
                <textarea
                  id="freeze-reason"
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  placeholder="Explain why this freeze is necessary..."
                  rows="3"
                />
              </div>

              <button type="submit" disabled={loading} className="freeze-button">
                {loading ? '⏳ Freezing...' : '🧊 Freeze Target'}
              </button>
            </form>

            <div className="freeze-warning">
              <p>⚠️ <strong>Warning:</strong> Freezing a target will prevent further modifications until unfrozen.</p>
            </div>
          </div>
        )}

        {activeTab === 'policy' && (
          <div className="policy-reload">
            <h3>🔄 Reload Policy Engine</h3>
            <form onSubmit={handlePolicyReload}>
              <div className="form-group">
                <label htmlFor="policy-type">Policy Type (optional):</label>
                <input
                  id="policy-type"
                  type="text"
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value)}
                  placeholder="e.g., freeze, auth, domain (leave empty for all)"
                />
              </div>

              <button type="submit" disabled={loading} className="reload-button">
                {loading ? '⏳ Reloading...' : '🔄 Reload Policies'}
              </button>
            </form>

            <div className="policy-info">
              <p>💡 <strong>Info:</strong> Policy reload will refresh authorization rules and enforcement logic.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

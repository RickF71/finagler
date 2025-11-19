import React, { useState, useEffect } from 'react';
import { createDISInterface } from "../dis/interface.js";
import { useDomain } from "../context/DomainContext.jsx";

const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return 'bg-green-600';
      case 'unverified':
        return 'bg-yellow-600';
      case 'orphan':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor()}`}>
      {status || 'Unknown'}
    </span>
  );
};

// GOV-9: Hash chain integrity status indicator
const IntegrityBadge = ({ status }) => {
  const getIcon = () => {
    switch (status) {
      case 'valid':
        return '✓';
      case 'broken':
        return '✖';
      case 'root':
        return '⚑';
      default:
        return '⚠';
    }
  };

  const getColor = () => {
    switch (status) {
      case 'valid':
        return 'text-green-500';
      case 'broken':
        return 'text-red-500';
      case 'root':
        return 'text-blue-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <span className={`font-bold ${getColor()}`} title={`Integrity: ${status}`}>
      {getIcon()}
    </span>
  );
};

const ReceiptsPane = () => {
  const { API_BASE } = useDomain();
  const [dashboard, setDashboard] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lineageView, setLineageView] = useState(false); // GOV-9: Toggle lineage mode
  const [selectedDomain, setSelectedDomain] = useState(null); // GOV-9: Domain for lineage

  const dis = createDISInterface(API_BASE);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch both endpoints, but handle failures gracefully
      const promises = [
        dis.receipts.getDashboard().catch(err => ({ error: err.message })),
        dis.receipts.listAll(50).catch(err => ({ error: err.message }))
      ];
      
      const [dashboardResult, receiptsResult] = await Promise.all(promises);
      
      // Handle dashboard data
      if (dashboardResult.error) {
        setDashboard({ 
          total: 'N/A', 
          recent24h: 'N/A', 
          verificationRate: 'N/A',
          error: dashboardResult.error 
        });
      } else {
        setDashboard(dashboardResult);
      }
      
      // Handle receipts data
      if (receiptsResult.error) {
        setReceipts([]);
        if (!dashboardResult.error) { // Only set error if dashboard also didn't fail
          setError(`Receipts data unavailable: ${receiptsResult.error}`);
        }
      } else {
        setReceipts(receiptsResult.receipts || receiptsResult || []);
      }
      
      // If both failed, show combined error
      if (dashboardResult.error && receiptsResult.error) {
        setError('Dashboard and receipts data unavailable. Backend may need schema updates.');
      }
      
    } catch (err) {
      console.error('Failed to fetch receipts data:', err);
      setError(err.message);
      // Set fallback data
      setDashboard({ 
        total: 'Error', 
        recent24h: 'Error', 
        verificationRate: 'Error' 
      });
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    fetchData();
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData();
      }, 30000); // 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // GOV-9: Fetch authority lineage for a domain
  const fetchLineage = async (domainId) => {
    try {
      const response = await fetch(`${API_BASE}/api/authority/lineage/${domainId}`);
      if (!response.ok) throw new Error('Failed to fetch lineage');
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Failed to fetch lineage:', err);
      setError(`Lineage fetch failed: ${err.message}`);
      return null;
    }
  };

  // GOV-9: Export receipts/lineage as JSON
  const exportAsJSON = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `receipts_export_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const truncateId = (id) => {
    if (!id) return 'N/A';
    return `${id.substring(0, 8)}...`;
  };

  if (loading && !dashboard) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📋 Receipts Dashboard</h1>
        <div className="flex items-center space-x-4">
          {/* GOV-9: Export button */}
          <button
            onClick={() => exportAsJSON({ dashboard, receipts }, `receipts_export_${Date.now()}.json`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            title="Export receipts as JSON for audit reports"
          >
            📥 Export JSON
          </button>
          
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span>Auto-refresh (30s)</span>
          </label>
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>{loading ? '⏳' : '🔄'}</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
          <div className="flex items-start">
            <div className="mr-3 mt-1">⚠️</div>
            <div>
              <strong>Notice:</strong> {error}
              {error.includes('schema') && (
                <div className="mt-2 text-sm">
                  <p>This usually means the DIS-Core database needs schema updates for receipts tracking.</p>
                  <p>The frontend is ready but backend schema migration may be required.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Metrics */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Receipts</h3>
            <div className="text-3xl font-bold text-blue-600">
              {dashboard.total || dashboard.totalReceipts || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              All time receipts
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Recent Activity</h3>
            <div className="text-3xl font-bold text-green-600">
              {dashboard.recent24h || dashboard.recentCount || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Last 24 hours
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Verification Rate</h3>
            <div className="text-3xl font-bold text-purple-600">
              {dashboard.verificationRate || dashboard.verified || 'N/A'}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Verified receipts
            </div>
          </div>
        </div>
      )}

      {/* Receipts Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Recent Receipts (Last 50)</h2>
        </div>

        {receipts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {loading ? 'Loading receipts...' : 'No receipts found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payload
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receipts.map((receipt) => (
                  <tr key={receipt.id || receipt.receipt_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {truncateId(receipt.id || receipt.receipt_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={receipt.status || receipt.verification_status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {receipt.type || receipt.receipt_type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {receipt.actor || receipt.actor_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {receipt.target || receipt.target_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {receipt.domain || receipt.domain_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(receipt.created_at || receipt.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {receipt.payload ? (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800">
                            View Payload
                          </summary>
                          <div className="mt-2 max-w-xs">
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                              {JSON.stringify(receipt.payload, null, 2)}
                            </pre>
                          </div>
                        </details>
                      ) : (
                        <span className="text-gray-400">No payload</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        {autoRefresh && !loading && (
          <p>Auto-refreshing every 30 seconds. Last updated: {new Date().toLocaleTimeString()}</p>
        )}
      </div>
    </div>
  );
};

export default ReceiptsPane;
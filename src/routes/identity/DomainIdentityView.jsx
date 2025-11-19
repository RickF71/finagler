import React from 'react';
import { ArrowLeft, Shield, ExternalLink, FileText, Settings, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useDomainIdentity } from '../../hooks/useDomainIdentity';

/**
 * DomainIdentityView - Domain-Scoped Identity Projection
 * GOV-11E: Shows a single domain's view of an actor's identity
 */
export default function DomainIdentityView() {
  const { setView, viewData } = useUI();
  const { domainId, actorId } = viewData || {};
  
  const {
    domainIdentity,
    localIdentity,
    acceptedIdentities,
    receiptCount,
    integrityValid,
    lastActivity,
    loading,
    error,
    fetchedAt
  } = useDomainIdentity(domainId, actorId);

  if (loading) {
    return (
      <div className="domain-identity-view loading">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading domain identity...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="domain-identity-view error">
        <div className="p-8 text-center">
          <Shield className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Identity Not Found</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => setView('identity')}
            className="text-blue-600 hover:text-blue-800 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Identity Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="domain-identity-view max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => setView('identity')}
          className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Overview
        </button>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Domain Identity</h1>
              <div className="space-y-1 text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="font-semibold mr-2">Domain:</span>
                  <span className="font-mono">{domainIdentity?.domain_name || domainId}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="font-semibold mr-2">Actor:</span>
                  <span className="font-mono">{actorId.substring(0, 12)}...</span>
                </div>
              </div>
            </div>
            
            <div className={`flex items-center px-4 py-2 rounded-lg ${
              integrityValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {integrityValid ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              <span className="font-semibold">
                {integrityValid ? 'Valid Chain' : 'Integrity Issues'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Local Identity Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Local Domain Identity</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Domain Identity ID</label>
            <div className="mt-1 text-base text-gray-900 font-mono">
              {localIdentity || <span className="text-gray-400">Not assigned</span>}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Trust State</label>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                integrityValid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {integrityValid ? 'Trusted' : 'Pending Verification'}
              </span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Receipt Count</label>
            <div className="mt-1 text-base text-gray-900">{receiptCount}</div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Last Activity</label>
            <div className="mt-1 text-base text-gray-900">
              {lastActivity ? new Date(lastActivity).toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Foreign Identity Acceptances */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Foreign Identity Acceptances
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({acceptedIdentities.length})
          </span>
        </h2>
        
        {acceptedIdentities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ExternalLink className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No foreign identities accepted</p>
            <p className="text-sm mt-1">This domain has not accepted any external identities yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Source Domain
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    External Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Channel
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Scope
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Accepted
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {acceptedIdentities.map((acceptance, idx) => (
                  <tr key={acceptance.receipt_id || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {acceptance.source_domain_name || 
                        <span className="font-mono text-xs">{acceptance.source_domain_id?.substring(0, 8)}...</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                      {acceptance.external_subject}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {acceptance.channel || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {acceptance.method || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {acceptance.scope || 'default'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {acceptance.revoked_at ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Revoked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(acceptance.accepted_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Identity Receipt History */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Identity Receipt History
        </h2>
        
        {domainIdentity?.receipts && domainIdentity.receipts.length > 0 ? (
          <div className="space-y-2">
            {domainIdentity.receipts.map((receipt) => (
              <div key={receipt.id} className="border border-gray-200 rounded p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-mono text-xs text-gray-500">{receipt.id.substring(0, 8)}...</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm font-medium text-gray-900">{receipt.action}</span>
                    </div>
                    {receipt.target_domain_name && (
                      <div className="text-xs text-gray-600 mt-1">
                        Target: {receipt.target_domain_name}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(receipt.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No receipts available</p>
          </div>
        )}
      </div>

      {/* Action Buttons (UI Only - Disabled) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            disabled
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed inline-flex items-center"
            title="Coming soon"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Request Identity Update
          </button>
          
          <button
            disabled
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed inline-flex items-center"
            title="Coming soon"
          >
            <Settings className="w-4 h-4 mr-2" />
            View REGO Identity Policy
          </button>
          
          <button
            disabled
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed inline-flex items-center"
            title="Coming soon"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Raw Identity Receipts
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          These actions will be enabled in a future release
        </p>
      </div>

      {fetchedAt && (
        <div className="mt-4 text-xs text-gray-500 text-right">
          Last updated: {new Date(fetchedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

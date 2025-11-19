import React, { useState } from 'react';
import { ArrowLeft, Shield, FileText, AlertCircle, CheckCircle, Clock, Hash, RefreshCw, ExternalLink } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useDomain } from '../../context/DomainContext';
import { useIdentityPolicy } from '../../hooks/useIdentityPolicy';
import { useAuthorityReceipts } from '../../hooks/useAuthorityReceipts';
import JsonPreview from '../../components/Shared/JsonPreview';

/**
 * IdentityPolicyView - Domain-scoped Identity Policy Viewer
 * GOV-11F: Displays effective identity policy with inheritance and receipts
 */
export default function IdentityPolicyView() {
  const { setView } = useUI();
  const { activeDomainId, domain } = useDomain();
  const { policy, loading, error, refetch } = useIdentityPolicy(activeDomainId);
  const { receipts, loading: receiptsLoading } = useAuthorityReceipts(activeDomainId, { kind: 'policy', limit: 10 });
  const [activeTab, setActiveTab] = useState('effective');

  if (loading) {
    return (
      <div className="identity-policy-view loading">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading identity policy...</span>
        </div>
      </div>
    );
  }

  if (error && !policy) {
    return (
      <div className="identity-policy-view error">
        <div className="p-8 text-center">
          <Shield className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Policy Load Failed</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isMock = policy?.source === 'mock';
  const hasParent = policy?.parent_policy_ref !== null;

  return (
    <div className="identity-policy-view max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => setView('identity')}
          className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Identity Overview
        </button>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Identity Policy</h1>
              <p className="text-sm text-gray-600 mb-3">
                Effective identity policy for this domain
              </p>
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-sm text-gray-700">
                  <Shield className="w-4 h-4 mr-1 text-blue-600" />
                  <span className="font-semibold">{domain?.name || policy?.domain_name || 'Unknown Domain'}</span>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {activeDomainId?.substring(0, 12)}...
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
              <span className="text-xs text-gray-500 uppercase font-semibold">Read-only</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                isMock ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {isMock ? 'Mock Data' : 'Live'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner for Mock Data */}
      {isMock && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Displaying mock policy data. Backend endpoint not yet fully implemented.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Effective Policy Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Effective Policy Summary</h2>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Policy Version</label>
              <div className="mt-1 text-sm text-gray-900 font-mono">
                {policy?.policy_version || 'N/A'}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Digest</label>
              <div className="mt-1 flex items-center">
                <Hash className="w-4 h-4 mr-2 text-gray-400" />
                <div className="text-xs text-gray-900 font-mono break-all">
                  {policy?.digest || 'N/A'}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Last Updated</label>
              <div className="mt-1 flex items-center text-sm text-gray-900">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                {policy?.updated_at ? new Date(policy.updated_at).toLocaleString() : 'N/A'}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Source</label>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  policy?.source === 'direct' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {policy?.source === 'direct' ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Direct
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {policy?.source || 'Unknown'}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inheritance Overview */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inheritance Overview</h2>
          
          {hasParent ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Current Domain</label>
                <div className="mt-1 text-sm text-gray-900 font-semibold">
                  {domain?.name || policy?.domain_name || 'Unknown'}
                </div>
              </div>

              <div className="flex items-center text-gray-400">
                <div className="border-t border-gray-300 flex-1"></div>
                <span className="px-3 text-xs">inherits from</span>
                <div className="border-t border-gray-300 flex-1"></div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Parent Domain</label>
                <div className="mt-1">
                  <div className="text-sm text-gray-900 font-semibold">
                    {policy.parent_policy_ref.domain_name}
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-1">
                    {policy.parent_policy_ref.domain_id?.substring(0, 12)}...
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Parent Digest</label>
                <div className="mt-1 text-xs text-gray-600 font-mono break-all">
                  {policy.parent_policy_ref.digest}
                </div>
              </div>

              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Parent link verified
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No parent domain</p>
              <p className="text-xs mt-1">This is a root domain or has no parent policy</p>
            </div>
          )}
        </div>
      </div>

      {/* Policy Content Tabs */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('effective')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'effective'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Effective Policy
            </button>
            
            <button
              onClick={() => setActiveTab('local')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'local'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Local Policy
            </button>
            
            <button
              onClick={() => setActiveTab('parent')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'parent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              disabled={!hasParent}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Parent Policy
              {!hasParent && <span className="ml-2 text-xs">(none)</span>}
            </button>
            
            <button
              onClick={() => setActiveTab('receipts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'receipts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Receipts
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'effective' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                The merged policy combining parent and local overrides.
              </p>
              <JsonPreview 
                data={policy?.effective_policy || {}} 
                title="Effective Policy JSON"
              />
            </div>
          )}

          {activeTab === 'local' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Policy defined specifically for this domain (overrides parent).
              </p>
              <JsonPreview 
                data={policy?.local_policy || {}} 
                title="Local Policy JSON"
              />
            </div>
          )}

          {activeTab === 'parent' && hasParent && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Policy inherited from parent domain.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Parent Domain</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {policy.parent_policy_ref.domain_name}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Domain ID</label>
                    <div className="mt-1 text-xs text-gray-700 font-mono">
                      {policy.parent_policy_ref.domain_id}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Policy Digest</label>
                    <div className="mt-1 text-xs text-gray-700 font-mono break-all">
                      {policy.parent_policy_ref.digest}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Version</label>
                    <div className="mt-1 text-xs text-gray-700 font-mono">
                      {policy.parent_policy_ref.version}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  <p>Full parent policy content not available in this view.</p>
                  <p className="mt-1">Navigate to parent domain to view complete policy.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'receipts' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Authority receipts related to policy changes for this domain.
              </p>
              
              {receiptsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading receipts...</p>
                </div>
              ) : receipts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No policy receipts found</p>
                  <p className="text-xs mt-1">Policy changes will appear here when available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Timestamp
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Action
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Digest
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {receipts.map((receipt) => (
                        <tr key={receipt.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center text-xs text-gray-900">
                              <Clock className="w-3 h-3 mr-1 text-gray-400" />
                              {receipt.created_at ? new Date(receipt.created_at).toLocaleString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {receipt.action || receipt.receipt_type || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-xs text-gray-600 font-mono">
                              {receipt.hash ? receipt.hash.substring(0, 12) + '...' : 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              receipt.verified || receipt.integrity_valid
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {receipt.verified || receipt.integrity_valid ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </>
                              ) : (
                                'Pending'
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                            <button
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center text-xs"
                              title="View full receipt"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {receipts.length >= 10 && (
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">
                        Showing last 10 receipts.{' '}
                        <button className="text-blue-600 hover:text-blue-800">View all</button>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <Shield className="w-5 h-5 text-blue-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Policy Editing</h3>
            <p className="text-sm text-blue-700 mt-1">
              Policy editing will be enabled in a future phase. This view is currently read-only for verification and audit purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

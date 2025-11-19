import React from 'react';
import { UserCircle, Shield, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useIdentityProjections } from '../../hooks/useIdentityProjections';

/**
 * IdentityOverview - Global Identity Dashboard
 * GOV-11E: Shows cross-domain identity projections for the current actor
 */
export default function IdentityOverview() {
  const { setView, setViewData } = useUI();
  
  // TODO: Get actor_id from authentication context or active user
  // For now, using a placeholder - integrate with FinaglerContext/auth
  const actorId = 'current-user-actor-id'; // REPLACE with actual context
  
  const { 
    projections, 
    integrity, 
    totalDomains, 
    totalReceipts, 
    loading, 
    error,
    fetchedAt 
  } = useIdentityProjections(actorId);

  const getIntegrityColor = (status) => {
    switch (status) {
      case 'all-valid': return 'text-green-600';
      case 'some-broken': return 'text-red-600';
      case 'no-data': return 'text-gray-400';
      default: return 'text-yellow-600';
    }
  };

  const getIntegrityIcon = (status) => {
    switch (status) {
      case 'all-valid': return <CheckCircle className="w-5 h-5" />;
      case 'some-broken': return <AlertTriangle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="identity-overview loading">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading identity projections...</span>
        </div>
      </div>
    );
  }

  if (error && projections.length === 0) {
    return (
      <div className="identity-overview error">
        <div className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Identity</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="identity-overview">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <UserCircle className="w-10 h-10 text-blue-600 mr-4" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Identity Overview</h1>
              <p className="text-sm text-gray-500 font-mono mt-1">
                DIS ID: {actorId.substring(0, 8)}...{actorId.slice(-8)}
              </p>
            </div>
          </div>
          
          <div className={`flex items-center ${getIntegrityColor(integrity)}`}>
            {getIntegrityIcon(integrity)}
            <span className="ml-2 font-semibold capitalize">
              {integrity.replace('-', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{totalDomains}</div>
            <div className="text-sm text-gray-600">Domains</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{totalReceipts}</div>
            <div className="text-sm text-gray-600">Total Receipts</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">
              {projections.reduce((sum, p) => sum + (p.accepted_identities?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Foreign Acceptances</div>
          </div>
        </div>
      </div>

      {/* Cross-Domain Identity Graph Placeholder */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Identity Graph</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Graph rendering coming soon.</p>
          <p className="text-sm mt-1">Visual representation of cross-domain identity relationships</p>
        </div>
      </div>

      {/* Domain Projection Table */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Domain Projections</h2>
        
        {projections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No identity projections found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local Identity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Foreign
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projections.map((projection) => (
                  <tr key={projection.domain_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {projection.domain_name || 'Unknown Domain'}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {projection.domain_id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {projection.local_identity || <span className="text-gray-400">Not set</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        projection.integrity_valid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {projection.integrity_valid ? 'Valid' : 'Issues'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {projection.receipt_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {projection.accepted_identities?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setViewData({ domainId: projection.domain_id, actorId });
                          setView('identity-domain');
                        }}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        Open
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Corporeal Authentication Log Button */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Corporeal Authentication Log</h3>
            <p className="text-sm text-gray-600 mt-1">
              Private log of IRL authentication events
            </p>
          </div>
          <button
            onClick={() => setView('identity-corporeal')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            View Log
            <ExternalLink className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {fetchedAt && (
        <div className="mt-4 text-xs text-gray-500 text-right">
          Last updated: {new Date(fetchedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

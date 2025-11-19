import React from 'react';
import { ArrowLeft, Shield, Fingerprint, Smartphone, Clock, MapPin, FileText, AlertCircle } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useCorporealIdentityLog } from '../../hooks/useCorporealIdentityLog';

/**
 * CorporealAuthLog - Private IRL Authentication Log Viewer
 * GOV-11E: Shows corporeal domain authentication events for the current actor
 * ACCESS: PRIVATE - only the actor can view their own log
 */
export default function CorporealAuthLog() {
  const { setView } = useUI();
  
  // TODO: Get actor_id from authentication context
  // For now, using placeholder - integrate with FinaglerContext/auth
  const actorId = 'current-user-actor-id'; // REPLACE with actual context
  
  const { logEntries, count, loading, error, fetchedAt } = useCorporealIdentityLog(actorId);

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'biometric':
      case 'fingerprint':
      case 'facial':
        return <Fingerprint className="w-5 h-5" />;
      case 'passkey':
      case 'fido2':
        return <Shield className="w-5 h-5" />;
      case 'mobile':
      case 'mobile_app':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getMethodColor = (method) => {
    switch (method?.toLowerCase()) {
      case 'biometric':
      case 'fingerprint':
      case 'facial':
        return 'text-purple-600 bg-purple-50';
      case 'passkey':
      case 'fido2':
        return 'text-blue-600 bg-blue-50';
      case 'mobile':
      case 'mobile_app':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="corporeal-auth-log loading">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading authentication log...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="corporeal-auth-log max-w-6xl mx-auto p-6">
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Corporeal Authentication Log
              </h1>
              <p className="text-sm text-gray-600">
                Private record of in-real-life identity verification events
              </p>
            </div>
            
            <div className="flex items-center px-4 py-2 rounded-lg bg-purple-100 text-purple-800">
              <Shield className="w-5 h-5 mr-2" />
              <span className="font-semibold">Private</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-900">
                {new Set(logEntries.map(e => e.corporeal_domain_id)).size}
              </div>
              <div className="text-sm text-gray-600">Unique Domains</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-900">
                {new Set(logEntries.map(e => e.method)).size}
              </div>
              <div className="text-sm text-gray-600">Auth Methods</div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner if Using Mock Data */}
      {error && error.includes('placeholder') && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Displaying sample data. Backend endpoint not yet implemented.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Log Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication Events</h2>
        
        {logEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No authentication events recorded</p>
            <p className="text-sm mt-1">IRL authentication events will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(entry.logged_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.corporeal_domain_name || 'Unknown'}
                          </div>
                          {entry.corporeal_domain_id && (
                            <div className="text-xs text-gray-500 font-mono">
                              {entry.corporeal_domain_id.substring(0, 8)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMethodColor(entry.method)}`}>
                        {getMethodIcon(entry.method)}
                        <span className="ml-2 capitalize">{entry.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {entry.channel || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.target_domain_name ? (
                        <div>
                          <div className="text-sm text-gray-900">{entry.target_domain_name}</div>
                          {entry.target_domain_id && (
                            <div className="text-xs text-gray-500 font-mono">
                              {entry.target_domain_id.substring(0, 8)}...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.receipt_id ? (
                        <span className="text-sm font-mono text-gray-600">
                          {entry.receipt_id.substring(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Metadata Expansion (Optional) */}
        {logEntries.length > 0 && logEntries.some(e => e.metadata) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Event Details</h3>
            <div className="space-y-3">
              {logEntries.filter(e => e.metadata).map((entry) => (
                <details key={entry.id} className="group">
                  <summary className="cursor-pointer text-sm text-gray-700 hover:text-gray-900 flex items-center">
                    <span className="font-mono text-xs text-gray-500 mr-2">
                      {entry.id.substring(0, 8)}...
                    </span>
                    <span>Metadata</span>
                    <span className="ml-2 text-gray-400 group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  <div className="mt-2 ml-4 p-3 bg-gray-50 rounded border border-gray-200">
                    <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(entry.metadata, null, 2)}
                    </pre>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <Shield className="w-5 h-5 text-blue-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Privacy Notice</h3>
            <p className="text-sm text-blue-700 mt-1">
              This log is private to you and your corporeal domain. Only you can view these authentication events.
              IRL authentication data is never shared with other domains without explicit consent.
            </p>
          </div>
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

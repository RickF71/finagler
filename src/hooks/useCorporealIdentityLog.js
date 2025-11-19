import { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * useCorporealIdentityLog - Hook for fetching private IRL authentication log
 * GOV-11E: Fetches corporeal domain's private identity authentication log
 * 
 * @param {string} actorId - The actor's UUID
 * @returns {object} { logEntries, error, loading, fetchedAt }
 */
export function useCorporealIdentityLog(actorId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);

  useEffect(() => {
    if (!actorId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchLog = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from corporeal identity log endpoint
        // If endpoint doesn't exist yet, use mock data
        try {
          const response = await api.get(`/api/corporeal/identity/log/${actorId}`);
          
          if (isMounted) {
            setData(response.data || []);
            setFetchedAt(new Date().toISOString());
            setLoading(false);
          }
        } catch (apiErr) {
          // If endpoint not implemented (404/501), provide placeholder
          if (apiErr.response?.status === 404 || apiErr.response?.status === 501) {
            console.info('Corporeal identity log endpoint not yet implemented, using placeholder');
            
            if (isMounted) {
              // Mock data structure for development
              setData([
                {
                  id: 'mock-1',
                  actor_id: actorId,
                  corporeal_domain_id: 'mock-corporeal-domain',
                  target_domain_id: 'mock-target-domain',
                  target_domain_name: 'Example Bank',
                  method: 'biometric',
                  channel: 'mobile_app',
                  logged_at: new Date(Date.now() - 86400000).toISOString(),
                  receipt_id: 'mock-receipt-1',
                  metadata: { session_id: 'xyz123', location: 'redacted' },
                },
                {
                  id: 'mock-2',
                  actor_id: actorId,
                  corporeal_domain_id: 'mock-corporeal-domain',
                  target_domain_id: 'mock-target-domain-2',
                  target_domain_name: 'Healthcare Provider',
                  method: 'passkey',
                  channel: 'kiosk',
                  logged_at: new Date(Date.now() - 172800000).toISOString(),
                  receipt_id: 'mock-receipt-2',
                  metadata: { session_id: 'abc456' },
                },
              ]);
              setFetchedAt(new Date().toISOString());
              setError('Using placeholder data (endpoint not yet implemented)');
              setLoading(false);
            }
          } else {
            throw apiErr;
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch corporeal identity log:', err);
          setError(err.message || 'Failed to fetch corporeal identity log');
          setLoading(false);
        }
      }
    };

    fetchLog();

    return () => {
      isMounted = false;
    };
  }, [actorId]);

  return {
    logEntries: data,
    count: data.length,
    error,
    loading,
    fetchedAt,
  };
}

export default useCorporealIdentityLog;

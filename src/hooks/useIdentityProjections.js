import { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * useIdentityProjections - Hook for fetching identity projections across all domains
 * GOV-11E: Fetches comprehensive identity projection summary for an actor
 * 
 * @param {string} actorId - The actor's UUID
 * @returns {object} { projections, integrity, receipts, error, loading, fetchedAt }
 */
export function useIdentityProjections(actorId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);

  useEffect(() => {
    if (!actorId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchProjections = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/api/identity/projections/${actorId}`);
        
        if (isMounted) {
          setData(response.data);
          setFetchedAt(new Date().toISOString());
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch identity projections:', err);
          
          // Handle 404 gracefully
          if (err.response?.status === 404) {
            setError('No identity projections found for this actor');
            setData({ 
              actor_id: actorId,
              projections: [], 
              total_domains: 0, 
              total_receipts: 0,
              integrity_status: 'no-data'
            });
          } else {
            setError(err.message || 'Failed to fetch identity projections');
          }
          setLoading(false);
        }
      }
    };

    fetchProjections();

    return () => {
      isMounted = false;
    };
  }, [actorId]);

  return {
    projections: data?.projections || [],
    integrity: data?.integrity_status || 'unknown',
    totalDomains: data?.total_domains || 0,
    totalReceipts: data?.total_receipts || 0,
    actorId: data?.actor_id,
    error,
    loading,
    fetchedAt,
    rawData: data,
  };
}

export default useIdentityProjections;

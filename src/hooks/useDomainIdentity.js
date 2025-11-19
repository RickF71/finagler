import { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * useDomainIdentity - Hook for fetching domain-scoped identity projection
 * GOV-11E: Fetches a single domain's view of an actor's identity
 * 
 * @param {string} domainId - The domain's UUID
 * @param {string} actorId - The actor's UUID
 * @returns {object} { domainIdentity, error, loading, fetchedAt }
 */
export function useDomainIdentity(domainId, actorId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);

  useEffect(() => {
    if (!domainId || !actorId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchDomainIdentity = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/api/domain/${domainId}/member/${actorId}/identity`);
        
        if (isMounted) {
          setData(response.data);
          setFetchedAt(new Date().toISOString());
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch domain identity:', err);
          
          // Handle 404 gracefully
          if (err.response?.status === 404) {
            setError('No identity projection found for this domain and actor');
          } else {
            setError(err.message || 'Failed to fetch domain identity');
          }
          setLoading(false);
        }
      }
    };

    fetchDomainIdentity();

    return () => {
      isMounted = false;
    };
  }, [domainId, actorId]);

  return {
    domainIdentity: data,
    localIdentity: data?.local_identity,
    acceptedIdentities: data?.accepted_identities || [],
    receiptCount: data?.receipt_count || 0,
    integrityValid: data?.integrity_valid !== false,
    lastActivity: data?.last_activity,
    error,
    loading,
    fetchedAt,
  };
}

export default useDomainIdentity;

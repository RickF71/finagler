import { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * useIdentityPolicy - Fetch identity policy for a domain
 * GOV-11F: Provides effective identity policy with parent inheritance
 * 
 * @param {string} domainId - Domain ID to fetch policy for
 * @returns {Object} { policy, loading, error, refetch }
 */
export function useIdentityPolicy(domainId) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPolicy = async () => {
    if (!domainId) {
      setPolicy(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/policy/identity/${domainId}`);
      setPolicy(response.data);
    } catch (err) {
      // Check if endpoint is not implemented (404 or 501)
      if (err.response?.status === 404 || err.response?.status === 501) {
        console.info('Identity policy endpoint not yet implemented, using mock data');
        
        // Provide mock policy data
        setPolicy({
          domain_id: domainId,
          domain_name: 'Unknown Domain',
          policy_version: 'domain.policy.v1.mock',
          local_policy: {
            note: 'Mock identity policy; backend not yet implemented.',
            allow_foreign_identities: true,
            require_corporeal_verification: false,
          },
          parent_policy_ref: null,
          effective_policy: {
            note: 'Mock effective policy.',
            allow_foreign_identities: true,
            require_corporeal_verification: false,
          },
          digest: 'sha256:mock',
          updated_at: new Date().toISOString(),
          source: 'mock',
        });
        
        setError('Using mock data (endpoint not yet implemented)');
      } else {
        console.error('Failed to fetch identity policy:', err);
        setError(err.message || 'Failed to fetch identity policy');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      await fetchPolicy();
    };

    if (isMounted) {
      load();
    }

    return () => {
      isMounted = false;
    };
  }, [domainId]);

  // Manual refetch function
  const refetch = () => {
    fetchPolicy();
  };

  return {
    policy,
    loading,
    error,
    refetch,
  };
}

export default useIdentityPolicy;

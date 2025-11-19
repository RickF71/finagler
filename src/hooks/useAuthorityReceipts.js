import { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * useAuthorityReceipts - Fetch authority receipts with optional filters
 * GOV-11F: Used for connecting identity policy changes to receipt ledger
 * 
 * @param {string} domainId - Domain ID to filter by
 * @param {object} options - Optional filters { kind, limit }
 * @returns {Object} { receipts, loading, error, refetch }
 */
export function useAuthorityReceipts(domainId, options = {}) {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { kind = null, limit = 10 } = options;

  const fetchReceipts = async () => {
    if (!domainId) {
      setReceipts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('domain_id', domainId);
      if (kind) params.append('kind', kind);
      if (limit) params.append('limit', limit);

      const response = await api.get(`/api/receipts/list?${params.toString()}`);
      setReceipts(response.data?.receipts || []);
    } catch (err) {
      // If receipts endpoint not available, provide empty array
      if (err.response?.status === 404 || err.response?.status === 501) {
        console.info('Authority receipts endpoint not available, using empty array');
        setReceipts([]);
        setError('Receipts not available');
      } else {
        console.error('Failed to fetch authority receipts:', err);
        setError(err.message || 'Failed to fetch receipts');
        setReceipts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      await fetchReceipts();
    };

    if (isMounted) {
      load();
    }

    return () => {
      isMounted = false;
    };
  }, [domainId, kind, limit]);

  // Manual refetch function
  const refetch = () => {
    fetchReceipts();
  };

  return {
    receipts,
    loading,
    error,
    refetch,
  };
}

export default useAuthorityReceipts;

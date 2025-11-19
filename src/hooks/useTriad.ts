// GOV-2: React hook for fetching identity triad
import { useEffect, useState } from 'react';
import { fetchTriad, type IdentityTriad } from '../lib/api/authorityClient';

interface UseTriadResult {
  data: IdentityTriad | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch and monitor identity triad (terra/numen/lima seats)
 */
export function useTriad(
  baseUrl: string,
  identityId?: string
): UseTriadResult {
  const [data, setData] = useState<IdentityTriad | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (!identityId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    
    setLoading(true);
    setError(null);
    
    fetchTriad(baseUrl, identityId)
      .then((result: IdentityTriad) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err as Error);
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [baseUrl, identityId, refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return { data, loading, error, refetch };
}

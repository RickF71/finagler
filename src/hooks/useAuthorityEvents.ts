// GOV-3: React hook for authority SSE events
import { useEffect } from 'react';
import { subscribeAuthorityEvents, type SeatChangeEvent } from '../lib/api/sse';

/**
 * Hook to subscribe to authority events via SSE
 * @param baseUrl Base URL of the API server
 * @param onSeatChange Callback for seat change events
 */
export function useAuthorityEvents(
  baseUrl: string,
  onSeatChange: (event: SeatChangeEvent) => void
): void {
  useEffect(() => {
    if (!baseUrl) return;

    const unsubscribe = subscribeAuthorityEvents(baseUrl, (event) => {
      if (event.type === 'seat.change') {
        onSeatChange(event);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [baseUrl, onSeatChange]);
}

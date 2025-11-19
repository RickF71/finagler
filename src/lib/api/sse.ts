// GOV-3/GOV-5/GOV-6: Server-Sent Events (SSE) client for authority events

export interface SeatChangeEvent {
  type: 'seat.change';
  identity_id: string;
  layer: string;
  from: string;
  to: string;
  decision_id?: string;
  receipt_id?: string;
  cas_prev?: number;    // GOV-5: Previous CAS version
  cas_new?: number;     // GOV-5: New CAS version
  cas_ok: boolean;      // GOV-5: CAS success indicator
  synthetic?: boolean;  // GOV-6: Synthetic domain flag
  message?: string;     // GOV-6: Synthetic domain message
  timestamp: string;
}

/**
 * Subscribe to authority events via SSE
 * @param baseUrl Base URL of the API server
 * @param onMessage Callback for each event
 * @returns Cleanup function to close the connection
 */
export function subscribeAuthorityEvents(
  baseUrl: string,
  onMessage: (event: SeatChangeEvent) => void
): () => void {
  const url = `${baseUrl}/api/authority/events`;
  const eventSource = new EventSource(url);

  // Handle seat change events
  eventSource.addEventListener('seat', (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data) as SeatChangeEvent;
      onMessage(data);
    } catch (err) {
      console.error('Failed to parse SSE event:', err);
    }
  });

  // Handle connection events
  eventSource.addEventListener('connected', (e: MessageEvent) => {
    console.log('SSE connected:', e.data);
  });

  // Handle errors
  eventSource.onerror = (err) => {
    console.error('SSE error:', err);
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

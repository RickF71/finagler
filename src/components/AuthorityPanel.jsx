// GOV-2: Minimal read-only Authority Console UI
// GOV-3: Auto-refresh on SSE events
// GOV-5: CAS version tracking and conflict indicators
import React, { useCallback, useState } from 'react';
import { useTriad } from '../hooks/useTriad';
import { useAuthorityEvents } from '../hooks/useAuthorityEvents';

const SEAT_COLORS = {
  EMPTY: '#6b7280',     // gray-500
  ASSIGNED: '#3b82f6',  // blue-500
  OCCUPIED: '#10b981',  // green-500
  FROZEN: '#ef4444',    // red-500
};

const SEAT_LABELS = {
  terra: '🌍 Terra (Existence)',
  numen: '✨ Numen (Meaning)',
  lima: '🤝 Lima (Authority)',
};

function SeatCard({ label, seat, recentEvent }) {
  if (!seat) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <div className="font-semibold text-gray-700">{label}</div>
        <div className="text-sm text-gray-500 mt-2">No seat data</div>
      </div>
    );
  }

  const color = SEAT_COLORS[seat.state] || SEAT_COLORS.EMPTY;
  
  return (
    <div 
      className="p-4 border rounded transition-all"
      style={{ borderColor: color, backgroundColor: `${color}10` }}
    >
      <div className="font-semibold" style={{ color }}>
        {label}
      </div>
      <div className="text-sm mt-2">
        <span 
          className="inline-block px-2 py-1 rounded text-white text-xs font-medium"
          style={{ backgroundColor: color }}
        >
          {seat.state}
        </span>
      </div>
      
      {/* GOV-5: CAS version indicator */}
      {recentEvent && recentEvent.cas_new !== undefined && (
        <div className="mt-2 text-xs">
          <div className="flex items-center gap-1 text-gray-600">
            <span>CAS: v{recentEvent.cas_prev} → v{recentEvent.cas_new}</span>
            {!recentEvent.cas_ok && (
              <span className="text-red-600 font-bold" title="CAS conflict detected">⚠️</span>
            )}
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-600 mt-2">
        ID: {seat.id.slice(0, 8)}...
      </div>
      {seat.assigned_at && (
        <div className="text-xs text-gray-500 mt-1">
          Assigned: {new Date(seat.assigned_at).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export function AuthorityPanel({ baseUrl = 'http://localhost:8080', identityId }) {
  const { data, loading, error, refetch } = useTriad(baseUrl, identityId);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [casConflict, setCasConflict] = useState<boolean>(false);
  const [syntheticWarning, setSyntheticWarning] = useState<string>('');

  // GOV-3/GOV-5/GOV-6: Subscribe to SSE events and auto-refresh on relevant changes
  const handleSeatChange = useCallback((event) => {
    if (event.identity_id === identityId) {
      // GOV-5: Track CAS conflict status
      if (event.cas_ok === false) {
        setCasConflict(true);
        setTimeout(() => setCasConflict(false), 5000); // Clear after 5 seconds
      }
      
      // GOV-6: Track synthetic domain decisions
      if (event.synthetic) {
        setSyntheticWarning(event.message || 'Decision from synthetic domain');
        setTimeout(() => setSyntheticWarning(''), 8000); // Clear after 8 seconds
      }
      
      setLastEvent(event);
      setLastUpdate(`${event.layer} → ${event.to} at ${new Date(event.timestamp).toLocaleTimeString()}`);
      
      // Show decision/receipt IDs if available
      if (event.decision_id || event.receipt_id) {
        const ids = [];
        if (event.decision_id) ids.push(`Decision: ${event.decision_id.slice(0, 8)}`);
        if (event.receipt_id) ids.push(`Receipt: ${event.receipt_id.slice(0, 8)}`);
        console.log('GOV-5/GOV-6 Event:', ids.join(', '), event);
      }
      
      // Trigger refetch when this identity's seats change
      refetch();
    }
  }, [identityId, refetch]);

  useAuthorityEvents(baseUrl, handleSeatChange);

  if (!identityId) {
    return (
      <div className="p-6 border rounded bg-gray-50">
        <div className="text-gray-500">No identity selected</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 border rounded bg-blue-50">
        <div className="text-blue-700">Loading triad for {identityId}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border rounded bg-red-50">
        <div className="text-red-700 font-semibold">Error loading triad</div>
        <div className="text-sm text-red-600 mt-2">{error.message}</div>
        <button 
          onClick={refetch}
          className="mt-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 border rounded bg-yellow-50">
        <div className="text-yellow-700">No triad data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          Identity Triad: {data.identity_id}
        </h2>
        <button 
          onClick={refetch}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          Refresh
        </button>
      </div>

      {/* GOV-5: CAS Conflict Alert */}
      {casConflict && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-800">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="font-semibold">CAS Conflict Detected</div>
              <div className="text-sm text-red-700">
                A concurrent modification was detected. The operation may need to be retried.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GOV-6: Synthetic Domain Warning */}
      {syntheticWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="font-semibold">Synthetic Domain</div>
              <div className="text-sm text-yellow-700">
                {syntheticWarning}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SeatCard 
          label={SEAT_LABELS.terra} 
          seat={data.terra} 
          recentEvent={lastEvent?.layer === 'terra' ? lastEvent : null}
        />
        <SeatCard 
          label={SEAT_LABELS.numen} 
          seat={data.numen}
          recentEvent={lastEvent?.layer === 'numen' ? lastEvent : null}
        />
        <SeatCard 
          label={SEAT_LABELS.lima} 
          seat={data.lima}
          recentEvent={lastEvent?.layer === 'lima' ? lastEvent : null}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        {data.timestamp && (
          <div>
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </div>
        )}
        {lastUpdate && (
          <div className="text-green-600 font-medium">
            ⚡ {lastUpdate}
            {lastEvent?.decision_id && (
              <span className="ml-2 text-gray-500">
                Decision: {lastEvent.decision_id.slice(0, 8)}...
              </span>
            )}
            {lastEvent?.receipt_id && (
              <span className="ml-2 text-gray-500">
                Receipt: {lastEvent.receipt_id.slice(0, 8)}...
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

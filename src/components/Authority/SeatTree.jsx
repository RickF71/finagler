import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';

/**
 * SeatTree - Hierarchical seat management component for Phase S6
 * Displays root and member seats with status indicators and management actions
 */
const SeatTree = ({ domainId, onEditRego, onSelectSeat }) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => {
    if (domainId) {
      fetchSeats();
    }
  }, [domainId]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8080/api/domain/${domainId}/seats`);
      if (!response.ok) {
        throw new Error(`Failed to fetch seats: ${response.statusText}`);
      }
      const data = await response.json();
      setSeats(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFreeze = async (seatId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/domain/${domainId}/seats/${seatId}/freeze`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Failed to freeze seat');
      fetchSeats(); // Refresh
    } catch (err) {
      alert(`Error freezing seat: ${err.message}`);
    }
  };

  const handleUnfreeze = async (seatId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/domain/${domainId}/seats/${seatId}/unfreeze`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Failed to unfreeze seat');
      fetchSeats(); // Refresh
    } catch (err) {
      alert(`Error unfreezing seat: ${err.message}`);
    }
  };

  const handleSelectSeat = (seat) => {
    setSelectedSeat(seat);
    if (onSelectSeat) {
      onSelectSeat(seat);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      frozen: 'destructive',
      detached: 'secondary',
    };
    const icons = {
      active: '🟢',
      frozen: '🔴',
      detached: '⚫',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {icons[status] || '○'} {status}
      </Badge>
    );
  };

  const getSeatIcon = (seatType) => {
    return seatType === 'root' ? '👑' : '👤';
  };

  const rootSeats = seats.filter((s) => s.seat_type === 'root');
  const memberSeats = seats.filter((s) => s.seat_type === 'member');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading seats...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">Error: {error}</div>
          <Button onClick={fetchSeats} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Domain Seats ({seats.length})</span>
            <Button onClick={fetchSeats} variant="outline" size="sm">
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Root Seats */}
          {rootSeats.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">Root Seats</h3>
              <div className="space-y-2">
                {rootSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSeat?.id === seat.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectSeat(seat)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getSeatIcon(seat.seat_type)}</span>
                        <div>
                          <div className="font-medium text-sm">
                            {seat.seat_type.toUpperCase()} SEAT
                          </div>
                          <div className="text-xs text-gray-500">{seat.scope || 'domain'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(seat.status)}
                        {seat.rego_text && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onEditRego) onEditRego(seat);
                            }}
                          >
                            Edit REGO
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member Seats */}
          {memberSeats.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-700">Member Seats</h3>
              <div className="space-y-2">
                {memberSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSeat?.id === seat.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectSeat(seat)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getSeatIcon(seat.seat_type)}</span>
                        <div>
                          <div className="font-medium text-sm">{seat.member_id}</div>
                          <div className="text-xs text-gray-500">
                            {seat.scope} • v{seat.policy_version || 'none'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(seat.status)}
                        {seat.status === 'frozen' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnfreeze(seat.id);
                            }}
                          >
                            Unfreeze
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFreeze(seat.id);
                            }}
                          >
                            Freeze
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEditRego) onEditRego(seat);
                          }}
                        >
                          REGO
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {seats.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No seats found for this domain
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seat Details Panel */}
      {selectedSeat && (
        <Card>
          <CardHeader>
            <CardTitle>Seat Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="font-semibold text-gray-700">Seat ID</dt>
                <dd className="text-gray-600 font-mono text-xs">{selectedSeat.id}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-700">Type</dt>
                <dd className="text-gray-600">{selectedSeat.seat_type}</dd>
              </div>
              {selectedSeat.member_id && (
                <div className="col-span-2">
                  <dt className="font-semibold text-gray-700">Member ID</dt>
                  <dd className="text-gray-600">{selectedSeat.member_id}</dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-gray-700">Status</dt>
                <dd>{getStatusBadge(selectedSeat.status)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-700">Scope</dt>
                <dd className="text-gray-600">{selectedSeat.scope || 'N/A'}</dd>
              </div>
              {selectedSeat.policy_version && (
                <div>
                  <dt className="font-semibold text-gray-700">Policy Version</dt>
                  <dd className="text-gray-600">{selectedSeat.policy_version}</dd>
                </div>
              )}
              <div className="col-span-2">
                <dt className="font-semibold text-gray-700">Created</dt>
                <dd className="text-gray-600">
                  {new Date(selectedSeat.created_at).toLocaleString()}
                </dd>
              </div>
              {selectedSeat.appointment_receipt && (
                <div className="col-span-2">
                  <dt className="font-semibold text-gray-700">Appointment Receipt</dt>
                  <dd className="text-gray-600 font-mono text-xs">
                    {selectedSeat.appointment_receipt}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeatTree;

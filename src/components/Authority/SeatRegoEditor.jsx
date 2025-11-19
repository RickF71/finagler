import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/Button';
import { Alert, AlertDescription } from '../ui/alert';

/**
 * SeatRegoEditor - REGO policy editor for per-seat policies (Phase S6)
 * Uses textarea for now - can be upgraded to Monaco editor later
 */
const SeatRegoEditor = ({ seat, domainId, onSave, onCancel }) => {
  const [regoText, setRegoText] = useState('');
  const [policyVersion, setPolicyVersion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (seat) {
      setRegoText(seat.rego_text || getDefaultRego(seat));
      setPolicyVersion(seat.policy_version || 'v1.0');
    }
  }, [seat]);

  const getDefaultRego = (seat) => {
    return `package dis.seat

# Per-seat policy for ${seat.member_id || 'seat'}
# This policy can tighten restrictions but cannot override base denies

export_allow {
  input.action == "ci.call.v1"
  input.risk < 50
}

export_allow {
  input.action == "ci.import.v1"
  input.risk < 30
}
`;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(
        `http://localhost:8080/api/domain/${domainId}/seats/${seat.id}/rego`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rego_text: regoText,
            policy_version: policyVersion,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save REGO policy');
      }

      const result = await response.json();
      setSuccess(true);
      setTimeout(() => {
        if (onSave) {
          onSave(result);
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  if (!seat) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">No seat selected</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Edit REGO Policy - {seat.member_id || `${seat.seat_type} seat`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Info Banner */}
          <Alert>
            <AlertDescription>
              <strong>Per-Seat Policy Rules:</strong>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Package must be exactly: <code className="bg-gray-100 px-1 rounded">package dis.seat</code></li>
                <li>Use <code className="bg-gray-100 px-1 rounded">export_allow</code> rules to define allowed actions</li>
                <li>Per-seat policies can tighten (deny) but not override base policy denies</li>
                <li>Access <code className="bg-gray-100 px-1 rounded">input.action</code>, <code className="bg-gray-100 px-1 rounded">input.risk</code>, etc.</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Policy Version */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy Version
            </label>
            <input
              type="text"
              value={policyVersion}
              onChange={(e) => setPolicyVersion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="v1.0"
            />
          </div>

          {/* REGO Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              REGO Policy
            </label>
            <textarea
              value={regoText}
              onChange={(e) => setRegoText(e.target.value)}
              className="w-full h-96 px-3 py-2 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter REGO policy..."
            />
            <div className="text-xs text-gray-500 mt-1">
              {regoText.split('\n').length} lines
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert>
              <AlertDescription>
                <strong>Success!</strong> REGO policy saved successfully
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={loading || !regoText.trim()}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save REGO Policy'}
            </Button>
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
          </div>

          {/* Seat Info */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Seat Information</h4>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-gray-500">Seat ID</dt>
                <dd className="font-mono text-xs">{seat.id}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Type</dt>
                <dd>{seat.seat_type}</dd>
              </div>
              {seat.member_id && (
                <div className="col-span-2">
                  <dt className="text-gray-500">Member ID</dt>
                  <dd>{seat.member_id}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="capitalize">{seat.status}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Scope</dt>
                <dd>{seat.scope || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeatRegoEditor;

import React, { useState } from 'react';
import SeatTree from './SeatTree';
import SeatRegoEditor from './SeatRegoEditor';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Tabs } from '../ui/Tabs';

/**
 * AuthorityConsole - Main authority management interface (Phase S6)
 * Integrates seat management and REGO editing
 */
const AuthorityConsole = ({ domainId }) => {
  const [activeTab, setActiveTab] = useState('seats');
  const [editingSeat, setEditingSeat] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const handleEditRego = (seat) => {
    setEditingSeat(seat);
    setActiveTab('rego');
  };

  const handleSaveRego = (result) => {
    console.log('REGO saved:', result);
    setActiveTab('seats');
    setEditingSeat(null);
    // Trigger refresh of seat tree
  };

  const handleCancelRego = () => {
    setEditingSeat(null);
    setActiveTab('seats');
  };

  if (!domainId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-400">
            Select a domain to manage authority seats
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Authority Console - Seat Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('seats')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'seats'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Seats
            </button>
            <button
              onClick={() => setActiveTab('rego')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'rego'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              disabled={!editingSeat && !selectedSeat}
            >
              REGO Editor
            </button>
          </div>

          {activeTab === 'seats' && (
            <SeatTree
              domainId={domainId}
              onEditRego={handleEditRego}
              onSelectSeat={setSelectedSeat}
            />
          )}

          {activeTab === 'rego' && (
            <SeatRegoEditor
              seat={editingSeat || selectedSeat}
              domainId={domainId}
              onSave={handleSaveRego}
              onCancel={handleCancelRego}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthorityConsole;

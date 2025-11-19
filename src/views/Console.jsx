import React from 'react';
import ReceiptsPane from '../components/ReceiptsPane';

const Console = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Console Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              🛡️ Authority Console
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                Live Dashboard
              </span>
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor DIS-Core receipts, transactions, and system health
            </p>
          </div>
        </div>
      </div>

      {/* Console Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ReceiptsPane />
      </div>
    </div>
  );
};

export default Console;
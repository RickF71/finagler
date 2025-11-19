import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * JsonPreview - Read-only JSON viewer with copy functionality
 * GOV-11F: Used for displaying policy JSON in IdentityPolicyView
 */
export default function JsonPreview({ data, title, collapsed = false }) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="json-preview border border-gray-300 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-300">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center"
        >
          <span className={`mr-2 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
          {title || 'JSON'}
        </button>
        
        <button
          onClick={handleCopy}
          className="text-gray-600 hover:text-gray-900 inline-flex items-center text-sm"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* JSON Content */}
      {!isCollapsed && (
        <div className="p-4 bg-gray-900 overflow-x-auto">
          <pre className="text-xs text-gray-100 font-mono whitespace-pre">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
}

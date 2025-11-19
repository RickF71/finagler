import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { parseCSSVariables, isColor, getColorVariations } from "../lib/utils/cssVariables";

const ColorSwatch = ({ color, size = "w-6 h-6" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  if (!isColor(color)) {
    return (
      <div className={`${size} bg-gray-100 border border-gray-300 rounded flex items-center justify-center`}>
        <span className="text-xs text-gray-400">—</span>
      </div>
    );
  }

  const variations = getColorVariations(color);
  
  return (
    <div className="relative">
      <div
        className={`${size} border border-gray-300 rounded cursor-pointer transition-transform hover:scale-110`}
        style={{ backgroundColor: variations.normalized || color }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => {
          navigator.clipboard.writeText(variations.normalized || color);
          toast.success(`Copied ${variations.normalized || color} to clipboard!`);
        }}
        title={`Click to copy ${variations.normalized || color}`}
      />
      
      {showTooltip && (
        <div className="absolute z-10 p-2 bg-black text-white text-xs rounded shadow-lg -mt-2 left-8 min-w-max">
          <div className="space-y-1">
            {variations.hex && <div>HEX: {variations.hex}</div>}
            {variations.rgb && <div>RGB: {variations.rgb}</div>}
            {variations.hsl && <div>HSL: {variations.hsl}</div>}
            {!variations.hex && <div>Value: {color}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const VariableRow = ({ varName, varValue, onCopy, onApply }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(`${varName}: ${varValue};`);
    toast.success(`Copied ${varName} declaration to clipboard!`);
    onCopy?.(varName, varValue);
  };

  const handleCopyValue = () => {
    navigator.clipboard.writeText(varValue);
    toast.success(`Copied value "${varValue}" to clipboard!`);
  };

  const handleApply = () => {
    onApply?.(varName, varValue);
  };

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-200">
      <td className="py-3 px-4 font-mono text-sm text-blue-600">
        {varName}
      </td>
      <td className="py-3 px-4 font-mono text-sm">
        <span
          className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
          onClick={handleCopyValue}
          title="Click to copy value"
        >
          {varValue}
        </span>
      </td>
      <td className="py-3 px-4">
        <ColorSwatch color={varValue} />
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="Copy CSS declaration"
          >
            📋 Copy
          </button>
          <button
            onClick={handleApply}
            className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
            title="Apply to live preview"
          >
            ✨ Apply
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function DomainCSSVariables({ cssContent }) {
  const [variables, setVariables] = useState({});
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Parse variables from CSS content
  const variableData = useMemo(() => {
    if (!cssContent) return { variables: {}, count: 0 };
    return parseCSSVariables(cssContent);
  }, [cssContent]);

  useEffect(() => {
    setVariables(variableData.variables);
    setCount(variableData.count);
    setError(null);
  }, [variableData]);

  const handleCopyAll = () => {
    const declarations = Object.entries(variables)
      .map(([name, value]) => `  ${name}: ${value};`)
      .join('\n');
    
    const cssBlock = `:root {\n${declarations}\n}`;
    
    navigator.clipboard.writeText(cssBlock);
    toast.success(`Copied all ${count} variables as CSS block!`);
  };

  const handleApplyTheme = () => {
    // Apply all variables to the document root
    const root = document.documentElement;
    
    Object.entries(variables).forEach(([name, value]) => {
      root.style.setProperty(name, value);
    });
    
    toast.success(`Applied ${count} CSS variables to live theme!`);
  };

  const handleExportJSON = () => {
    const exportData = {
      variables,
      count,
      exported_at: new Date().toISOString(),
      source: "Finagler CSS Variables Extractor"
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `css-variables-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Variables exported to JSON file!');
  };

  const sortedVariables = useMemo(() => {
    return Object.entries(variables).sort(([a], [b]) => a.localeCompare(b));
  }, [variables]);

  const colorVariables = useMemo(() => {
    return sortedVariables.filter(([, value]) => isColor(value));
  }, [sortedVariables]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">🔄 Extracting variables...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
        Error extracting variables: {error}
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-lg mb-2">🔍</div>
        <div className="text-sm">No CSS variables found</div>
        <div className="text-xs mt-1 text-gray-400">
          CSS custom properties (--variable-name) will appear here when detected
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with stats and actions */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-semibold">{count}</span> variables found
              {colorVariables.length > 0 && (
                <span className="text-gray-500 ml-2">
                  ({colorVariables.length} colors)
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCopyAll}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Copy all variables as CSS"
            >
              📋 Copy All CSS
            </button>
            <button
              onClick={handleApplyTheme}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
              title="Apply all variables to live theme"
            >
              🎨 Apply Theme
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
              title="Export variables as JSON file"
            >
              📁 Export JSON
            </button>
          </div>
        </div>

        {/* Color summary */}
        {colorVariables.length > 0 && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">Color Variables: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {colorVariables.slice(0, 10).map(([name, value]) => (
                <ColorSwatch key={name} color={value} size="w-4 h-4" />
              ))}
              {colorVariables.length > 10 && (
                <span className="text-gray-400 text-xs self-center ml-1">
                  +{colorVariables.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Variables table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-300 sticky top-0">
            <tr>
              <th className="py-2 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Variable Name
              </th>
              <th className="py-2 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Value
              </th>
              <th className="py-2 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Color
              </th>
              <th className="py-2 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedVariables.map(([varName, varValue]) => (
              <VariableRow
                key={varName}
                varName={varName}
                varValue={varValue}
                onCopy={(name, value) => {
                  console.log(`Copied variable: ${name} = ${value}`);
                }}
                onApply={(name, value) => {
                  // Apply single variable to document root
                  document.documentElement.style.setProperty(name, value);
                  toast.success(`Applied ${name} to live theme!`);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
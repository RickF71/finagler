import React from "react";

export function Tabs({ value, onValueChange, children }) {
  return (
    <div className="column" style={{ width: '100%' }}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { currentValue: value, onValueChange })
      )}
    </div>
  );
}

export function TabsList({ children }) {
  return (
    <div className="toolbar" style={{ display: 'inline-flex', overflow: 'hidden', borderRadius: '6px' }}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, currentValue, onValueChange, children }) {
  const isActive = currentValue === value;
  return (
    <button
      onClick={() => onValueChange(value)}
      className={`button ${isActive ? 'selected' : ''}`}
      style={{ 
        fontSize: '0.875rem',
        fontWeight: '500',
        backgroundColor: isActive ? '#00B97A' : 'transparent',
        color: isActive ? 'black' : undefined
      }}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, currentValue, children }) {
  if (currentValue !== value) return null;
  return <div style={{ marginTop: '16px' }}>{children}</div>;
}
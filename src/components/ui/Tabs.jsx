import React from "react";

export function Tabs({ value, onValueChange, children }) {
  return (
    <div className="flex flex-col w-full">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { currentValue: value, onValueChange })
      )}
    </div>
  );
}

export function TabsList({ children }) {
  return (
    <div className="inline-flex bg-[#0E1319] border border-[#2A3642] rounded-md overflow-hidden">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, currentValue, onValueChange, children }) {
  const isActive = currentValue === value;
  return (
    <button
      onClick={() => onValueChange(value)}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-[#00B97A] text-black"
          : "bg-transparent text-gray-300 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, currentValue, children }) {
  if (currentValue !== value) return null;
  return <div className="mt-4">{children}</div>;
}
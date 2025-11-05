import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-[#111820] border border-[#2A3642] rounded-xl ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`p-4 border-b border-[#2A3642] font-semibold text-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-4 text-gray-300 ${className}`}>{children}</div>;
}
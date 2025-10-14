import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-[#0E131A] shadow-lg border border-slate-800 p-4 ${className}`}>
      {children}
    </div>
  );
}

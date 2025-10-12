import React from 'react';
import { NavLink } from 'react-router-dom';
import finaglerInside from '../assets/finagler_inside.trans.png';

export default function Sidebar() {
  return (
    <aside className="w-60 bg-[#0B0F14] border-r border-[#2A3642] flex flex-col items-center py-8">
      {/* Finagler Inside Logo */}
      <div className="mb-10 flex flex-col items-center">
        <img
          src={finaglerInside}
          alt="Finagler Inside"
        />
        <span className="text-[#7FC692] text-xs mt-3 tracking-wider uppercase">
          Finagler Inside
        </span>
      </div>

      {/* Navigation */}
      <nav className="w-full px-4 space-y-2">
        <NavLink
          to="/overview"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-md transition ${
              isActive
                ? 'bg-[#2A3642] text-[#00B97A]'
                : 'text-slate-300 hover:bg-[#131A21] hover:text-[#00B97A]'
            }`
          }
        >
          Overview
        </NavLink>

        <NavLink
          to="/identities"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-md transition ${
              isActive
                ? 'bg-[#2A3642] text-[#00B97A]'
                : 'text-slate-300 hover:bg-[#131A21] hover:text-[#00B97A]'
            }`
          }
        >
          Identities
        </NavLink>

        <NavLink
          to="/network"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-md transition ${
              isActive
                ? 'bg-[#2A3642] text-[#00B97A]'
                : 'text-slate-300 hover:bg-[#131A21] hover:text-[#00B97A]'
            }`
          }
        >
          Network Graph
        </NavLink>
      </nav>

      {/* Footer version marker */}
      <div className="mt-auto mb-2 text-xs text-slate-500">
        v0.2 Nightfield
      </div>
    </aside>
  );
}

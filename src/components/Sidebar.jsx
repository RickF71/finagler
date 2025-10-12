// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import finaglerInsideTrans from '../assets/finagler_inside.trans.png';

export default function Sidebar() {
  return (
    <aside className="w-60 bg-finagler-nightfieldSolid border-r border-finagler-cobaltDeep flex flex-col items-center py-6">
      <div className="mb-8 flex flex-col items-center bg-transparent">
        <img
          src={finaglerInsideTrans}
          alt="Finagler Inside"
          className="w-20 h-20 bg-transparent opacity-90 hover:opacity-100 transition-opacity duration-500"
          style={{ filter: 'drop-shadow(0 0 8px rgba(72,250,255,0.3))', mixBlendMode: 'normal' }}
        />
        <span className="text-[#7FC692] text-sm mt-2 tracking-wide uppercase">
          Finagler Inside
        </span>
      </div>



      {/* Menu Links */}
      <nav className="w-full space-y-2 px-4">
        <NavLink
          to="/overview"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-md text-slate-200 hover:bg-slate-700/40 transition ${
              isActive ? 'bg-slate-700/60 text-emerald-300' : ''
            }`
          }
        >
          Node Overview
        </NavLink>

        <NavLink
          to="/identities"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-md text-slate-200 hover:bg-slate-700/40 transition ${
              isActive ? 'bg-slate-700/60 text-emerald-300' : ''
            }`
          }
        >
          Identities
        </NavLink>

        <NavLink
          to="/network"
          className="block px-4 py-2 rounded-md text-slate-200 hover:bg-slate-700/40 transition"
        >
          Network Graph (Soon)
        </NavLink>
      </nav>

      {/* Calm footer pulse */}
      <div className="mt-auto mb-2 text-xs text-slate-500 animate-pulse">
        v0.2 Nightfield
      </div>
    </aside>
  );
}

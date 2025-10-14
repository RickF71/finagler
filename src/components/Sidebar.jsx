import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import finaglerInside from '../assets/finagler_inside.trans.png';

export default function Sidebar() {
  const [openOverlays, setOpenOverlays] = useState(true);

  return (
    <aside className="w-60 bg-[#0B0F14] border-r border-[#2A3642] flex flex-col items-center py-8">
      {/* Finagler Inside Logo */}
      <div className="mb-10 flex flex-col items-center">
        <img src={finaglerInside} alt="Finagler Inside" />
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

        {/* 🧭 Collapsible Overlays Section */}
        <div className="mt-4">
          <button
            onClick={() => setOpenOverlays(!openOverlays)}
            className="flex w-full items-center justify-between px-4 py-2 text-slate-300 hover:text-[#00B97A] hover:bg-[#131A21] rounded-md transition"
          >
            <span className="font-medium">Overlays</span>
            {openOverlays ? (
              <ChevronDown size={16} className="text-slate-400" />
            ) : (
              <ChevronRight size={16} className="text-slate-400" />
            )}
          </button>

          {openOverlays && (
            <div className="ml-2 mt-1 space-y-1 border-l border-[#2A3642]">
              <NavLink
                to="/terra"
                className={({ isActive }) =>
                  `block pl-6 pr-3 py-1.5 rounded-md text-sm transition ${
                    isActive
                      ? 'bg-[#2A3642] text-[#00B97A]'
                      : 'text-slate-400 hover:bg-[#131A21] hover:text-[#00B97A]'
                  }`
                }
              >
                Terra Overlay
              </NavLink>

              {/* Future overlays can go here */}
              <NavLink
                to="/civic"
                className={({ isActive }) =>
                  `block pl-6 pr-3 py-1.5 rounded-md text-sm transition ${
                    isActive
                      ? 'bg-[#2A3642] text-[#00B97A]'
                      : 'text-slate-400 hover:bg-[#131A21] hover:text-[#00B97A]'
                  }`
                }
              >
                Civic Overlay
              </NavLink>

              <NavLink
                to="/consent"
                className={({ isActive }) =>
                  `block pl-6 pr-3 py-1.5 rounded-md text-sm transition ${
                    isActive
                      ? 'bg-[#2A3642] text-[#00B97A]'
                      : 'text-slate-400 hover:bg-[#131A21] hover:text-[#00B97A]'
                  }`
                }
              >
                Consent Overlay
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Footer version marker */}
      <div className="mt-auto mb-2 text-xs text-slate-500">
        v0.2 Nightfield
      </div>
    </aside>
  );
}

import React from 'react'
import { useOverviewData } from './useOverviewData'
import OverviewCards from './OverviewCards'

export default function Overview() {
  const {
    nodeOk,
    loading,
    refreshing,
    lastUpdate,
    lastLatency,
    hbDuration,
    hbBase,
    refreshAll,
  } = useOverviewData()

  return (
    <div className="p-8 text-slate-200 relative">
      {/* Header */}
      <h1 className="text-3xl font-light mb-4 text-[#7FC692] flex items-center justify-between">
        <span className="flex items-center">
          <span
            aria-hidden="true"
            className={`inline-block w-3 h-3 rounded-full mr-3 ${
              nodeOk ? 'bg-emerald-400' : 'bg-rose-500'
            } ${nodeOk ? 'heartbeat' : ''}`}
            style={
              nodeOk
                ? { ['--hb-duration']: `${hbDuration}s`, ['--hb-base']: hbBase }
                : undefined
            }
          />
          <span>System Overview</span>
        </span>

        <button
          onClick={refreshAll}
          className={`px-3 py-1 text-xs rounded-md border border-slate-600 bg-[#0B0F14] hover:bg-slate-800 transition ${
            refreshing ? 'opacity-50 cursor-wait' : ''
          }`}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </h1>

      <p className="text-slate-400 mb-6 max-w-2xl leading-relaxed">
        A calm view of system metrics tied to DIS-Core.
      </p>

      {/* Cards */}
      <OverviewCards loading={loading} />

      {/* Heartbeat animation for header */}
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); opacity: 0.92; filter: brightness(1); }
          50% { transform: scale(1.09); opacity: 1; filter: brightness(calc(var(--hb-base, 1) * 1.06)); }
          100% { transform: scale(1); opacity: 0.92; filter: brightness(1); }
        }
        .heartbeat {
          animation: heartbeat var(--hb-duration, 1s) ease-in-out infinite;
          will-change: transform, opacity;
        }
        @media (prefers-reduced-motion: reduce) { .heartbeat { animation: none; } }
      `}</style>

      {/* Footer */}
      <div className="absolute bottom-4 right-6 text-xs text-slate-500">
        {lastUpdate && `Last updated ${lastUpdate}`}
        {lastLatency && (
          <span className="ml-3 text-slate-600">⏱️ {lastLatency} ms latency</span>
        )}
      </div>
    </div>
  )
}

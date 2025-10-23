import React from "react"
import { motion } from "framer-motion"
import Heartbeat from "./Heartbeat"

export default function NightfieldCard({
  title,
  subtitle,
  detail,
  className = "",
  children,
  active = false,
  innerAnimated = false,
  showHeartbeat = false,
  heartbeatColor = "bg-emerald-400",
  heartbeatDuration = 1.6,
  heartbeatIcon = null,
  variant = "neutral", // 🆕 semantic card variant
  animate,
  transition,
}) {
  const shouldAnimate = active && !innerAnimated
  const defaultAnimate = shouldAnimate ? (animate || { opacity: [0.9, 1, 0.9] }) : {}
  const defaultTransition = shouldAnimate
    ? (transition || { duration: 2, repeat: Infinity, ease: "easeInOut" })
    : {}

  // 🧩 color mapping for variants (soft gradient base + pulse ring)
  const colorMap = {
    system: "from-emerald-500/10 to-emerald-900/0",
    terra: "from-blue-500/10 to-blue-900/0",
    network: "from-cyan-400/10 to-cyan-900/0",
    mirror: "from-violet-400/10 to-indigo-900/0",
    neutral: "from-slate-600/10 to-slate-900/0",
  }

  return (
    <motion.div
      animate={defaultAnimate}
      transition={defaultTransition}
      className={`relative rounded-2xl border border-slate-700 bg-slate-900/60 
                  overflow-hidden shadow-lg transition-all duration-500 ease-out 
                  hover:shadow-[0_0_20px_var(--tw-shadow-color,rgba(255,255,255,0.08))] ${className}`}
    >
      {/* Ambient background field */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${colorMap[variant]} 
                    opacity-60 blur-2xl pointer-events-none`}
      />

      <div className="relative p-4 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-slate-200">{title}</h2>

          {showHeartbeat && (
            <div className="flex items-center justify-end gap-1">
              {heartbeatIcon ? (
                <div
                  className={`heartbeat-ring flex items-center justify-center rounded-lg p-[2px] w-6 h-6 ${
                    innerAnimated ? "opacity-60" : ""
                  }`}
                  style={{
                    ['--hb-duration']: `${heartbeatDuration}s`,
                    ['--hb-color']: `var(--${heartbeatColor.replace('bg-', '')}, ${heartbeatColor})`,
                  }}
                >
                  <span className="text-base text-slate-300">{heartbeatIcon}</span>
                </div>
              ) : (
                <Heartbeat color={heartbeatColor} duration={heartbeatDuration} size={8} />
              )}
            </div>
          )}
        </div>

        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        {detail && <p className="text-xs text-slate-500 mt-1">{detail}</p>}
        {children && <div className="mt-3">{children}</div>}
      </div>

      {/* Styling for heartbeat aura */}
      <style>{`
        .heartbeat-ring {
          background-color: rgba(255,255,255,0.05);
          box-shadow: 0 0 4px var(--hb-color, rgba(16,185,129,0.4));
          animation: heartbeat-ring var(--hb-duration, 1.5s) ease-in-out infinite;
          will-change: transform, filter, box-shadow;
        }

        @keyframes heartbeat-ring {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 4px var(--hb-color, rgba(16,185,129,0.3));
            filter: brightness(1);
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 0 8px var(--hb-color, rgba(16,185,129,0.7));
            filter: brightness(1.25);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .heartbeat-ring { animation: none; }
        }
      `}</style>
    </motion.div>
  )
}

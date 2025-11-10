import React from "react"
import { motion } from "framer-motion"
import Heartbeat from "./Heartbeat"

export default function NightfieldCard({
  title,
  subtitle,
  detail,
  className = "",
  style = {},
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
      className={`panel ${className || ''}`}
      style={{ 
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.5s ease-out',
        ...style
      }}
    >
      {/* Ambient background field */}
      <div
        style={{
          position: 'absolute',
          inset: '0',
          background: `linear-gradient(to bottom, ${colorMap[variant]})`,
          opacity: '0.6',
          filter: 'blur(32px)',
          pointerEvents: 'none'
        }}
      />

      <div className="panel pad-md" style={{ position: 'relative', zIndex: '10' }}>
        {/* Header */}
        <div className="flex center gap-md" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{title}</h2>

          {showHeartbeat && (
            <div className="flex center gap-sm" style={{ justifyContent: 'flex-end' }}>
              {heartbeatIcon ? (
                <div
                  className={`heartbeat-ring flex center ${
                    innerAnimated ? "opacity-60" : ""
                  }`}
                  style={{
                    borderRadius: '8px',
                    padding: '2px',
                    width: '24px',
                    height: '24px',
                    ['--hb-duration']: `${heartbeatDuration}s`,
                    ['--hb-color']: `var(--${heartbeatColor.replace('bg-', '')}, ${heartbeatColor})`,
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{heartbeatIcon}</span>
                </div>
              ) : (
                <Heartbeat color={heartbeatColor} duration={heartbeatDuration} size={8} />
              )}
            </div>
          )}
        </div>

        {subtitle && <p className="text-muted" style={{ fontSize: '0.875rem' }}>{subtitle}</p>}
        {detail && <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>{detail}</p>}
        {children && <div style={{ marginTop: '12px' }}>{children}</div>}
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

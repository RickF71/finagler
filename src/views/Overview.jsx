import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getStatus, listIdentities, getTerraOverlay, listPeers } from '../lib/api.js';
import MirrorSpinStatus from '../components/MirrorSpinStatus.jsx';

export default function Overview() {
  const [status, setStatus] = useState(null);
  const [identitiesCount, setIdentitiesCount] = useState(null);
  const [terraInfo, setTerraInfo] = useState(null);
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hbDuration, setHbDuration] = useState(1);
  const [hbBase, setHbBase] = useState(1);
  const [lastLatency, setLastLatency] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const measuredStatus = (async () => {
        const t0 = Date.now();
        const s = await getStatus().catch(e => ({ error: e.message }));
        const t1 = Date.now();
        const latency = Math.max(0, t1 - t0);
        setLastLatency(latency);

        const mapRange = (v, inMin, inMax, outMin, outMax) => {
          const clamped = Math.max(inMin, Math.min(inMax, v));
          const t = (clamped - inMin) / Math.max(1, inMax - inMin);
          return outMin + (outMax - outMin) * t;
        };

        const dur = mapRange(latency, 50, 1200, 1.6, 0.8);
        const base = mapRange(latency, 50, 1200, 1.0, 1.06);

        if (s && s.error) {
          setHbDuration(Math.max(0.65, dur * 0.85));
          setHbBase(Math.min(1.12, base * 1.03));
        } else {
          setHbDuration(dur);
          setHbBase(base);
        }
        return s;
      })();

      const [s, ids, terra, peersData] = await Promise.all([
        measuredStatus,
        listIdentities().catch(e => ({ error: e.message })),
        getTerraOverlay().catch(e => ({ error: e.message })),
        listPeers().catch(e => ({ error: e.message })),
      ]);

      setStatus(s);

      const count = Array.isArray(ids)
        ? ids.length
        : ids?.items?.length ?? null;
      setIdentitiesCount(count);

      if (terra && Array.isArray(terra.features)) {
        setTerraInfo({ count: terra.features.length });
      } else if (terra?.nodes) {
        setTerraInfo({ count: terra.nodes.length });
      } else {
        setTerraInfo(terra || null);
      }

      if (peersData?.peers) setPeers(peersData.peers);
      else if (Array.isArray(peersData)) setPeers(peersData);
      else setPeers([]);

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Overview load failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const nodeOk = status && !status.error;
  const version = status?.version || status?.version_string;

  const cards = [
    {
      title: 'System Status',
      value: loading
        ? 'Loading…'
        : nodeOk
          ? '🟢 Node: ok'
          : `🔴 Node error: ${status?.error ?? 'unknown'}`,
      color: nodeOk ? 'text-emerald-400' : 'text-rose-400',
      extra: version ? `Version: ${version}` : null,
    },
    {
      title: 'Identity Anchor',
      value: loading ? 'Loading…' : `👥 Identities: ${identitiesCount ?? '—'}`,
      color: 'text-slate-300',
    },
    {
      title: 'Terra Overlay',
      value: loading
        ? 'Loading…'
        : terraInfo?.count
          ? `🌍 Terra: ${terraInfo.count} features`
          : '🌍 Terra: data available',
      color: 'text-slate-300',
    },
    {
      title: 'Network Peers',
      value: loading
        ? 'Loading…'
        : peers.length === 0
          ? '🛰️ No peers detected'
          : `🛰️ Peers: ${peers.length}`,
      color: peers.length > 0 ? 'text-emerald-400' : 'text-slate-400',
      extra:
        peers.length > 0
          ? peers.map(p => `${p.address} (${p.healthy ? 'OK' : 'Down'})`).join(', ')
          : null,
    },
  ];

  return (
    <div className="p-8 text-slate-200 relative">
      {/* Header */}
      <h1 className="text-3xl font-light mb-4 text-[#7FC692] flex items-center justify-between">
        <span className="flex items-center">
          <span
            aria-hidden="true"
            className={`inline-block w-3 h-3 rounded-full mr-3 ${nodeOk ? 'bg-emerald-400' : 'bg-rose-500'} ${nodeOk ? 'heartbeat' : ''}`}
            style={
              nodeOk
                ? {
                    ['--hb-duration']: `${hbDuration}s`,
                    ['--hb-base']: hbBase,
                  }
                : undefined
            }
          />
          <span>System Overview</span>
        </span>
        <button
          onClick={() => {
            setRefreshing(true);
            loadAll();
          }}
          className={`px-3 py-1 text-xs rounded-md border border-slate-600 bg-[#0B0F14] hover:bg-slate-800 transition ${
            refreshing ? 'opacity-50 cursor-wait' : ''
          }`}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </h1>

      <p className="text-slate-400 mb-6 max-w-2xl leading-relaxed">
        A calm view of system metrics tied to DIS-Core. Values auto-refresh on mount.
      </p>

      {/* Grid of Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="p-4 rounded-2xl bg-gradient-to-b from-[#0D1117] to-[#0B0F14] 
                       border border-slate-800 shadow-[0_0_12px_rgba(0,0,0,0.4)] 
                       hover:shadow-[0_0_24px_rgba(59,130,246,0.2)] transition-all duration-500 ease-out"
          >
            <h2 className="text-lg font-semibold text-emerald-400 mb-2 tracking-wide">
              {card.title}
            </h2>
            <p
              className={`text-sm ${card.color} transition-opacity duration-700 ${
                loading ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {card.value}
            </p>
            {card.extra && (
              <div className="mt-2 text-xs text-slate-400 break-words leading-relaxed">
                {card.extra}
              </div>
            )}
          </motion.div>
        ))}

        {/* MirrorSpin card */}
        <motion.div
          key="mirror"
          initial={{ opacity: 0, y: 30, rotateX: -10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="p-4 rounded-2xl bg-gradient-to-b from-[#0D1117] to-[#0B0F14] 
                     border border-slate-800 shadow-[0_0_12px_rgba(0,0,0,0.4)] 
                     hover:shadow-[0_0_24px_rgba(59,130,246,0.2)] transition-all duration-500 ease-out"
        >
          <MirrorSpinStatus />
        </motion.div>
      </div>

      {/* Heartbeat animation */}
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
        @media (prefers-reduced-motion: reduce) {
          .heartbeat { animation: none; }
        }
      `}</style>

      {/* Footer */}
      <div className="absolute bottom-4 right-6 text-xs text-slate-500">
        {lastUpdate && `Last updated ${lastUpdate}`}
        {lastLatency && (
          <span className="ml-3 text-slate-600">
            ⏱️ {lastLatency} ms latency
          </span>
        )}
      </div>

      {/* Loading overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center rounded-xl bg-black transition-opacity duration-700 ${
          loading
            ? 'bg-opacity-40 animate-pulse opacity-100'
            : 'bg-opacity-0 opacity-0 pointer-events-none'
        }`}
        aria-hidden={!loading}
      >
        <span
          className={`text-slate-400 transition-opacity duration-500 ${
            loading ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Loading data…
        </span>
      </div>
    </div>
  );
}

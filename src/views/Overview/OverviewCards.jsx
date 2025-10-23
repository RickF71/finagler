import React from 'react'
import NightfieldCard from '../../components/ui/NightfieldCard'
import MirrorSpinStatus from '../../components/MirrorSpinStatus'
import { useOverviewData } from './useOverviewData'

export default function OverviewCards({ loading }) {
  const { status, identitiesCount, terraInfo, peers, hbDuration } = useOverviewData()
  const nodeOk = status && !status.error
  const version = status?.version || status?.version_string

  return (
    <div
      className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                 p-2 transition-all duration-500"
    >
      {/* 🌿 System Status */}
      <NightfieldCard
        title="System Status"
        subtitle={
          loading
            ? 'Loading…'
            : nodeOk
            ? '🟢 Node OK'
            : '🔴 Node Error'
        }
        detail={version ? `Version: ${version}` : null}
        variant="system"
        showHeartbeat
        heartbeatIcon="⚙️"
        heartbeatColor={nodeOk ? 'bg-emerald-400' : 'bg-rose-500'}
        heartbeatDuration={hbDuration}
        className="hover:shadow-emerald-500/20"
      />

      {/* 👥 Identity Anchor */}
      <NightfieldCard
        title="Identity Anchor"
        subtitle={
          loading
            ? 'Loading…'
            : `👥 ${identitiesCount ?? 'No'} identities`
        }
        variant="neutral"
        showHeartbeat={!loading && identitiesCount > 0}
        heartbeatIcon="🧩"
        heartbeatColor="bg-slate-400"
        heartbeatDuration={1.8}
        className="hover:shadow-slate-400/20"
      />

      {/* 🌍 Terra Overlay */}
      <NightfieldCard
        title="Terra Overlay"
        subtitle={
          loading
            ? 'Loading…'
            : terraInfo?.count
            ? `🌍 ${terraInfo.count} features`
            : '🌍 Data available'
        }
        variant="terra"
        showHeartbeat={!!terraInfo?.count}
        heartbeatIcon="🌍"
        heartbeatColor="bg-blue-400"
        heartbeatDuration={1.5}
        className="hover:shadow-blue-500/20"
      />

      {/* 🛰️ Network Peers */}
      <NightfieldCard
        title="Network Peers"
        subtitle={
          loading
            ? 'Loading…'
            : peers.length > 0
            ? `🛰️ ${peers.length} peers`
            : '🛰️ No peers detected'
        }
        variant="network"
        showHeartbeat={peers.length > 0}
        heartbeatIcon="🛰️"
        heartbeatColor={peers.length > 0 ? 'bg-cyan-400' : 'bg-slate-500'}
        heartbeatDuration={1.4}
        className="hover:shadow-cyan-500/20"
      >
        {peers.length > 0 && (
          <div className="text-xs text-slate-400 leading-relaxed space-y-0.5">
            {peers.map(p => (
              <div key={p.address}>
                {p.address} ({p.healthy ? 'OK' : 'Down'})
              </div>
            ))}
          </div>
        )}
      </NightfieldCard>

      {/* 🪞 MirrorSpin */}
      <NightfieldCard
        title="MirrorSpin"
        variant="mirror"
        innerAnimated
        showHeartbeat
        heartbeatIcon="🪞"
        heartbeatColor="bg-violet-400"
        heartbeatDuration={1.3}
        className="hover:shadow-violet-500/20"
      >
        <MirrorSpinStatus />
      </NightfieldCard>

      
      {/* 🪞 MirrorSpin */}
      <NightfieldCard title="Plain Header">
        <h1>Plain Header.</h1>
        A bunch of plain text.
      </NightfieldCard>
    </div>
  )
}

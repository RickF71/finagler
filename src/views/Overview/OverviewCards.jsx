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
      style={{ 
        display: 'grid', 
        gap: '1.5rem', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        padding: '0.5rem',
        transition: 'all 0.5s'
      }}
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
        style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }}
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
        style={{ boxShadow: '0 0 20px rgba(148, 163, 184, 0.2)' }}
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
        style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' }}
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
        style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' }}
      >
        {peers.length > 0 && (
          <div className="text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.6' }}>
            {peers.map(p => (
              <div key={p.address} style={{ marginBottom: '2px' }}>
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
        style={{ boxShadow: '0 0 20px rgba(167, 139, 250, 0.2)' }}
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

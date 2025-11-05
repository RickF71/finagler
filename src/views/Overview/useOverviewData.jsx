import { useEffect, useState, useCallback } from 'react'
import { getStatus, listIdentities, getTerraOverlay, listPeers } from '../../lib/api'

/**
 * Custom React hook providing all live Overview data for the Nightfield dashboard.
 * Handles fetching, latency tracking, heartbeat animation timing, and refresh logic.
 */
export function useOverviewData() {
  const [status, setStatus] = useState(null)
  const [identitiesCount, setIdentitiesCount] = useState(null)
  const [terraInfo, setTerraInfo] = useState(null)
  const [peers, setPeers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [hbDuration, setHbDuration] = useState(1)
  const [hbBase, setHbBase] = useState(1)
  const [lastLatency, setLastLatency] = useState(null)

  /**
   * Utility to map latency values to heartbeat timing
   */
  const mapRange = (v, inMin, inMax, outMin, outMax) => {
    const clamped = Math.max(inMin, Math.min(inMax, v))
    const t = (clamped - inMin) / Math.max(1, inMax - inMin)
    return outMin + (outMax - outMin) * t
  }

  /**
   * Fetch all metrics from the DIS-Core API.
   */
  const loadAll = useCallback(async () => {
    let mounted = true
    setLoading(true)

    try {
      const t0 = Date.now()
      const s = await getStatus().catch(e => ({ error: e.message }))
      const t1 = Date.now()
      const latency = Math.max(0, t1 - t0)
      if (!mounted) return
      setLastLatency(latency)

      
      const dur = mapRange(latency, 50, 1200, 1.6, 0.8)
      const base = mapRange(latency, 50, 1200, 1.0, 1.06)

      setHbDuration(s?.error ? Math.max(0.65, dur * 0.85) : dur)
      setHbBase(s?.error ? Math.min(1.12, base * 1.03) : base)

      const [ids, terra, peersData] = await Promise.all([
        listIdentities().catch(e => ({ error: e.message })),
        getTerraOverlay().catch(e => ({ error: e.message })),
        listPeers().catch(e => ({ error: e.message })),
      ])

      if (!mounted) return

      setStatus(s)
      setIdentitiesCount(Array.isArray(ids) ? ids.length : ids?.items?.length ?? null)

      if (terra && Array.isArray(terra.features)) setTerraInfo({ count: terra.features.length })
      else if (terra?.nodes) setTerraInfo({ count: terra.nodes.length })
      else setTerraInfo(terra || null)

      if (peersData?.peers) setPeers(peersData.peers)
      else if (Array.isArray(peersData)) setPeers(peersData)
      else setPeers([])

      setLastUpdate(new Date().toLocaleTimeString())

      // Uncomment this for live debug preview
      // if (process.env.NODE_ENV === 'development') {
      //   console.log('Overview data loaded:', {
      //     status: s, ids, terra, peersData, latency
      //   })
      // }

    } catch (err) {
      console.error('Overview data load failed:', err)
    } finally {
      if (mounted) {
        setLoading(false)
        setRefreshing(false)
      }
    }

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const nodeOk = status && !status.error
  const refreshAll = () => {
    setRefreshing(true)
    loadAll()
  }

  return {
    status,
    identitiesCount,
    terraInfo,
    peers,
    nodeOk,
    loading,
    refreshing,
    lastUpdate,
    lastLatency,
    hbDuration,
    hbBase,
    refreshAll,
  }
}

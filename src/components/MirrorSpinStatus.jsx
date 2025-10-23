import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { fetchMirrorSpinStatus } from "../lib/mirrorspin"
import Heartbeat from "../components/ui/Heartbeat"   // 💓 shared pulse component
import { formatUptime, parseGoDuration } from "../lib/utils/time"    // ⏱️ uptime formatter

export default function MirrorSpinStatus() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchMirrorSpinStatus()
      setStatus(data)
    }
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!status) {
    return (
      <motion.div
        initial={{ opacity: 0.4, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-slate-400"
      >
        <p>Loading MirrorSpin status…</p>
      </motion.div>
    )
  }

  const { last_check, event_count, uptime, error } = status
  const healthy = !error && event_count >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-1"
    >


      {error ? (
        <p className="text-sm text-rose-400">Error: {error}</p>
      ) : (
        <div className="text-sm text-slate-300 space-y-1">
          <p>Last Check: {last_check}</p>
          <p>Event Count: {event_count}</p>
          <p>Uptime: {formatUptime(parseGoDuration(uptime))}</p>
        
        </div>
      )}
    </motion.div>
  )
}


// Usage: import { formatUptime } from './time'
export function formatUptime(uptime) {
  // handle seconds, minutes, hours, days gracefully
  const seconds = Math.floor(Number(uptime))
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

// src/lib/utils/time.js
export function parseGoDuration(str) {
  if (!str) return 0
  const match = str.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s)?/)
  if (!match) return 0

  const hours = parseFloat(match[1] || 0)
  const minutes = parseFloat(match[2] || 0)
  const seconds = parseFloat(match[3] || 0)
  return hours * 3600 + minutes * 60 + seconds
}

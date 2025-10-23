import { motion } from "framer-motion"

export default function Heartbeat({
  size = 6,
  color = "bg-emerald-400",
  duration = 2,
  baseScale = 1.0
}) {
  return (
    <motion.div
      className={`rounded-full ${color}`}
      style={{ width: size, height: size }}
      animate={{ scale: [baseScale, baseScale * 1.3, baseScale] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  )
}

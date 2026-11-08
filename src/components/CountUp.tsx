'use client'

import { useEffect, useState } from 'react'

type Props = {
  value: number
  decimals?: number
  duration?: number
}

// Número que "sube" desde 0 hasta su valor (respeta prefers-reduced-motion)
export default function CountUp({ value, decimals = 0, duration = 900 }: Props) {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setShown(value)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(value * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <>{shown.toFixed(decimals)}</>
}

import { useEffect, useState } from 'react'

const NIGHT_START_HOUR = 22
const NIGHT_END_HOUR = 6
const CHECK_INTERVAL_MS = 60 * 1000

export function isNightHour(hour: number): boolean {
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR
}

// Dims an always-on kiosk overnight to reduce glare and OLED/LCD burn-in. Touches
// pass straight through (pointer-events-none), so the screen stays fully usable.
export function NightDimOverlay() {
  const [isNight, setIsNight] = useState(() => isNightHour(new Date().getHours()))

  useEffect(() => {
    const id = setInterval(() => setIsNight(isNightHour(new Date().getHours())), CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  if (!isNight) return null

  return <div className="pointer-events-none fixed inset-0 z-30 bg-black/60" aria-hidden="true" data-testid="night-dim" />
}

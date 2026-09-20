import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// A frozen kiosk display must not look identical to a live one — this ticks its own
// relative-time text (same setInterval pattern as ClockWidget) and turns warning-
// colored once the data is stale enough that a missed refresh cycle is likely.
const STALE_THRESHOLD_MS = 6 * 60 * 1000

interface LastUpdatedIndicatorProps {
  updatedAt: number
  isFetching: boolean
}

export function LastUpdatedIndicator({ updatedAt, isFetching }: LastUpdatedIndicatorProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15 * 1000)
    return () => clearInterval(id)
  }, [])

  if (!updatedAt) {
    return null
  }

  const ageMs = now - updatedAt
  const isStale = ageMs > STALE_THRESHOLD_MS

  return (
    <p
      className={cn('text-xs', isStale ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}
      aria-live="polite"
    >
      {isFetching ? 'Updating…' : `Updated ${formatRelativeTime(ageMs)}`}
    </p>
  )
}

function formatRelativeTime(ageMs: number): string {
  const minutes = Math.floor(ageMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes === 1) return '1 minute ago'
  return `${minutes} minutes ago`
}

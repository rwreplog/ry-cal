import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// A frozen kiosk display must not look identical to a live one — this ticks its own
// tick (same setInterval pattern as useClock) and turns warning-colored once the
// data is stale enough that a missed refresh cycle is likely.
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
      className={cn(
        'flex items-center gap-1.5 text-xs',
        isStale ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
      )}
      aria-live="polite"
    >
      {isFetching && <RefreshCw className="size-3 animate-spin" aria-hidden="true" />}
      {isFetching ? 'Updating…' : `Updated ${formatEasternTime(updatedAt)}`}
    </p>
  )
}

// Household is Eastern-based — shows the actual wall-clock time rather than a
// relative "N minutes ago" so it stays meaningfully readable on a kiosk display that
// isn't refreshed every few minutes. `timeZoneName: 'short'` lets the Intl API pick
// the correct EST/EDT abbreviation for the date, rather than hardcoding one that
// would be wrong for roughly two-thirds of the year (DST).
function formatEasternTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

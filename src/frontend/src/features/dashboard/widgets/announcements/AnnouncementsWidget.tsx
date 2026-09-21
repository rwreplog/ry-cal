import { Megaphone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { widgetAccentClasses } from '@/features/dashboard/widgetAccent'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

// Compact relative time, capped at "N days ago" — beyond that this widget only
// ever shows the 5 most recent announcements anyway (server-side cap), so an
// older one is rare and an absolute date reads better than "47 days ago".
function relativeTime(postedAtUtc: string): string {
  const ageMs = Date.now() - new Date(postedAtUtc).getTime()
  if (ageMs < HOUR_MS) {
    const minutes = Math.max(1, Math.floor(ageMs / 60000))
    return minutes === 1 ? '1 min ago' : `${minutes} min ago`
  }
  if (ageMs < DAY_MS) {
    const hours = Math.floor(ageMs / HOUR_MS)
    return hours === 1 ? '1 hr ago' : `${hours} hr ago`
  }
  if (ageMs < 7 * DAY_MS) {
    const days = Math.floor(ageMs / DAY_MS)
    return days === 1 ? '1 day ago' : `${days} days ago`
  }
  return new Date(postedAtUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function AnnouncementsWidget() {
  const { data, isLoading, isError } = useDashboard()

  return (
    <Card className={widgetAccentClasses('announcements')}>
      <CardHeader className="flex-row items-center gap-2">
        <Megaphone className="text-muted-foreground size-5" aria-hidden="true" />
        <CardTitle className="text-xl">Announcements</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading && (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
          </>
        )}

        {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load announcements.</p>}

        {!isLoading && !isError && data && data.announcements.items.length === 0 && (
          <p className="text-muted-foreground text-sm">No announcements.</p>
        )}

        {!isLoading &&
          !isError &&
          data?.announcements.items.map((announcement) => (
            <div key={announcement.id}>
              <p className="line-clamp-3" title={announcement.message}>
                {announcement.message}
              </p>
              <p className="text-muted-foreground text-sm">
                — {announcement.postedBy} · {relativeTime(announcement.postedAtUtc)}
              </p>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}

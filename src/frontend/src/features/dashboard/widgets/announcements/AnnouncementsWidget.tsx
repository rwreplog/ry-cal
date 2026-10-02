import { Megaphone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { widgetAccentClasses } from '@/features/dashboard/widgetAccent'

// A small, fixed palette (literal class strings — see widgetAccent.ts's comment on
// why Tailwind-scanned classes can never be built via interpolation) picked
// consistently per poster name, so "Mom" is always the same color at a glance
// without needing a real author/FamilyMember relationship (PostedBy is free text).
const AVATAR_PALETTE = [
  { bg: 'bg-rose-100 dark:bg-rose-950/50', text: 'text-rose-700 dark:text-rose-300' },
  { bg: 'bg-amber-100 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300' },
  { bg: 'bg-emerald-100 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-sky-100 dark:bg-sky-950/50', text: 'text-sky-700 dark:text-sky-300' },
  { bg: 'bg-violet-100 dark:bg-violet-950/50', text: 'text-violet-700 dark:text-violet-300' },
  { bg: 'bg-pink-100 dark:bg-pink-950/50', text: 'text-pink-700 dark:text-pink-300' },
]

function avatarStyle(name: string): (typeof AVATAR_PALETTE)[number] {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

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
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Megaphone className="text-muted-foreground/40 size-8" aria-hidden="true" />
            <p className="text-muted-foreground text-sm">No announcements — all quiet for now.</p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          data?.announcements.items.map((announcement) => {
            const avatar = avatarStyle(announcement.postedBy)
            return (
              <div key={announcement.id} className="flex items-start gap-3">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatar.bg} ${avatar.text}`}
                  aria-hidden="true"
                >
                  {announcement.postedBy.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="line-clamp-3" title={announcement.message}>
                    {announcement.message}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {announcement.postedBy} · {relativeTime(announcement.postedAtUtc)}
                  </p>
                </div>
              </div>
            )
          })}
      </CardContent>
    </Card>
  )
}

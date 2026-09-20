import { Megaphone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { widgetAccentClasses } from '@/features/dashboard/widgetAccent'

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
              <p>{announcement.message}</p>
              <p className="text-muted-foreground text-sm">— {announcement.postedBy}</p>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}

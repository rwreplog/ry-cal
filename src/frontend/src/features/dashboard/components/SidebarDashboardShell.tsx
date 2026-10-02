import { CalendarDays, Maximize, Minimize, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getWidget } from '@/features/dashboard/registry/widgetRegistry'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useFullscreen } from '@/features/dashboard/hooks/useFullscreen'
import { useTvMode } from '@/features/dashboard/hooks/useTvMode'
import { CalendarWidget } from '@/features/dashboard/widgets/calendar/CalendarWidget'
import { HolidayAnimationOverlay } from '@/features/theme/HolidayAnimationOverlay'
import { DashboardEmpty } from './DashboardEmpty'
import { DashboardError } from './DashboardError'
import { DashboardLoading } from './DashboardLoading'
import { HeaderClock } from './HeaderClock'
import { LastUpdatedIndicator } from './LastUpdatedIndicator'
import { NightDimOverlay } from './NightDimOverlay'

// Calendar-focused alternative to the default stacked DashboardShell, picked via
// Dashboard Settings' "Dashboard layout" option — built for a wide, landscape
// screen where vertical space is the scarce resource: the calendar fills a tall
// right pane top-to-bottom instead of sitting above everything else, and every
// other visible widget (including the clock, which lives in the page header in
// the stacked layout) stacks in a left-hand rail instead. Below the `lg` breakpoint
// it reflows to a single column — calendar first, rail below — since a sidebar
// doesn't work on a narrow phone/tablet width.
export function SidebarDashboardShell() {
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useDashboard()
  const { isTvMode, manualTv, setManualTv } = useTvMode()
  const { isFullscreen, enter, exit } = useFullscreen()

  const toggleTvMode = () => {
    if (manualTv) {
      setManualTv(false)
      void exit()
    } else {
      setManualTv(true)
      void enter() // a real click — the Fullscreen API's required user gesture is satisfied here
    }
  }

  const instances = [...(data?.layout ?? [])].sort((a, b) => a.order - b.order)
  const hasCalendar = instances.some((w) => w.type === 'calendar')
  const railInstances = instances.filter((w) => w.type !== 'calendar')

  return (
    <main className="flex h-dvh flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <HolidayAnimationOverlay />
      {isTvMode && <NightDimOverlay />}

      {isLoading && (
        <div className="flex-1 overflow-y-auto">
          <DashboardLoading />
        </div>
      )}
      {!isLoading && isError && (
        <div className="flex flex-1 items-center justify-center overflow-y-auto">
          <DashboardError onRetry={() => refetch()} />
        </div>
      )}
      {!isLoading && !isError && data && instances.length === 0 && (
        <div className="flex flex-1 items-center justify-center overflow-y-auto">
          <DashboardEmpty />
        </div>
      )}

      {!isLoading && !isError && data && instances.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col-reverse gap-6 lg:flex-row">
          {/* flex-col-reverse below lg puts the calendar (the second, later child)
              first/on top on a narrow screen, matching the stacked layout's
              priority, while lg:flex-row puts the rail back on the left in normal
              reading order without reversing anything. */}
          <aside className="flex flex-col gap-4 lg:w-80 lg:shrink-0 lg:overflow-y-auto lg:pr-1">
            {/* A deliberately distinct "hero" treatment (tinted, not the plain
                bg-card every widget below uses) — this is the one block that should
                read as the dashboard's anchor at a glance, not just another card in
                the stack. The tint rides the theme's own --primary color, so it
                stays coherent across every theme and seasonal palette automatically. */}
            <div className="bg-primary/10 border-primary/20 flex flex-col gap-4 rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Replogle HQ</h1>
                <div className="flex shrink-0 items-center gap-1">
                  {!isTvMode && (
                    <Button variant="ghost" size="icon" aria-label="Open admin settings" asChild>
                      <Link to="/admin">
                        <Settings />
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={manualTv ? 'Exit TV mode' : 'Enter TV mode'}
                    onClick={toggleTvMode}
                  >
                    {manualTv ? <Minimize /> : <Maximize />}
                  </Button>
                </div>
              </div>
              {!isTvMode && (
                <p className="text-muted-foreground -mt-2 text-sm">Mission control for the Replogle household</p>
              )}

              {isTvMode && !isFullscreen && (
                <Button variant="outline" size="sm" onClick={() => void enter()}>
                  Enter fullscreen
                </Button>
              )}

              <div className="border-primary/20 border-t pt-4">
                <HeaderClock size="large" />
              </div>

              <LastUpdatedIndicator updatedAt={dataUpdatedAt} isFetching={isFetching} />
            </div>

            <div className="flex flex-col gap-4">
              {railInstances.map((instance) => {
                const definition = getWidget(instance.type)
                if (!definition) return null
                const WidgetComponent = definition.component
                return <WidgetComponent key={instance.type} />
              })}
            </div>
          </aside>

          <div className="min-h-0 flex-1">
            {hasCalendar ? (
              <CalendarWidget className="min-h-[28rem]" />
            ) : (
              <Card className="h-full">
                <CardContent className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-center text-sm">
                  <CalendarDays className="text-muted-foreground/40 size-8" aria-hidden="true" />
                  Calendar is hidden — enable it in Dashboard Settings to fill this space.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

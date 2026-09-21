import { Maximize, Minimize } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useFullscreen } from '@/features/dashboard/hooks/useFullscreen'
import { useTvMode } from '@/features/dashboard/hooks/useTvMode'
import { DashboardError } from './DashboardError'
import { DashboardLoading } from './DashboardLoading'
import { HeaderClockWeather } from './HeaderClockWeather'
import { LastUpdatedIndicator } from './LastUpdatedIndicator'
import { WidgetGrid } from './WidgetGrid'

export function DashboardShell() {
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

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="grid grid-cols-1 items-center gap-4 sm:grid-cols-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Replogle HQ</h1>
          {!isTvMode && <p className="text-muted-foreground">Mission control for the Replogle household</p>}
          <LastUpdatedIndicator updatedAt={dataUpdatedAt} isFetching={isFetching} />
        </div>
        <div className="flex justify-center">
          <HeaderClockWeather />
        </div>
        <div className="flex items-center justify-center gap-2 sm:justify-end">
          {isTvMode && !isFullscreen && (
            <Button variant="outline" size="sm" onClick={() => void enter()}>
              Enter fullscreen
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
      </header>

      {isLoading && <DashboardLoading />}
      {!isLoading && isError && <DashboardError onRetry={() => refetch()} />}
      {!isLoading && !isError && data && <WidgetGrid layout={data.layout} />}
    </main>
  )
}

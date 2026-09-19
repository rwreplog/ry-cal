import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { DashboardError } from './DashboardError'
import { DashboardLoading } from './DashboardLoading'
import { WidgetGrid } from './WidgetGrid'

export function DashboardShell() {
  const { data, isLoading, isError, refetch } = useDashboard()

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Replogle HQ</h1>
        <p className="text-muted-foreground">Mission control for the Replogle household</p>
      </header>

      {isLoading && <DashboardLoading />}
      {!isLoading && isError && <DashboardError onRetry={() => refetch()} />}
      {!isLoading && !isError && data && <WidgetGrid layout={data.layout} />}
    </main>
  )
}

import { CloudSun } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'

export function WeatherWidget() {
  const { data, isLoading, isError } = useDashboard()

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <CloudSun className="text-muted-foreground size-5" aria-hidden="true" />
        <CardTitle className="text-xl">Weather</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-16 w-full" />}

        {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load weather.</p>}

        {!isLoading && !isError && data && (
          <div className="flex items-center justify-between">
            <span className="text-5xl font-semibold tracking-tight">{Math.round(data.weather.current.temperatureF)}°</span>
            <div className="text-right">
              <p className="font-medium">{data.weather.current.condition}</p>
              <p className="text-muted-foreground text-sm">
                H {Math.round(data.weather.current.highF)}° / L {Math.round(data.weather.current.lowF)}°
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

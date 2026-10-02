import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { widgetAccentClasses } from '@/features/dashboard/widgetAccent'

// Keyed by the exact condition text OpenMeteoWeatherProvider.DescribeWeatherCode
// returns (the dashboard DTO only carries that text, not the raw WMO code) — keep
// this in sync with that backend switch if its condition strings ever change.
const CONDITION_ICONS: Record<string, LucideIcon> = {
  'Clear sky': Sun,
  'Mainly clear': Sun,
  'Partly cloudy': CloudSun,
  Overcast: Cloud,
  Fog: CloudFog,
  Drizzle: CloudDrizzle,
  'Freezing drizzle': CloudDrizzle,
  Rain: CloudRain,
  'Freezing rain': CloudHail,
  Snow: CloudSnow,
  'Snow grains': CloudSnow,
  'Rain showers': CloudRainWind,
  'Snow showers': CloudSnow,
  Thunderstorm: CloudLightning,
  'Thunderstorm with hail': CloudLightning,
}

export function WeatherWidget() {
  const { data, isLoading, isError } = useDashboard()
  const weather = data?.weather.current
  const WeatherIcon = weather ? (CONDITION_ICONS[weather.condition] ?? CloudSun) : null

  return (
    <Card className={widgetAccentClasses('weather')}>
      <CardHeader className="flex-row items-center gap-2">
        <CloudSun className="text-muted-foreground size-5" aria-hidden="true" />
        <CardTitle className="text-xl">Weather</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading && <Skeleton className="h-16 w-full" />}

        {!isLoading && isError && <p className="text-destructive text-sm">Couldn&apos;t load the weather.</p>}

        {!isLoading && !isError && !weather && (
          <p className="text-muted-foreground text-sm">
            Set your home location in Display settings to see weather here.
          </p>
        )}

        {!isLoading && !isError && weather && WeatherIcon && (
          <>
            <div className="flex items-center gap-3">
              <WeatherIcon className="text-muted-foreground weather-icon-breathe size-10 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-3xl leading-tight font-semibold tracking-tight">{Math.round(weather.temperatureF)}°</p>
                <p className="text-muted-foreground text-sm leading-tight">
                  {weather.condition} · H{Math.round(weather.highF)}° L{Math.round(weather.lowF)}°
                </p>
              </div>
            </div>

            {weather.inclementWeatherExpected && (
              <p className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                <CloudRain className="size-3.5 shrink-0" aria-hidden="true" />
                {weather.forecastCondition} expected today
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

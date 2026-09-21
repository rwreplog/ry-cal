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
import { useClock } from '@/features/dashboard/hooks/useClock'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'

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

// Always-visible page-header strip — not a toggleable widget (Clock/Weather were
// removed from the widget grid in favor of this). The clock ticks independently of
// the dashboard fetch so time never blocks on it; weather renders once dashboard
// data (already being fetched by DashboardShell) resolves, and stays hidden until
// then rather than showing a loading placeholder for something this small.
//
// Date uses a short format (weekday/month abbreviated) deliberately — this sits in
// the header's narrow middle column, and the long form ("Monday, September 21")
// was wide enough to wrap onto a second line on its own, on top of the two-line
// time/date and icon/temp layout, making the whole strip four-plus lines tall.
export function HeaderClockWeather() {
  const now = useClock()
  const { data } = useDashboard()
  const weather = data?.weather.current

  const time = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const date = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

  const WeatherIcon = weather ? (CONDITION_ICONS[weather.condition] ?? CloudSun) : null

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-4">
        <div className="text-center sm:text-right">
          <p className="text-3xl leading-tight font-semibold tracking-tight tabular-nums">{time}</p>
          <p className="text-muted-foreground text-sm leading-tight whitespace-nowrap">{date}</p>
        </div>

        {weather && WeatherIcon && (
          <>
            <div className="bg-border h-11 w-px" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <WeatherIcon className="text-muted-foreground size-9 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-3xl leading-tight font-semibold tracking-tight">
                  {Math.round(weather.temperatureF)}°
                </p>
                <p className="text-muted-foreground text-sm leading-tight whitespace-nowrap">
                  {weather.condition} · H{Math.round(weather.highF)}° L{Math.round(weather.lowF)}°
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {weather?.inclementWeatherExpected && (
        <p className="flex items-center gap-1 text-xs font-medium whitespace-nowrap text-amber-600 dark:text-amber-400">
          <CloudRain className="size-3.5 shrink-0" aria-hidden="true" />
          {weather.forecastCondition} expected today
        </p>
      )}
    </div>
  )
}

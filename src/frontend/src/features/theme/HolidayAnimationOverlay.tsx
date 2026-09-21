import { useEffect, useMemo, useState } from 'react'
import { useDashboardConfig } from '@/features/dashboard/hooks/useDashboardConfig'
import { AUTO_SEASONAL_THEME_ID } from './constants'
import { usePreviewTheme } from './PreviewThemeContext'
import { getHolidayToday, holidayForSeasonalTheme, type HolidayId } from './seasonalTheme'

interface HolidayAnimationConfig {
  emojis: string[]
  direction: 'fall' | 'rise'
}

// One small flourish per holiday, layered on top of that month's seasonal theme
// only on the exact holiday date itself (see getHolidayToday) — not the whole
// themed month, so it stays a once-a-year moment rather than a constant presence.
const HOLIDAY_ANIMATIONS: Record<HolidayId, HolidayAnimationConfig> = {
  valentines: { emojis: ['❤️', '💕', '💗'], direction: 'rise' },
  'st-patricks': { emojis: ['🍀', '☘️'], direction: 'fall' },
  easter: { emojis: ['🥚', '🐰', '🌷'], direction: 'fall' },
  'fourth-of-july': { emojis: ['🎆', '✨', '🎇'], direction: 'rise' },
  halloween: { emojis: ['🦇', '👻', '🎃'], direction: 'fall' },
  thanksgiving: { emojis: ['🍂', '🍁'], direction: 'fall' },
  christmas: { emojis: ['❄️'], direction: 'fall' },
}

const PARTICLE_COUNT = 14

// Same cadence as ThemeProvider's own recheck — a kiosk left open overnight should
// have the animation turn on at midnight on the holiday and off again the next day
// without needing a reload.
const RECHECK_INTERVAL_MS = 60 * 60 * 1000

interface Particle {
  emoji: string
  leftPercent: number
  delaySeconds: number
  durationSeconds: number
  sizeRem: number
}

function buildParticles(config: HolidayAnimationConfig): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    emoji: config.emojis[i % config.emojis.length],
    leftPercent: Math.round(((i * 137.5) % 100) * 10) / 10, // golden-angle spread, avoids a visible repeating grid
    delaySeconds: (i * 1.7) % 12,
    durationSeconds: 10 + (i % 5) * 2,
    sizeRem: 1.25 + (i % 3) * 0.5,
  }))
}

// Purely decorative — not a widget, mounted once at the dashboard page level. Only
// active when the household has selected "Auto (Seasonal)"; a manually-picked
// theme (e.g. Dark) never gets surprise holiday particles layered over it — unless
// Dashboard Settings has an active preview, which overrides that the same way it
// overrides the color palette. prefers-reduced-motion is handled globally in
// index.css, same as every other animation in the app.
export function HolidayAnimationOverlay() {
  const { data } = useDashboardConfig()
  const { previewThemeId } = usePreviewTheme()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), RECHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const holiday = previewThemeId
    ? holidayForSeasonalTheme(previewThemeId)
    : data?.theme === AUTO_SEASONAL_THEME_ID
      ? getHolidayToday(now)
      : null
  const particles = useMemo(() => (holiday ? buildParticles(HOLIDAY_ANIMATIONS[holiday]) : []), [holiday])

  if (!holiday) {
    return null
  }

  const direction = HOLIDAY_ANIMATIONS[holiday].direction
  const particleClass = direction === 'fall' ? 'holiday-particle-fall' : 'holiday-particle-rise'

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {particles.map((particle, index) => (
        <span
          key={index}
          className={particleClass}
          style={{
            left: `${particle.leftPercent}%`,
            fontSize: `${particle.sizeRem}rem`,
            animationDelay: `${particle.delaySeconds}s`,
            animationDuration: `${particle.durationSeconds}s`,
          }}
        >
          {particle.emoji}
        </span>
      ))}
    </div>
  )
}

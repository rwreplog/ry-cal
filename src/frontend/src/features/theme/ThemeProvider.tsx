import { useEffect, useState, type ReactNode } from 'react'
import { useDashboardConfig } from '@/features/dashboard/hooks/useDashboardConfig'
import { AUTO_SEASONAL_THEME_ID, DEFAULT_THEME, THEME_STORAGE_KEY, getEffectiveTheme } from './constants'
import { usePreviewTheme } from './PreviewThemeContext'

// Re-resolves "Auto (Seasonal)" periodically so a kiosk display left open across a
// day/month boundary (e.g. overnight into November 1st) picks up the new holiday
// theme without a manual reload. An hour is frequent enough for a day-granularity
// concern and cheap enough not to matter.
const AUTO_RECHECK_INTERVAL_MS = 60 * 60 * 1000

// The server's persisted theme is always the source of truth ("follow the
// household, not the browser") — localStorage is written only as a paint
// optimization for the next load's no-flash inline script (index.html), never
// read back here. What's applied to the DOM and cached is always the *effective*
// theme (auto resolved to today's seasonal palette), never the literal "auto" id,
// since no `[data-theme='auto']` CSS block exists.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data } = useDashboardConfig()
  const theme = data?.theme ?? DEFAULT_THEME
  const { previewThemeId } = usePreviewTheme()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (theme !== AUTO_SEASONAL_THEME_ID) return
    const id = setInterval(() => setNow(new Date()), AUTO_RECHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [theme])

  // Caches only the real effective theme, deliberately never a preview override —
  // closing the tab mid-preview should still open next time on the household's own
  // theme, not whatever holiday was last being previewed.
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme(theme, now)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, effectiveTheme)
    } catch {
      // Private browsing / blocked storage — theming still works, just without
      // the next-load no-flash optimization.
    }
  }, [theme, now])

  // What's actually applied to the DOM — a preview override, when Dashboard
  // Settings has one active, takes priority over the real effective theme.
  useEffect(() => {
    document.documentElement.dataset.theme = previewThemeId ?? getEffectiveTheme(theme, now)
  }, [theme, now, previewThemeId])

  return <>{children}</>
}

import { useEffect, type ReactNode } from 'react'
import { useDashboardConfig } from '@/features/dashboard/hooks/useDashboardConfig'
import { DEFAULT_THEME, THEME_STORAGE_KEY } from './constants'

// The server's persisted theme is always the source of truth ("follow the
// household, not the browser") — localStorage is written only as a paint
// optimization for the next load's no-flash inline script (index.html), never
// read back here.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data } = useDashboardConfig()
  const theme = data?.theme ?? DEFAULT_THEME

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Private browsing / blocked storage — theming still works, just without
      // the next-load no-flash optimization.
    }
  }, [theme])

  return <>{children}</>
}

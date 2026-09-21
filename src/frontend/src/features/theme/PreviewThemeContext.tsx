import { createContext, useContext, useState, type ReactNode } from 'react'

interface PreviewThemeContextValue {
  previewThemeId: string | null
  setPreviewThemeId: (id: string | null) => void
}

const PreviewThemeContext = createContext<PreviewThemeContextValue | null>(null)

// Lets DashboardSettingsPage temporarily override what's actually applied —
// ThemeProvider and HolidayAnimationOverlay both defer to this over the household's
// real saved theme whenever it's set, so "preview Halloween" shows Halloween's
// palette and particles regardless of what's actually saved, without touching (or
// needing to save) the real theme. Never persisted; resets to null on reload.
export function PreviewThemeProvider({ children }: { children: ReactNode }) {
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null)
  return (
    <PreviewThemeContext.Provider value={{ previewThemeId, setPreviewThemeId }}>
      {children}
    </PreviewThemeContext.Provider>
  )
}

export function usePreviewTheme(): PreviewThemeContextValue {
  const ctx = useContext(PreviewThemeContext)
  if (!ctx) {
    throw new Error('usePreviewTheme must be used within a PreviewThemeProvider')
  }
  return ctx
}

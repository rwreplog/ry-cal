import { resolveSeasonalTheme } from './seasonalTheme'

export interface ThemeDefinition {
  id: string
  label: string
}

// A new theme (Retro, Space, Medieval, ...) is one more entry here plus a matching
// `[data-theme='id']` token block in index.css — nothing else changes. "Auto
// (Seasonal)" is different: its id is never applied to the DOM directly — see
// getEffectiveTheme below — so it needs no `[data-theme='auto']` block of its own,
// only the `seasonal-*` blocks that resolveSeasonalTheme's ids point to.
export const THEMES: readonly ThemeDefinition[] = [
  { id: 'modern', label: 'Modern' },
  { id: 'dark', label: 'Dark' },
  { id: 'cozy', label: 'Cozy' },
  { id: 'family', label: 'Family' },
  { id: 'auto', label: 'Auto (Seasonal)' },
]

export const DEFAULT_THEME = 'modern'

export const THEME_STORAGE_KEY = 'rhq-theme'

export const AUTO_SEASONAL_THEME_ID = 'auto'

// The theme actually applied to the DOM: every id passes through unchanged except
// "auto", which resolves to today's seasonal/holiday palette. Centralized here so
// ThemeProvider (real-time application) and DashboardSettingsPage (instant preview
// on selection) can't drift out of sync with each other.
export function getEffectiveTheme(theme: string, today: Date = new Date()): string {
  return theme === AUTO_SEASONAL_THEME_ID ? resolveSeasonalTheme(today) : theme
}

// Every id resolveSeasonalTheme can return, in calendar order — the single source
// for both the friendly-name lookup below and DashboardSettingsPage's "Preview a
// season" picker (letting the household see, say, Halloween's look in July without
// waiting for October or changing their system clock).
export const SEASONAL_THEMES: readonly ThemeDefinition[] = [
  { id: 'seasonal-winter', label: 'Winter (Jan)' },
  { id: 'seasonal-valentines', label: "Valentine's Day (Feb)" },
  { id: 'seasonal-st-patricks', label: "St Patrick's Day (Mar)" },
  { id: 'seasonal-easter', label: 'Easter' },
  { id: 'seasonal-spring', label: 'Spring (Apr–May)' },
  { id: 'seasonal-summer', label: 'Summer (Jun, Aug)' },
  { id: 'seasonal-fourth-of-july', label: 'Fourth of July' },
  { id: 'seasonal-fall', label: 'Fall (Sep)' },
  { id: 'seasonal-halloween', label: 'Halloween' },
  { id: 'seasonal-thanksgiving', label: 'Thanksgiving' },
  { id: 'seasonal-christmas', label: 'Christmas' },
]

const SEASONAL_THEME_LABELS: Record<string, string> = Object.fromEntries(
  SEASONAL_THEMES.map((t) => [t.id, t.label.replace(/\s*\([^)]*\)$/, '')]), // strip the "(Month)" suffix
)

// Friendly name for one of resolveSeasonalTheme's ids — used to tell the household
// which palette Auto has picked for today (DashboardSettingsPage), since selecting
// "Auto (Seasonal)" otherwise gives no clue which of the 11 it resolved to without
// visually comparing the page's colors against memory.
export function seasonalThemeLabel(resolvedThemeId: string): string {
  return SEASONAL_THEME_LABELS[resolvedThemeId] ?? resolvedThemeId
}

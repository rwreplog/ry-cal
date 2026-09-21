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

// Friendly names for resolveSeasonalTheme's ids — used only to tell the household
// which palette Auto has picked for today (DashboardSettingsPage), since selecting
// "Auto (Seasonal)" otherwise gives no clue which of the 11 it resolved to without
// visually comparing the page's colors against memory.
const SEASONAL_THEME_LABELS: Record<string, string> = {
  'seasonal-winter': 'Winter',
  'seasonal-valentines': "Valentine's Day",
  'seasonal-st-patricks': "St Patrick's Day",
  'seasonal-easter': 'Easter',
  'seasonal-spring': 'Spring',
  'seasonal-summer': 'Summer',
  'seasonal-fourth-of-july': 'Fourth of July',
  'seasonal-fall': 'Fall',
  'seasonal-halloween': 'Halloween',
  'seasonal-thanksgiving': 'Thanksgiving',
  'seasonal-christmas': 'Christmas',
}

export function seasonalThemeLabel(resolvedThemeId: string): string {
  return SEASONAL_THEME_LABELS[resolvedThemeId] ?? resolvedThemeId
}

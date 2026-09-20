export interface ThemeDefinition {
  id: string
  label: string
}

// A new theme (Retro, Space, Medieval, Seasonal, ...) is one more entry here plus a
// matching `[data-theme='id']` token block in index.css — nothing else changes.
export const THEMES: readonly ThemeDefinition[] = [
  { id: 'modern', label: 'Modern' },
  { id: 'dark', label: 'Dark' },
  { id: 'cozy', label: 'Cozy' },
  { id: 'family', label: 'Family' },
]

export const DEFAULT_THEME = 'modern'

export const THEME_STORAGE_KEY = 'rhq-theme'

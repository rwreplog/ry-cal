import { seasonalThemeLabel } from './constants'
import { usePreviewTheme } from './PreviewThemeContext'

// Mounted once, app-wide (providers.tsx) — now that a preview persists across
// navigation (not just while Dashboard Settings itself is open), this is the only
// way to know you're looking at a preview rather than the household's real theme,
// and the only way to turn it off from anywhere other than Settings. Deliberately
// styled with fixed neutral colors rather than theme tokens (--primary etc.) so it
// reads the same regardless of which theme — real or previewed — is currently
// applied to the page underneath it.
export function PreviewThemeBanner() {
  const { previewThemeId, setPreviewThemeId } = usePreviewTheme()

  if (!previewThemeId) {
    return null
  }

  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-neutral-900 px-4 py-1.5 text-xs text-neutral-50 shadow-md"
    >
      <span>Previewing {seasonalThemeLabel(previewThemeId)} — not your real theme.</span>
      <button
        type="button"
        className="rounded-md border border-neutral-50/30 px-2 py-0.5 font-medium hover:bg-neutral-50/10"
        onClick={() => setPreviewThemeId(null)}
      >
        Stop previewing
      </button>
    </div>
  )
}

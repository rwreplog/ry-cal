import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@/features/dashboard/widgets' // registers the real widget definitions (name/icon lookups)
import { useDashboardConfig } from '@/features/dashboard/hooks/useDashboardConfig'
import { useDashboardConfigMutations } from '@/features/dashboard/hooks/useDashboardConfigMutations'
import { useHouseholdLocation } from '@/features/dashboard/hooks/useHouseholdLocation'
import { useHouseholdLocationMutations } from '@/features/dashboard/hooks/useHouseholdLocationMutations'
import { PreviewThemeProvider, usePreviewTheme } from '@/features/theme/PreviewThemeContext'
import type { DashboardConfigDto } from '@/types/dashboard'
import { DashboardSettingsPage, reorderWidgets } from './DashboardSettingsPage'

vi.mock('@/features/dashboard/hooks/useDashboardConfig', () => ({
  useDashboardConfig: vi.fn(),
}))

vi.mock('@/features/dashboard/hooks/useDashboardConfigMutations', () => ({
  useDashboardConfigMutations: vi.fn(),
}))

// DashboardSettingsPage also renders LocationSettings (the Weather location
// search) — mocked here the same way as the other page-level hooks above, since
// this test suite doesn't wrap renders in a QueryClientProvider.
vi.mock('@/features/dashboard/hooks/useHouseholdLocation', () => ({
  useHouseholdLocation: vi.fn(),
}))

vi.mock('@/features/dashboard/hooks/useHouseholdLocationMutations', () => ({
  useHouseholdLocationMutations: vi.fn(),
}))

const mockedUseDashboardConfig = vi.mocked(useDashboardConfig)
const mockedUseDashboardConfigMutations = vi.mocked(useDashboardConfigMutations)
const mockedUseHouseholdLocation = vi.mocked(useHouseholdLocation)
const mockedUseHouseholdLocationMutations = vi.mocked(useHouseholdLocationMutations)

const baseConfig: DashboardConfigDto = {
  theme: 'modern',
  calendarView: 'week',
  widgets: [
    { type: 'announcements', size: 'sm', isVisible: true },
    { type: 'calendar', size: 'md', isVisible: true },
    { type: 'chores', size: 'md', isVisible: true },
  ],
}

function renderPage() {
  return render(
    <PreviewThemeProvider>
      <DashboardSettingsPage />
    </PreviewThemeProvider>,
  )
}

// Actually opening a Radix Select in jsdom (a pointerdown-driven, layout-measuring
// interaction) isn't reliably triggerable here regardless of polyfills tried — no
// interaction with any Select in this codebase's test suite manages it either, so
// this isn't specific to this component. Rather than fight that, these tests drive
// an active preview into place the same way DashboardSettingsPage itself would once
// the Select fires its onValueChange (i.e. a setPreviewThemeId call) — this still
// exercises the page's own logic (the "Stop previewing" button, the DOM being
// updated, nothing being saved) in full; only the Select's own open/click mechanics
// are unverified here, and that's a thin, visually-reviewable prop wire-up
// (onValueChange={setPreviewThemeId}), not application logic.
function SetPreviewOnMount({ id }: { id: string }) {
  const { setPreviewThemeId } = usePreviewTheme()
  useEffect(() => {
    setPreviewThemeId(id)
  }, [id, setPreviewThemeId])
  return null
}

function renderPageWithPreview(id: string) {
  return render(
    <PreviewThemeProvider>
      <SetPreviewOnMount id={id} />
      <DashboardSettingsPage />
    </PreviewThemeProvider>,
  )
}

describe('reorderWidgets', () => {
  it('moves the active widget to the position of the target widget', () => {
    const result = reorderWidgets(baseConfig.widgets, 'announcements', 'chores')
    expect(result.map((w) => w.type)).toEqual(['calendar', 'chores', 'announcements'])
  })

  it('is a no-op when the active and target widget are the same', () => {
    const result = reorderWidgets(baseConfig.widgets, 'announcements', 'announcements')
    expect(result).toBe(baseConfig.widgets)
  })

  it('is a no-op when either widget type is unknown', () => {
    const result = reorderWidgets(baseConfig.widgets, 'announcements', 'does-not-exist')
    expect(result).toBe(baseConfig.widgets)
  })
})

describe('DashboardSettingsPage', () => {
  const mutate = vi.fn()

  beforeEach(() => {
    // jsdom doesn't implement the Pointer Events / scrollIntoView / real-layout
    // APIs Radix Select's default "item-aligned" positioning relies on to open —
    // these get it far enough to mount without throwing, but actually opening a
    // Select and clicking an option isn't achievable here even so (see
    // SetPreviewOnMount below for how the preview tests work around that).
    Element.prototype.hasPointerCapture ??= () => false
    Element.prototype.setPointerCapture ??= () => {}
    Element.prototype.releasePointerCapture ??= () => {}
    Element.prototype.scrollIntoView ??= () => {}

    mutate.mockReset()
    mockedUseDashboardConfig.mockReset()
    mockedUseDashboardConfigMutations.mockReset()
    mockedUseDashboardConfig.mockReturnValue({
      data: baseConfig,
      isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    mockedUseDashboardConfigMutations.mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: { mutate, isPending: false } as any,
    })
    mockedUseHouseholdLocation.mockReturnValue({
      data: { latitude: null, longitude: null, locationLabel: null },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    mockedUseHouseholdLocationMutations.mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: { mutate: vi.fn(), isPending: false } as any,
    })

    // jsdom has no ResizeObserver at all — dnd-kit's DndContext needs one to mount.
    // A no-op stub is enough here since these tests don't exercise the actual drag
    // geometry (dnd-kit's collision detection needs real layout to resolve, which
    // jsdom can't provide) — that logic is covered directly by the reorderWidgets
    // unit tests above instead.
    class ResizeObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  })

  it('renders a row per widget using registry metadata for the label', () => {
    renderPage()

    expect(screen.getByText('Announcements')).toBeInTheDocument()
    expect(screen.getByText('Calendar')).toBeInTheDocument()
    expect(screen.getByText('Chores')).toBeInTheDocument()
  })

  it('gives each widget a keyboard-focusable, labeled drag handle', () => {
    renderPage()

    const handle = screen.getByRole('button', { name: /reorder announcements/i })
    expect(handle).toHaveAttribute('tabindex', '0')
  })

  it('toggles visibility locally without saving until "Save changes" is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    const announcementsSwitch = screen.getByRole('switch', { name: /show announcements/i })
    expect(announcementsSwitch).toHaveAttribute('aria-checked', 'true')

    await user.click(announcementsSwitch)
    expect(announcementsSwitch).toHaveAttribute('aria-checked', 'false')
    expect(mutate).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(mutate).toHaveBeenCalledTimes(1)
    const payload = mutate.mock.calls[0][0]
    expect(payload.theme).toBe('modern')
    expect(payload.widgets.find((w: { type: string }) => w.type === 'announcements').isVisible).toBe(false)
  })

  it('seeds the calendar view picker from the saved setting and includes it when saving', async () => {
    mockedUseDashboardConfig.mockReturnValue({
      data: { ...baseConfig, calendarView: 'rolling' },
      isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('combobox', { name: /calendar view/i })).toHaveTextContent('Next 7 days')

    await user.click(screen.getByRole('button', { name: /save changes/i }))
    expect(mutate.mock.calls[0][0].calendarView).toBe('rolling')
  })

  it('seeds the theme picker from the current server-persisted theme', () => {
    renderPage()

    expect(screen.getByRole('combobox', { name: /theme/i })).toHaveTextContent('Modern')
  })

  it('shows which seasonal palette is active when the theme is "Auto (Seasonal)"', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 31)) // Halloween
    mockedUseDashboardConfig.mockReturnValue({
      data: { ...baseConfig, theme: 'auto' },
      isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    renderPage()

    expect(screen.getByText(/showing halloween today/i)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('omits the seasonal-palette caption for a non-auto theme', () => {
    renderPage()

    expect(screen.queryByText(/showing .* today/i)).not.toBeInTheDocument()
  })

  it('shows a "Stop previewing" action once a preview is active', () => {
    // The DOM's data-theme attribute is ThemeProvider's responsibility, reading
    // this same shared context — not mounted in this file, and already covered
    // directly in ThemeProvider.test.tsx's "applies an active preview theme" case.
    // What belongs to DashboardSettingsPage itself is this button's visibility.
    renderPageWithPreview('seasonal-halloween')

    expect(screen.getByRole('button', { name: /stop previewing/i })).toBeInTheDocument()
  })

  it('does not show "Stop previewing" when no preview is active', () => {
    renderPage()

    expect(screen.queryByRole('button', { name: /stop previewing/i })).not.toBeInTheDocument()
  })

  it('does not persist or save anything just from an active preview', () => {
    renderPageWithPreview('seasonal-christmas')

    expect(mutate).not.toHaveBeenCalled()
  })

  it('clears the preview when "Stop previewing" is clicked', async () => {
    const user = userEvent.setup()
    renderPageWithPreview('seasonal-christmas')
    expect(screen.getByRole('button', { name: /stop previewing/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /stop previewing/i }))

    expect(screen.queryByRole('button', { name: /stop previewing/i })).not.toBeInTheDocument()
  })
})

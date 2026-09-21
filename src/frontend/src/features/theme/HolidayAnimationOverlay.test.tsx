import { render } from '@testing-library/react'
import { act, useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboardConfig } from '@/features/dashboard/hooks/useDashboardConfig'
import { HolidayAnimationOverlay } from './HolidayAnimationOverlay'
import { PreviewThemeProvider, usePreviewTheme } from './PreviewThemeContext'

vi.mock('@/features/dashboard/hooks/useDashboardConfig', () => ({
  useDashboardConfig: vi.fn(),
}))

const mockedUseDashboardConfig = vi.mocked(useDashboardConfig)

function renderOverlay() {
  return render(
    <PreviewThemeProvider>
      <HolidayAnimationOverlay />
    </PreviewThemeProvider>,
  )
}

// Drives the preview context from outside, the way DashboardSettingsPage does.
function SetPreviewOnMount({ id }: { id: string }) {
  const { setPreviewThemeId } = usePreviewTheme()
  useEffect(() => {
    setPreviewThemeId(id)
  }, [id, setPreviewThemeId])
  return null
}

function renderOverlayWithPreview(id: string) {
  return render(
    <PreviewThemeProvider>
      <SetPreviewOnMount id={id} />
      <HolidayAnimationOverlay />
    </PreviewThemeProvider>,
  )
}

describe('HolidayAnimationOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockedUseDashboardConfig.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing on an ordinary day, even in Auto (Seasonal) mode', () => {
    vi.setSystemTime(new Date(2026, 9, 15)) // mid-October, not Halloween itself
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'auto', widgets: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = renderOverlay()

    expect(container).toBeEmptyDOMElement()
  })

  it('renders falling particles on the exact holiday date in Auto (Seasonal) mode', () => {
    vi.setSystemTime(new Date(2026, 9, 31)) // Halloween
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'auto', widgets: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = renderOverlay()

    const particles = container.querySelectorAll('.holiday-particle-fall')
    expect(particles.length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.holiday-particle-rise')).toHaveLength(0)
  })

  it('renders rising particles for a "rise" direction holiday', () => {
    vi.setSystemTime(new Date(2026, 1, 14)) // Valentine's Day
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'auto', widgets: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = renderOverlay()

    expect(container.querySelectorAll('.holiday-particle-rise').length).toBeGreaterThan(0)
  })

  it('renders nothing on a holiday date when a manual (non-auto) theme is selected', () => {
    vi.setSystemTime(new Date(2026, 11, 25)) // Christmas
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'family', widgets: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = renderOverlay()

    expect(container).toBeEmptyDOMElement()
  })

  it('turns on at the recheck interval once the holiday date arrives', () => {
    vi.setSystemTime(new Date(2026, 11, 24, 23, 0)) // Christmas Eve, 11 PM
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'auto', widgets: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = renderOverlay()
    expect(container).toBeEmptyDOMElement()

    vi.setSystemTime(new Date(2026, 11, 25, 0, 30)) // just past midnight, Christmas Day
    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000)
    })

    expect(container.querySelectorAll('.holiday-particle-fall').length).toBeGreaterThan(0)
  })

  it('shows a holiday\'s particles when previewing it, regardless of today\'s real date or saved theme', () => {
    vi.setSystemTime(new Date(2026, 5, 15)) // mid-June, nowhere near Halloween
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'family', widgets: [] }, // not even Auto
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = renderOverlayWithPreview('seasonal-halloween')

    expect(container.querySelectorAll('.holiday-particle-fall').length).toBeGreaterThan(0)
  })

  it('shows no particles when previewing a generic season with no exact holiday day', () => {
    vi.setSystemTime(new Date(2026, 9, 31)) // Halloween, for real
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'auto', widgets: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = renderOverlayWithPreview('seasonal-summer')

    // The preview (Summer, no holiday) overrides what today would otherwise show.
    expect(container).toBeEmptyDOMElement()
  })
})

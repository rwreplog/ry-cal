import { render } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboardConfig } from '@/features/dashboard/hooks/useDashboardConfig'
import { HolidayAnimationOverlay } from './HolidayAnimationOverlay'

vi.mock('@/features/dashboard/hooks/useDashboardConfig', () => ({
  useDashboardConfig: vi.fn(),
}))

const mockedUseDashboardConfig = vi.mocked(useDashboardConfig)

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

    const { container } = render(<HolidayAnimationOverlay />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders falling particles on the exact holiday date in Auto (Seasonal) mode', () => {
    vi.setSystemTime(new Date(2026, 9, 31)) // Halloween
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'auto', widgets: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = render(<HolidayAnimationOverlay />)

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

    const { container } = render(<HolidayAnimationOverlay />)

    expect(container.querySelectorAll('.holiday-particle-rise').length).toBeGreaterThan(0)
  })

  it('renders nothing on a holiday date when a manual (non-auto) theme is selected', () => {
    vi.setSystemTime(new Date(2026, 11, 25)) // Christmas
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'family', widgets: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = render(<HolidayAnimationOverlay />)

    expect(container).toBeEmptyDOMElement()
  })

  it('turns on at the recheck interval once the holiday date arrives', () => {
    vi.setSystemTime(new Date(2026, 11, 24, 23, 0)) // Christmas Eve, 11 PM
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'auto', widgets: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = render(<HolidayAnimationOverlay />)
    expect(container).toBeEmptyDOMElement()

    vi.setSystemTime(new Date(2026, 11, 25, 0, 30)) // just past midnight, Christmas Day
    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000)
    })

    expect(container.querySelectorAll('.holiday-particle-fall').length).toBeGreaterThan(0)
  })
})

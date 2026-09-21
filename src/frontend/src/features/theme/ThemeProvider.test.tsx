import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboardConfig } from '@/features/dashboard/hooks/useDashboardConfig'
import { ThemeProvider } from './ThemeProvider'

vi.mock('@/features/dashboard/hooks/useDashboardConfig', () => ({
  useDashboardConfig: vi.fn(),
}))

const mockedUseDashboardConfig = vi.mocked(useDashboardConfig)

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockedUseDashboardConfig.mockReset()
    document.documentElement.dataset.theme = ''
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('applies a non-auto theme directly to the DOM', () => {
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'family', widgets: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ThemeProvider>content</ThemeProvider>)

    expect(document.documentElement.dataset.theme).toBe('family')
  })

  it('resolves "auto" to today\'s seasonal theme rather than applying "auto" literally', () => {
    vi.setSystemTime(new Date(2026, 9, 31)) // Halloween
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'auto', widgets: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ThemeProvider>content</ThemeProvider>)

    expect(document.documentElement.dataset.theme).toBe('seasonal-halloween')
  })

  it('re-resolves the seasonal theme after the recheck interval elapses', () => {
    vi.setSystemTime(new Date(2026, 9, 31, 23, 0)) // Halloween, 11 PM
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'auto', widgets: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ThemeProvider>content</ThemeProvider>)
    expect(document.documentElement.dataset.theme).toBe('seasonal-halloween')

    // Cross midnight into November 1st — a kiosk left open overnight should pick
    // up Thanksgiving's theme without a manual reload.
    vi.setSystemTime(new Date(2026, 10, 1, 0, 30))
    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000)
    })

    expect(document.documentElement.dataset.theme).toBe('seasonal-thanksgiving')
  })
})

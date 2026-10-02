import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NightDimOverlay, isNightHour } from './NightDimOverlay'

describe('isNightHour', () => {
  it('is night from 10 PM until 6 AM', () => {
    expect([22, 23, 0, 3, 5].every(isNightHour)).toBe(true)
    expect([6, 12, 21].some(isNightHour)).toBe(false)
  })
})

describe('NightDimOverlay', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders nothing during the day', () => {
    vi.setSystemTime(new Date(2026, 8, 26, 14, 0))
    render(<NightDimOverlay />)
    expect(screen.queryByTestId('night-dim')).not.toBeInTheDocument()
  })

  it('dims at night and turns on when the hour arrives', () => {
    vi.setSystemTime(new Date(2026, 8, 26, 21, 59))
    render(<NightDimOverlay />)
    expect(screen.queryByTestId('night-dim')).not.toBeInTheDocument()

    vi.setSystemTime(new Date(2026, 8, 26, 22, 1))
    act(() => {
      vi.advanceTimersByTime(60 * 1000)
    })
    expect(screen.getByTestId('night-dim')).toBeInTheDocument()
  })
})

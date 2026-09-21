import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { HeaderClockWeather } from './HeaderClockWeather'

vi.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

const mockedUseDashboard = vi.mocked(useDashboard)

describe('HeaderClockWeather', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00'))
    mockedUseDashboard.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the current time and date even before dashboard data has loaded', () => {
    mockedUseDashboard.mockReturnValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<HeaderClockWeather />)

    expect(screen.getByText('12:00 PM')).toBeInTheDocument()
    expect(screen.getByText(/thursday, january 1/i)).toBeInTheDocument()
  })

  it('shows weather and a matching condition icon once dashboard data includes a current snapshot', () => {
    mockedUseDashboard.mockReturnValue({
      data: { weather: { current: { temperatureF: 68, condition: 'Overcast', highF: 70, lowF: 60 } } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = render(<HeaderClockWeather />)

    expect(screen.getByText('68°')).toBeInTheDocument()
    expect(screen.getByText('Overcast')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('falls back to a generic icon for a condition string it does not recognize', () => {
    mockedUseDashboard.mockReturnValue({
      data: { weather: { current: { temperatureF: 68, condition: 'Volcanic ash', highF: 70, lowF: 60 } } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = render(<HeaderClockWeather />)

    expect(screen.getByText('Volcanic ash')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('omits weather when no location has been configured yet', () => {
    mockedUseDashboard.mockReturnValue({
      data: { weather: { current: null } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<HeaderClockWeather />)

    expect(screen.queryByText('°', { exact: false })).not.toBeInTheDocument()
  })
})

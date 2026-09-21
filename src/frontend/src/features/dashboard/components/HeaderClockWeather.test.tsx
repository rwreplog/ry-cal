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

  it('shows the current time and a short date even before dashboard data has loaded', () => {
    mockedUseDashboard.mockReturnValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<HeaderClockWeather />)

    expect(screen.getByText('12:00 PM')).toBeInTheDocument()
    // Short form ("Thu, Jan 1"), not the long form ("Thursday, January 1") — the
    // long form was wide enough to wrap onto its own second line in the header's
    // narrow middle column.
    expect(screen.getByText(/thu, jan 1/i)).toBeInTheDocument()
  })

  it('shows temp, condition, high/low, and a matching icon once dashboard data includes a current snapshot', () => {
    mockedUseDashboard.mockReturnValue({
      data: {
        weather: {
          current: {
            temperatureF: 68,
            condition: 'Overcast',
            highF: 70,
            lowF: 60,
            inclementWeatherExpected: false,
            forecastCondition: 'Overcast',
          },
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = render(<HeaderClockWeather />)

    expect(screen.getByText('68°')).toBeInTheDocument()
    expect(screen.getByText(/overcast/i)).toBeInTheDocument()
    expect(screen.getByText(/H70°/)).toBeInTheDocument()
    expect(screen.getByText(/L60°/)).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('falls back to a generic icon for a condition string it does not recognize', () => {
    mockedUseDashboard.mockReturnValue({
      data: {
        weather: {
          current: {
            temperatureF: 68,
            condition: 'Volcanic ash',
            highF: 70,
            lowF: 60,
            inclementWeatherExpected: false,
            forecastCondition: 'Volcanic ash',
          },
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = render(<HeaderClockWeather />)

    expect(screen.getByText(/volcanic ash/i)).toBeInTheDocument()
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

  it('shows an inclement-weather notice when rain or snow is expected today', () => {
    mockedUseDashboard.mockReturnValue({
      data: {
        weather: {
          current: {
            temperatureF: 45,
            condition: 'Partly cloudy',
            highF: 50,
            lowF: 38,
            inclementWeatherExpected: true,
            forecastCondition: 'Rain',
          },
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<HeaderClockWeather />)

    expect(screen.getByText(/rain expected today/i)).toBeInTheDocument()
  })

  it('omits the inclement-weather notice when none is expected', () => {
    mockedUseDashboard.mockReturnValue({
      data: {
        weather: {
          current: {
            temperatureF: 68,
            condition: 'Clear sky',
            highF: 75,
            lowF: 60,
            inclementWeatherExpected: false,
            forecastCondition: 'Clear sky',
          },
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<HeaderClockWeather />)

    expect(screen.queryByText(/expected today/i)).not.toBeInTheDocument()
  })
})

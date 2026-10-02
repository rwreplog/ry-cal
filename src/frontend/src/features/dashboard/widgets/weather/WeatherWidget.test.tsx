import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import type { DashboardDto, WeatherSnapshotDto } from '@/types/dashboard'
import { WeatherWidget } from './WeatherWidget'

vi.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

const mockedUseDashboard = vi.mocked(useDashboard)

function dashboardWith(current: WeatherSnapshotDto | null): DashboardDto {
  return {
    generatedAtUtc: new Date().toISOString(),
    layout: [],
    calendar: { events: [] },
    chores: { items: [] },
    weather: { current },
    announcements: { items: [] },
    meals: { items: [] },
    shoppingList: { items: [], totalUncheckedCount: 0 },
    birthdays: { items: [] },
    countdowns: { items: [] },
  }
}

describe('WeatherWidget', () => {
  it('shows temp, condition, high/low, and a matching icon once dashboard data includes a current snapshot', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({
        temperatureF: 68,
        condition: 'Overcast',
        highF: 70,
        lowF: 60,
        inclementWeatherExpected: false,
        forecastCondition: 'Overcast',
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = render(<WeatherWidget />)

    expect(screen.getByText('68°')).toBeInTheDocument()
    expect(screen.getByText(/overcast/i)).toBeInTheDocument()
    expect(screen.getByText(/H70°/)).toBeInTheDocument()
    expect(screen.getByText(/L60°/)).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('falls back to a generic icon for a condition string it does not recognize', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({
        temperatureF: 68,
        condition: 'Volcanic ash',
        highF: 70,
        lowF: 60,
        inclementWeatherExpected: false,
        forecastCondition: 'Volcanic ash',
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { container } = render(<WeatherWidget />)

    expect(screen.getByText(/volcanic ash/i)).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('prompts for a home location when none has been configured yet', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith(null),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<WeatherWidget />)

    expect(screen.getByText(/set your home location/i)).toBeInTheDocument()
  })

  it('shows an inclement-weather notice when rain or snow is expected today', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({
        temperatureF: 45,
        condition: 'Partly cloudy',
        highF: 50,
        lowF: 38,
        inclementWeatherExpected: true,
        forecastCondition: 'Rain',
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<WeatherWidget />)

    expect(screen.getByText(/rain expected today/i)).toBeInTheDocument()
  })

  it('omits the inclement-weather notice when none is expected', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({
        temperatureF: 68,
        condition: 'Clear sky',
        highF: 75,
        lowF: 60,
        inclementWeatherExpected: false,
        forecastCondition: 'Clear sky',
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<WeatherWidget />)

    expect(screen.queryByText(/expected today/i)).not.toBeInTheDocument()
  })

  it('shows an error message when the dashboard fetch fails', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<WeatherWidget />)

    expect(screen.getByText(/couldn't load the weather/i)).toBeInTheDocument()
  })
})

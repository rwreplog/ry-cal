import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import type { DashboardDto } from '@/types/dashboard'
import { CalendarWidget } from './CalendarWidget'

vi.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

const mockedUseDashboard = vi.mocked(useDashboard)

function dashboardWith(events: DashboardDto['calendar']['events']): DashboardDto {
  return {
    generatedAtUtc: new Date().toISOString(),
    layout: [],
    calendar: { events },
    chores: { items: [] },
    weather: { current: { temperatureF: 70, condition: 'Clear', highF: 75, lowF: 60 } },
    announcements: { items: [] },
    meals: { items: [] },
    shoppingList: { items: [], totalUncheckedCount: 0 },
    birthdays: { items: [] },
    countdowns: { items: [] },
  }
}

describe('CalendarWidget', () => {
  beforeEach(() => {
    mockedUseDashboard.mockReset()
  })

  it('renders all 7 weekday column headers', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    for (const label of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('shows an event title in the grid when it falls within the current week', () => {
    const now = new Date()
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([
        { id: 'evt-1', title: 'Team breakfast', startsAtUtc: now.toISOString(), endsAtUtc: now.toISOString() },
      ]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    expect(screen.getByText('Team breakfast')).toBeInTheDocument()
  })

  it('shows an error message when the fetch fails', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    expect(screen.getByText(/couldn't load calendar events/i)).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import type { DashboardDto } from '@/types/dashboard'
import { CalendarWidget } from './CalendarWidget'

vi.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

const mockedUseDashboard = vi.mocked(useDashboard)

function dashboardWith(overrides: {
  events?: DashboardDto['calendar']['events']
  chores?: DashboardDto['chores']['items']
  meals?: DashboardDto['meals']['items']
}): DashboardDto {
  return {
    generatedAtUtc: new Date().toISOString(),
    layout: [],
    calendar: { events: overrides.events ?? [] },
    chores: { items: overrides.chores ?? [] },
    weather: {
      current: {
        temperatureF: 70,
        condition: 'Clear',
        highF: 75,
        lowF: 60,
        inclementWeatherExpected: false,
        forecastCondition: 'Clear',
      },
    },
    announcements: { items: [] },
    meals: { items: overrides.meals ?? [] },
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
      data: dashboardWith({}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    for (const label of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('shows a faded "No events today" placeholder for every day when there are no events', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    expect(screen.getAllByText('No events today')).toHaveLength(7)
  })

  it('omits the "No events today" placeholder only for the day that has an event', () => {
    const now = new Date()
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({
        events: [{ id: 'evt-1', title: 'Team breakfast', startsAtUtc: now.toISOString(), endsAtUtc: now.toISOString() }],
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    expect(screen.getAllByText('No events today')).toHaveLength(6)
  })

  it('shows an event title in the grid when it falls within the current week', () => {
    const now = new Date()
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({
        events: [{ id: 'evt-1', title: 'Team breakfast', startsAtUtc: now.toISOString(), endsAtUtc: now.toISOString() }],
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    expect(screen.getByText('Team breakfast')).toBeInTheDocument()
  })

  it('shows a chore title in the grid when it is due within the current week, color-coded by assignee', () => {
    const now = new Date()
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({
        chores: [
          {
            id: 'chore-1',
            title: 'Empty dishwasher',
            assignedTo: 'Sam',
            assignedToFamilyMemberId: 'member-1',
            assignedToColor: '#0ea5e9',
            dueAtUtc: now.toISOString(),
            isComplete: false,
          },
        ],
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    const chore = screen.getByText('Empty dishwasher')
    expect(chore).toBeInTheDocument()
    const dot = chore.parentElement?.querySelector('span[aria-hidden="true"]')
    expect(dot).toHaveStyle({ backgroundColor: '#0ea5e9' })
  })

  it('shows a "Chores by" legend with one deduped entry per assigned family member', () => {
    const now = new Date()
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({
        chores: [
          {
            id: 'chore-1',
            title: 'Empty dishwasher',
            assignedTo: 'Sam',
            assignedToFamilyMemberId: 'member-1',
            assignedToColor: '#0ea5e9',
            dueAtUtc: now.toISOString(),
            isComplete: false,
          },
          {
            id: 'chore-2',
            title: 'Feed the dog',
            assignedTo: 'Sam',
            assignedToFamilyMemberId: 'member-1',
            assignedToColor: '#0ea5e9',
            dueAtUtc: now.toISOString(),
            isComplete: false,
          },
          {
            id: 'chore-3',
            title: 'Take out trash',
            assignedTo: 'Jordan',
            assignedToFamilyMemberId: 'member-2',
            assignedToColor: '#f97316',
            dueAtUtc: now.toISOString(),
            isComplete: false,
          },
        ],
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    expect(screen.getByText('Chores by')).toBeInTheDocument()
    expect(screen.getByText('Sam')).toBeInTheDocument()
    expect(screen.getByText('Jordan')).toBeInTheDocument()
  })

  it('omits the legend when no chores are assigned to anyone', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    expect(screen.queryByText('Chores by')).not.toBeInTheDocument()
  })

  it('shows the meal name in the grid when it is planned within the current week', () => {
    const today = new Date()
    const todayDateOnly = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({
        meals: [{ id: 'meal-1', date: todayDateOnly, name: 'Tacos', description: 'Beef tacos' }],
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    expect(screen.getByText('Tacos')).toBeInTheDocument()
  })

  it('shows "No dinner planned" for a day with no meal', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    expect(screen.getAllByText('No dinner planned')).toHaveLength(7)
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

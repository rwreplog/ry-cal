import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useChoreMutations } from '@/features/chores/hooks/useChoreMutations'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useDashboardConfig } from '@/features/dashboard/hooks/useDashboardConfig'
import type { DashboardDto } from '@/types/dashboard'
import { CalendarWidget } from './CalendarWidget'

vi.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

vi.mock('@/features/dashboard/hooks/useDashboardConfig', () => ({
  useDashboardConfig: vi.fn(),
}))

vi.mock('@/features/chores/hooks/useChoreMutations', () => ({
  useChoreMutations: vi.fn(),
}))

const mockedUseDashboard = vi.mocked(useDashboard)
const mockedUseDashboardConfig = vi.mocked(useDashboardConfig)

function useCalendarView(calendarView: 'week' | 'rolling') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockedUseDashboardConfig.mockReturnValue({ data: { theme: 'modern', widgets: [], calendarView } } as any)
}
const mockedUseChoreMutations = vi.mocked(useChoreMutations)
const completeMutate = vi.fn()

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
    completeMutate.mockReset()
    useCalendarView('week')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseChoreMutations.mockReturnValue({ complete: { mutate: completeMutate } } as any)
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
            choreId: 'chore-1',
            title: 'Empty dishwasher',
            assignedTo: 'Sam',
            assignedToFamilyMemberId: 'member-1',
            assignedToColor: '#0ea5e9',
            dueAtUtc: now.toISOString(),
            isComplete: false, recurrence: 'none',
          },
        ],
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    const pill = screen.getByRole('button', { name: /mark empty dishwasher complete/i })
    expect(pill).toHaveStyle({ backgroundColor: '#0ea5e9' })
  })

  it('completes an assigned chore when its checkbox row is tapped', async () => {
    const user = userEvent.setup()
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({
        chores: [
          {
            id: 'chore-1',
            choreId: 'chore-1',
            title: 'Empty dishwasher',
            assignedTo: 'Sam',
            assignedToFamilyMemberId: 'member-1',
            assignedToColor: '#0ea5e9',
            dueAtUtc: new Date().toISOString(),
            isComplete: false, recurrence: 'none',
          },
        ],
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)
    await user.click(screen.getByRole('button', { name: /mark empty dishwasher complete/i }))

    expect(completeMutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'chore-1', request: expect.objectContaining({ familyMemberId: 'member-1' }) }),
    )
  })

  it('does not allow completing an unassigned chore or one already complete', () => {
    const dueAtUtc = new Date().toISOString()
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({
        chores: [
          { id: 'a', choreId: 'a', title: 'Unassigned one', assignedTo: '', assignedToFamilyMemberId: null, assignedToColor: null, dueAtUtc, isComplete: false, recurrence: 'none' },
          { id: 'b', choreId: 'b', title: 'Done one', assignedTo: 'Sam', assignedToFamilyMemberId: 'member-1', assignedToColor: '#0ea5e9', dueAtUtc, isComplete: true, recurrence: 'none' },
        ],
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    expect(screen.getByRole('button', { name: /mark unassigned one complete/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /done one is complete/i })).toBeDisabled()
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
            choreId: 'chore-1',
            title: 'Empty dishwasher',
            assignedTo: 'Sam',
            assignedToFamilyMemberId: 'member-1',
            assignedToColor: '#0ea5e9',
            dueAtUtc: now.toISOString(),
            isComplete: false, recurrence: 'none',
          },
          {
            id: 'chore-2',
            choreId: 'chore-2',
            title: 'Feed the dog',
            assignedTo: 'Sam',
            assignedToFamilyMemberId: 'member-1',
            assignedToColor: '#0ea5e9',
            dueAtUtc: now.toISOString(),
            isComplete: false, recurrence: 'none',
          },
          {
            id: 'chore-3',
            choreId: 'chore-3',
            title: 'Take out trash',
            assignedTo: 'Jordan',
            assignedToFamilyMemberId: 'member-2',
            assignedToColor: '#f97316',
            dueAtUtc: now.toISOString(),
            isComplete: false, recurrence: 'none',
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

  it('shows an all-day event once as a spanning bar rather than a chip per day', () => {
    const start = new Date()
    start.setUTCHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 3)
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({
        events: [{ id: 'trip', title: 'St Joe', startsAtUtc: start.toISOString(), endsAtUtc: end.toISOString() }],
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    expect(screen.getAllByText('St Joe')).toHaveLength(1)
  })

  it('adds an Unassigned legend entry when a chore has no assignee', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({
        chores: [
          { id: 'u', choreId: 'u', title: 'Water plants', assignedTo: 'Unassigned', assignedToFamilyMemberId: null, assignedToColor: null, dueAtUtc: new Date().toISOString(), isComplete: false, recurrence: 'none' },
        ],
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    expect(screen.getByText('Unassigned')).toBeInTheDocument()
  })

  it('shows a daily chore on later days but only lets today\'s occurrence be completed', () => {
    useCalendarView('rolling') // a full 7 days from today, regardless of the weekday tests run on
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith({
        chores: [
          { id: 'd', choreId: 'd', title: 'Feed cat', assignedTo: 'Sam', assignedToFamilyMemberId: 'member-1', assignedToColor: '#0ea5e9', dueAtUtc: new Date().toISOString(), isComplete: false, recurrence: 'daily' },
        ],
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CalendarWidget />)

    const pills = screen.getAllByRole('button', { name: /mark feed cat complete/i })
    expect(pills).toHaveLength(7)
    expect(pills.filter((p) => !(p as HTMLButtonElement).disabled)).toHaveLength(1)
  })

  it('labels the card "This Week" by default and "Next 7 Days" for the rolling view', () => {
    mockedUseDashboard.mockReturnValue({ isLoading: false, isError: false, data: dashboardWith({}) } as never)
    const { unmount } = render(<CalendarWidget />)
    expect(screen.getByText('This Week')).toBeInTheDocument()
    unmount()

    useCalendarView('rolling')
    render(<CalendarWidget />)
    expect(screen.getByText('Next 7 Days')).toBeInTheDocument()
  })

  it('starts the week view on Sunday even when today is later in the week', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 25, 12)) // Friday
    mockedUseDashboard.mockReturnValue({ isLoading: false, isError: false, data: dashboardWith({}) } as never)

    render(<CalendarWidget />)

    const labels = screen.getAllByText(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)$/).map((el) => el.textContent)
    expect(labels).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
    vi.useRealTimers()
  })
})

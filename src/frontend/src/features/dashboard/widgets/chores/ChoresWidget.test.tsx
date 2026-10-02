import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useChoreMutations } from '@/features/chores/hooks/useChoreMutations'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import type { DashboardDto } from '@/types/dashboard'
import { ChoresWidget } from './ChoresWidget'

vi.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

vi.mock('@/features/chores/hooks/useChoreMutations', () => ({
  useChoreMutations: vi.fn(),
}))

const mockedUseDashboard = vi.mocked(useDashboard)
const mockedUseChoreMutations = vi.mocked(useChoreMutations)

function dashboardWith(chores: DashboardDto['chores']['items']): DashboardDto {
  return {
    generatedAtUtc: new Date().toISOString(),
    layout: [],
    calendar: { events: [] },
    chores: { items: chores },
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
    meals: { items: [] },
    shoppingList: { items: [], totalUncheckedCount: 0 },
    birthdays: { items: [] },
    countdowns: { items: [] },
  }
}

describe('ChoresWidget', () => {
  const mutate = vi.fn()

  beforeEach(() => {
    mutate.mockReset()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseChoreMutations.mockReturnValue({ complete: { mutate } } as any)
  })

  it('completes an assigned chore when its icon is tapped', async () => {
    const user = userEvent.setup()
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([
        { id: 'chore-1', title: 'Take out the trash', assignedTo: 'Sam', assignedToFamilyMemberId: 'member-1', assignedToColor: '#0ea5e9', dueAtUtc: new Date().toISOString(), isComplete: false, recurrence: 'none' },
      ]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ChoresWidget />)

    const button = screen.getByRole('button', { name: /mark take out the trash complete/i })
    expect(button).toBeEnabled()

    await user.click(button)

    expect(mutate).toHaveBeenCalledWith({ id: 'chore-1', request: { familyMemberId: 'member-1' } })
  })

  it('disables completion for an unassigned chore', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([
        { id: 'chore-2', title: 'Clean garage', assignedTo: 'Unassigned', assignedToFamilyMemberId: null, assignedToColor: null, dueAtUtc: new Date().toISOString(), isComplete: false, recurrence: 'none' },
      ]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ChoresWidget />)

    expect(screen.getByRole('button', { name: /mark clean garage complete/i })).toBeDisabled()
  })

  it('disables completion for an already-complete chore', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([
        { id: 'chore-3', title: 'Feed the dog', assignedTo: 'Jordan', assignedToFamilyMemberId: 'member-2', assignedToColor: '#a855f7', dueAtUtc: new Date().toISOString(), isComplete: true, recurrence: 'none' },
      ]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ChoresWidget />)

    expect(screen.getByRole('button', { name: /feed the dog is complete/i })).toBeDisabled()
  })

  it('shows a celebratory message when every chore due today is complete', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([
        { id: 'c1', title: 'Feed the dog', assignedTo: 'Sam', assignedToFamilyMemberId: 'member-1', assignedToColor: '#0ea5e9', dueAtUtc: new Date().toISOString(), isComplete: true, recurrence: 'none' },
      ]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ChoresWidget />)

    expect(screen.getByText(/all done for today/i)).toBeInTheDocument()
    // The completed chore itself stays visible underneath the celebration.
    expect(screen.getByText('Feed the dog')).toBeInTheDocument()
  })

  it('says nothing is due today when the only chores are later in the week', () => {
    const nextWeek = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([
        { id: 'c1', title: 'Mow lawn', assignedTo: 'Sam', assignedToFamilyMemberId: 'member-1', assignedToColor: '#0ea5e9', dueAtUtc: nextWeek, isComplete: false, recurrence: 'none' },
      ]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ChoresWidget />)

    expect(screen.getByText(/nothing due today/i)).toBeInTheDocument()
    expect(screen.getByText('Upcoming')).toBeInTheDocument()
    expect(screen.getByText('Mow lawn')).toBeInTheDocument()
  })

  it('puts an overdue incomplete chore in Today rather than silently dropping it', () => {
    const lastWeek = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([
        { id: 'c1', title: 'Water plants', assignedTo: 'Sam', assignedToFamilyMemberId: 'member-1', assignedToColor: '#0ea5e9', dueAtUtc: lastWeek, isComplete: false, recurrence: 'none' },
      ]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ChoresWidget />)

    expect(screen.getByText('Water plants')).toBeInTheDocument()
    expect(screen.queryByText(/all done for today/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/nothing due today/i)).not.toBeInTheDocument()
  })
})

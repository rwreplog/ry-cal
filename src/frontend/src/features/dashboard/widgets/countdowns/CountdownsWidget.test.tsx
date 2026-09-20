import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import type { DashboardDto } from '@/types/dashboard'
import { CountdownsWidget } from './CountdownsWidget'

vi.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

const mockedUseDashboard = vi.mocked(useDashboard)

function dashboardWith(countdowns: DashboardDto['countdowns']['items']): DashboardDto {
  return {
    generatedAtUtc: new Date().toISOString(),
    layout: [],
    calendar: { events: [] },
    chores: { items: [] },
    weather: { current: null },
    announcements: { items: [] },
    meals: { items: [] },
    shoppingList: { items: [], totalUncheckedCount: 0 },
    birthdays: { items: [] },
    countdowns: { items: countdowns },
  }
}

describe('CountdownsWidget', () => {
  beforeEach(() => {
    mockedUseDashboard.mockReset()
  })

  it('shows the empty state when there are no countdowns', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CountdownsWidget />)

    expect(screen.getByText(/no countdowns yet/i)).toBeInTheDocument()
  })

  it("renders a countdown's days-until label", () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([{ id: 'c-1', label: 'Disney trip', targetDate: '2027-01-01', daysUntil: 12 }]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CountdownsWidget />)

    expect(screen.getByText('Disney trip')).toBeInTheDocument()
    expect(screen.getByText('12 days')).toBeInTheDocument()
  })
})

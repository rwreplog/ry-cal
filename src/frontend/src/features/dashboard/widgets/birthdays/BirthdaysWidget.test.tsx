import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import type { DashboardDto } from '@/types/dashboard'
import { BirthdaysWidget } from './BirthdaysWidget'

vi.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

const mockedUseDashboard = vi.mocked(useDashboard)

function dashboardWith(birthdays: DashboardDto['birthdays']['items']): DashboardDto {
  return {
    generatedAtUtc: new Date().toISOString(),
    layout: [],
    calendar: { events: [] },
    chores: { items: [] },
    weather: { current: null },
    announcements: { items: [] },
    meals: { items: [] },
    shoppingList: { items: [], totalUncheckedCount: 0 },
    birthdays: { items: birthdays },
    countdowns: { items: [] },
  }
}

describe('BirthdaysWidget', () => {
  beforeEach(() => {
    mockedUseDashboard.mockReset()
  })

  it('shows the empty state when there are no upcoming birthdays', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<BirthdaysWidget />)

    expect(screen.getByText(/no birthdays in the next 30 days/i)).toBeInTheDocument()
  })

  it("renders a birthday's days-until label", () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([{ id: 'b-1', name: 'Grandma', date: '1950-01-01', daysUntil: 0 }]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<BirthdaysWidget />)

    expect(screen.getByText('Grandma')).toBeInTheDocument()
    expect(screen.getByText('Today!')).toBeInTheDocument()
  })
})

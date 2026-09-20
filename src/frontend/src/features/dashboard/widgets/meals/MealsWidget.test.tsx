import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import type { DashboardDto } from '@/types/dashboard'
import { MealsWidget } from './MealsWidget'

vi.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

const mockedUseDashboard = vi.mocked(useDashboard)

function dashboardWith(meals: DashboardDto['meals']['items']): DashboardDto {
  return {
    generatedAtUtc: new Date().toISOString(),
    layout: [],
    calendar: { events: [] },
    chores: { items: [] },
    weather: { current: null },
    announcements: { items: [] },
    meals: { items: meals },
    shoppingList: { items: [], totalUncheckedCount: 0 },
    birthdays: { items: [] },
    countdowns: { items: [] },
  }
}

describe('MealsWidget', () => {
  beforeEach(() => {
    mockedUseDashboard.mockReset()
  })

  it('shows the empty state when no meals are planned', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<MealsWidget />)

    expect(screen.getByText(/no meals planned yet/i)).toBeInTheDocument()
  })

  it('renders planned meals', () => {
    const today = new Date().toISOString().slice(0, 10)
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([{ id: 'meal-1', date: today, name: 'Tacos', description: 'Use the leftover chicken' }]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<MealsWidget />)

    expect(screen.getByText('Tacos')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()
  })
})

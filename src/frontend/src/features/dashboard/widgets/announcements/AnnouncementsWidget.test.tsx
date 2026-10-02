import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import type { DashboardDto } from '@/types/dashboard'
import { AnnouncementsWidget } from './AnnouncementsWidget'

vi.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

const mockedUseDashboard = vi.mocked(useDashboard)

function dashboardWith(items: DashboardDto['announcements']['items']): DashboardDto {
  return {
    generatedAtUtc: new Date().toISOString(),
    layout: [],
    calendar: { events: [] },
    chores: { items: [] },
    weather: { current: null },
    announcements: { items },
    meals: { items: [] },
    shoppingList: { items: [], totalUncheckedCount: 0 },
    birthdays: { items: [] },
    countdowns: { items: [] },
  }
}

describe('AnnouncementsWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
    mockedUseDashboard.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the empty state when there are no announcements', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<AnnouncementsWidget />)

    expect(screen.getByText(/no announcements/i)).toBeInTheDocument()
  })

  it('shows the message, poster, and a relative time, and clamps long messages', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([
        {
          id: 'ann-1',
          message: 'Pizza night moved to Friday this week',
          postedBy: 'Mom',
          postedAtUtc: new Date('2026-01-01T11:15:00Z').toISOString(), // 45 min ago
        },
      ]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<AnnouncementsWidget />)

    const message = screen.getByText('Pizza night moved to Friday this week')
    expect(message).toBeInTheDocument()
    expect(message.className).toContain('line-clamp-3')
    expect(screen.getByText(/Mom.*45 min ago/)).toBeInTheDocument()
  })

  it('shows an hours-ago label for something posted earlier today', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([
        {
          id: 'ann-1',
          message: 'Early pickup today',
          postedBy: 'Dad',
          postedAtUtc: new Date('2026-01-01T09:00:00Z').toISOString(), // 3 hr ago
        },
      ]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<AnnouncementsWidget />)

    expect(screen.getByText(/3 hr ago/)).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import type { DashboardDto } from '@/types/dashboard'
import { DashboardShell } from './DashboardShell'

function renderShell() {
  return render(
    <MemoryRouter>
      <DashboardShell />
    </MemoryRouter>,
  )
}

vi.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

const mockedUseDashboard = vi.mocked(useDashboard)

const emptyDashboard: DashboardDto = {
  generatedAtUtc: new Date().toISOString(),
  layout: [],
  calendar: { events: [] },
  chores: { items: [] },
  weather: { current: { temperatureF: 70, condition: 'Clear', highF: 75, lowF: 60 } },
  announcements: { items: [] },
}

describe('DashboardShell', () => {
  beforeEach(() => {
    mockedUseDashboard.mockReset()
  })

  it('renders a loading state while the dashboard is fetching', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
      refetch: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    renderShell()

    expect(screen.getByRole('status', { name: /loading dashboard/i })).toBeInTheDocument()
  })

  it('renders an error state with a retry action when the fetch fails', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    renderShell()

    expect(screen.getByText(/couldn't load the dashboard/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('renders the empty state when there are no widgets in the layout', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: emptyDashboard,
      refetch: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    renderShell()

    expect(screen.getByText(/no widgets configured yet/i)).toBeInTheDocument()
  })
})

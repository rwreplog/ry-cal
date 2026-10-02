import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@/features/dashboard/widgets' // registers the real widget definitions used by the rail + calendar pane
import { useChoreMutations } from '@/features/chores/hooks/useChoreMutations'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useDashboardConfig } from '@/features/dashboard/hooks/useDashboardConfig'
import { PreviewThemeProvider } from '@/features/theme/PreviewThemeContext'
import type { DashboardDto } from '@/types/dashboard'
import { SidebarDashboardShell } from './SidebarDashboardShell'

function renderShell(initialEntries = ['/']) {
  return render(
    <PreviewThemeProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <SidebarDashboardShell />
      </MemoryRouter>
    </PreviewThemeProvider>,
  )
}

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
const mockedUseChoreMutations = vi.mocked(useChoreMutations)

function dashboardWith(layout: DashboardDto['layout']): DashboardDto {
  return {
    generatedAtUtc: new Date().toISOString(),
    layout,
    calendar: { events: [] },
    chores: { items: [] },
    weather: { current: null },
    announcements: { items: [] },
    meals: { items: [] },
    shoppingList: { items: [], totalUncheckedCount: 0 },
    birthdays: { items: [] },
    countdowns: { items: [] },
  }
}

describe('SidebarDashboardShell', () => {
  beforeEach(() => {
    mockedUseDashboard.mockReset()
    mockedUseDashboardConfig.mockReset()
    mockedUseChoreMutations.mockReset()
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'modern', widgets: [], calendarView: 'week', dashboardLayout: 'sidebar' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseChoreMutations.mockReturnValue({ complete: { mutate: vi.fn() } } as any)
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
      data: dashboardWith([]),
      refetch: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    renderShell()

    expect(screen.getByText(/no widgets configured yet/i)).toBeInTheDocument()
  })

  it('puts the calendar in the main pane and every other visible widget in the rail', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([
        { type: 'chores', size: 'md', order: 1 },
        { type: 'calendar', size: 'md', order: 0 },
        { type: 'countdowns', size: 'md', order: 2 },
      ]),
      refetch: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    renderShell()

    // The calendar card and the rail's widget cards (each has its own title) —
    // scoped to card titles specifically, since the calendar's per-day "Chores"
    // section labels would otherwise also match plain getByText('Chores').
    expect(screen.getByText('This Week')).toBeInTheDocument()
    const cardTitle = (text: string) =>
      screen.getAllByText(text).some((el) => el.getAttribute('data-slot') === 'card-title')
    expect(cardTitle('Chores')).toBe(true)
    expect(cardTitle('Countdowns')).toBe(true)
  })

  it('shows a fallback in the main pane when the calendar itself is hidden', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([{ type: 'chores', size: 'md', order: 0 }]),
      refetch: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    renderShell()

    expect(screen.getByText(/calendar is hidden/i)).toBeInTheDocument()
    expect(screen.queryByText('This Week')).not.toBeInTheDocument()
  })

  it('links back to Admin, but hides that link in TV mode', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([{ type: 'calendar', size: 'md', order: 0 }]),
      refetch: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { unmount } = renderShell()
    expect(screen.getByRole('link', { name: /open admin settings/i })).toHaveAttribute('href', '/admin')
    unmount()

    renderShell(['/?tv=1'])
    expect(screen.queryByRole('link', { name: /open admin settings/i })).not.toBeInTheDocument()
  })
})

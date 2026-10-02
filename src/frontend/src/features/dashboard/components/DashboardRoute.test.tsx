import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@/features/dashboard/widgets'
import { useChoreMutations } from '@/features/chores/hooks/useChoreMutations'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useDashboardConfig } from '@/features/dashboard/hooks/useDashboardConfig'
import { PreviewThemeProvider } from '@/features/theme/PreviewThemeContext'
import { DashboardRoute } from './DashboardRoute'

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

function renderRoute() {
  return render(
    <PreviewThemeProvider>
      <MemoryRouter>
        <DashboardRoute />
      </MemoryRouter>
    </PreviewThemeProvider>,
  )
}

describe('DashboardRoute', () => {
  beforeEach(() => {
    mockedUseDashboard.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
      refetch: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseChoreMutations.mockReturnValue({ complete: { mutate: vi.fn() } } as any)
  })

  it('renders the stacked shell by default, including while config is still loading', () => {
    mockedUseDashboardConfig.mockReturnValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    renderRoute()

    // The stacked shell's heading row includes this subtitle; the sidebar shell
    // omits it from this same top-level spot (it sits lower, next to the clock).
    expect(screen.getByText(/mission control for the replogle household/i)).toBeInTheDocument()
  })

  it('renders the sidebar shell once config says so', () => {
    mockedUseDashboardConfig.mockReturnValue({
      data: { theme: 'modern', widgets: [], calendarView: 'week', dashboardLayout: 'sidebar' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    renderRoute()

    expect(screen.getByRole('status', { name: /loading dashboard/i })).toBeInTheDocument()
    // The stacked shell's header (with this subtitle) always renders, loading or
    // not — its absence here confirms the sidebar shell was the one picked, not
    // just that some loading state rendered.
    expect(screen.queryByText(/mission control for the replogle household/i)).not.toBeInTheDocument()
  })
})

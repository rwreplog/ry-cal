import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useShoppingListMutations } from '@/features/shopping-list/hooks/useShoppingListMutations'
import type { DashboardDto } from '@/types/dashboard'
import { ShoppingListWidget } from './ShoppingListWidget'

vi.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

vi.mock('@/features/shopping-list/hooks/useShoppingListMutations', () => ({
  useShoppingListMutations: vi.fn(),
}))

const mockedUseDashboard = vi.mocked(useDashboard)
const mockedUseShoppingListMutations = vi.mocked(useShoppingListMutations)

function dashboardWith(items: DashboardDto['shoppingList']['items'], totalUncheckedCount: number): DashboardDto {
  return {
    generatedAtUtc: new Date().toISOString(),
    layout: [],
    calendar: { events: [] },
    chores: { items: [] },
    weather: { current: null },
    announcements: { items: [] },
    meals: { items: [] },
    shoppingList: { items, totalUncheckedCount },
    birthdays: { items: [] },
    countdowns: { items: [] },
  }
}

describe('ShoppingListWidget', () => {
  const toggle = vi.fn()

  beforeEach(() => {
    toggle.mockReset()
    mockedUseDashboard.mockReset()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseShoppingListMutations.mockReturnValue({ toggle: { mutate: toggle } } as any)
  })

  it('shows the empty state when the list is empty', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([], 0),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ShoppingListWidget />)

    expect(screen.getByText(/shopping list is empty/i)).toBeInTheDocument()
  })

  it('toggles an item when tapped', async () => {
    const user = userEvent.setup()
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([{ id: 'item-1', name: 'Milk' }], 1),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ShoppingListWidget />)

    await user.click(screen.getByRole('button', { name: /mark milk checked/i }))

    expect(toggle).toHaveBeenCalledWith('item-1')
  })

  it('shows a "+N more" indicator when items are capped', () => {
    mockedUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: dashboardWith([{ id: 'item-1', name: 'Milk' }], 5),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ShoppingListWidget />)

    expect(screen.getByText('+4 more')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useHouseholdLocation } from '@/features/dashboard/hooks/useHouseholdLocation'
import { useHouseholdLocationMutations } from '@/features/dashboard/hooks/useHouseholdLocationMutations'
import { searchLocations } from '@/services/api/dashboardApi'
import { LocationSettings } from './LocationSettings'

vi.mock('@/features/dashboard/hooks/useHouseholdLocation', () => ({
  useHouseholdLocation: vi.fn(),
}))

vi.mock('@/features/dashboard/hooks/useHouseholdLocationMutations', () => ({
  useHouseholdLocationMutations: vi.fn(),
}))

vi.mock('@/services/api/dashboardApi', () => ({
  searchLocations: vi.fn(),
}))

const mockedUseHouseholdLocation = vi.mocked(useHouseholdLocation)
const mockedUseHouseholdLocationMutations = vi.mocked(useHouseholdLocationMutations)
const mockedSearchLocations = vi.mocked(searchLocations)

describe('LocationSettings', () => {
  beforeEach(() => {
    mockedUseHouseholdLocation.mockReturnValue({
      data: { latitude: null, longitude: null, locationLabel: null },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    mockedUseHouseholdLocationMutations.mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: { mutate: vi.fn(), isPending: false } as any,
    })
    mockedSearchLocations.mockReset()
  })

  it('shows a spinner on the search button while a search is in flight', async () => {
    const user = userEvent.setup()
    let resolveSearch!: (value: Awaited<ReturnType<typeof searchLocations>>) => void
    mockedSearchLocations.mockReturnValue(new Promise((resolve) => (resolveSearch = resolve)))

    const { container } = render(<LocationSettings />)
    await user.type(screen.getByLabelText('Search for a city'), 'Chicago')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()

    resolveSearch([])
  })

  it('shows a "no cities found" message after a search with zero results', async () => {
    const user = userEvent.setup()
    mockedSearchLocations.mockResolvedValue([])

    render(<LocationSettings />)
    await user.type(screen.getByLabelText('Search for a city'), 'Nowheresville')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByText(/no cities found for "nowheresville"/i)).toBeInTheDocument()
  })

  it('does not show the "no results" message before a search has been run', () => {
    render(<LocationSettings />)

    expect(screen.queryByText(/no cities found/i)).not.toBeInTheDocument()
  })

  it('shows matching results after a successful search', async () => {
    const user = userEvent.setup()
    mockedSearchLocations.mockResolvedValue([
      { name: 'Chicago', latitude: 41.8781, longitude: -87.6298, admin1: 'Illinois', country: 'United States' },
    ])

    render(<LocationSettings />)
    await user.type(screen.getByLabelText('Search for a city'), 'Chicago')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByText('Chicago, Illinois, United States')).toBeInTheDocument()
  })
})

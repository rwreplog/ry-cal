import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@/features/dashboard/widgets' // registers the real widget definitions (name/icon lookups)
import { useDashboardConfig } from '@/features/dashboard/hooks/useDashboardConfig'
import { useDashboardConfigMutations } from '@/features/dashboard/hooks/useDashboardConfigMutations'
import { useHouseholdLocation } from '@/features/dashboard/hooks/useHouseholdLocation'
import { useHouseholdLocationMutations } from '@/features/dashboard/hooks/useHouseholdLocationMutations'
import type { DashboardConfigDto } from '@/types/dashboard'
import { DashboardSettingsPage, reorderWidgets } from './DashboardSettingsPage'

vi.mock('@/features/dashboard/hooks/useDashboardConfig', () => ({
  useDashboardConfig: vi.fn(),
}))

vi.mock('@/features/dashboard/hooks/useDashboardConfigMutations', () => ({
  useDashboardConfigMutations: vi.fn(),
}))

// DashboardSettingsPage also renders LocationSettings (the Weather location
// search) — mocked here the same way as the other page-level hooks above, since
// this test suite doesn't wrap renders in a QueryClientProvider.
vi.mock('@/features/dashboard/hooks/useHouseholdLocation', () => ({
  useHouseholdLocation: vi.fn(),
}))

vi.mock('@/features/dashboard/hooks/useHouseholdLocationMutations', () => ({
  useHouseholdLocationMutations: vi.fn(),
}))

const mockedUseDashboardConfig = vi.mocked(useDashboardConfig)
const mockedUseDashboardConfigMutations = vi.mocked(useDashboardConfigMutations)
const mockedUseHouseholdLocation = vi.mocked(useHouseholdLocation)
const mockedUseHouseholdLocationMutations = vi.mocked(useHouseholdLocationMutations)

const baseConfig: DashboardConfigDto = {
  theme: 'modern',
  widgets: [
    { type: 'clock', size: 'sm', isVisible: true },
    { type: 'calendar', size: 'md', isVisible: true },
    { type: 'chores', size: 'md', isVisible: true },
  ],
}

describe('reorderWidgets', () => {
  it('moves the active widget to the position of the target widget', () => {
    const result = reorderWidgets(baseConfig.widgets, 'clock', 'chores')
    expect(result.map((w) => w.type)).toEqual(['calendar', 'chores', 'clock'])
  })

  it('is a no-op when the active and target widget are the same', () => {
    const result = reorderWidgets(baseConfig.widgets, 'clock', 'clock')
    expect(result).toBe(baseConfig.widgets)
  })

  it('is a no-op when either widget type is unknown', () => {
    const result = reorderWidgets(baseConfig.widgets, 'clock', 'does-not-exist')
    expect(result).toBe(baseConfig.widgets)
  })
})

describe('DashboardSettingsPage', () => {
  const mutate = vi.fn()

  beforeEach(() => {
    // jsdom doesn't implement the Pointer Events / scrollIntoView APIs Radix
    // Select's interactions rely on — polyfill just enough for open/select to work.
    Element.prototype.hasPointerCapture ??= () => false
    Element.prototype.setPointerCapture ??= () => {}
    Element.prototype.releasePointerCapture ??= () => {}
    Element.prototype.scrollIntoView ??= () => {}

    mutate.mockReset()
    mockedUseDashboardConfig.mockReset()
    mockedUseDashboardConfigMutations.mockReset()
    mockedUseDashboardConfig.mockReturnValue({
      data: baseConfig,
      isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    mockedUseDashboardConfigMutations.mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: { mutate, isPending: false } as any,
    })
    mockedUseHouseholdLocation.mockReturnValue({
      data: { latitude: null, longitude: null, locationLabel: null },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    mockedUseHouseholdLocationMutations.mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: { mutate: vi.fn(), isPending: false } as any,
    })

    // jsdom has no ResizeObserver at all — dnd-kit's DndContext needs one to mount.
    // A no-op stub is enough here since these tests don't exercise the actual drag
    // geometry (dnd-kit's collision detection needs real layout to resolve, which
    // jsdom can't provide) — that logic is covered directly by the reorderWidgets
    // unit tests above instead.
    class ResizeObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  })

  it('renders a row per widget using registry metadata for the label', () => {
    render(<DashboardSettingsPage />)

    expect(screen.getByText('Clock')).toBeInTheDocument()
    expect(screen.getByText('Calendar')).toBeInTheDocument()
    expect(screen.getByText('Chores')).toBeInTheDocument()
  })

  it('gives each widget a keyboard-focusable, labeled drag handle', () => {
    render(<DashboardSettingsPage />)

    const handle = screen.getByRole('button', { name: /reorder clock/i })
    expect(handle).toHaveAttribute('tabindex', '0')
  })

  it('toggles visibility locally without saving until "Save changes" is clicked', async () => {
    const user = userEvent.setup()
    render(<DashboardSettingsPage />)

    const clockSwitch = screen.getByRole('switch', { name: /show clock/i })
    expect(clockSwitch).toHaveAttribute('aria-checked', 'true')

    await user.click(clockSwitch)
    expect(clockSwitch).toHaveAttribute('aria-checked', 'false')
    expect(mutate).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(mutate).toHaveBeenCalledTimes(1)
    const payload = mutate.mock.calls[0][0]
    expect(payload.theme).toBe('modern')
    expect(payload.widgets.find((w: { type: string }) => w.type === 'clock').isVisible).toBe(false)
  })

  it('seeds the theme picker from the current server-persisted theme', () => {
    render(<DashboardSettingsPage />)

    expect(screen.getByRole('combobox', { name: /theme/i })).toHaveTextContent('Modern')
  })
})

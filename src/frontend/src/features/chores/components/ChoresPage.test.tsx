import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useChoreMutations } from '@/features/chores/hooks/useChoreMutations'
import { useChores } from '@/features/chores/hooks/useChores'
import { useCompletionHistory } from '@/features/chores/hooks/useCompletionHistory'
import { useFamilyMembers } from '@/features/family/hooks/useFamilyMembers'
import type { ChoreDto } from '@/types/chores'
import { ChoresPage } from './ChoresPage'

vi.mock('@/features/chores/hooks/useChores', () => ({ useChores: vi.fn() }))
vi.mock('@/features/chores/hooks/useChoreMutations', () => ({ useChoreMutations: vi.fn() }))
vi.mock('@/features/chores/hooks/useCompletionHistory', () => ({ useCompletionHistory: vi.fn() }))
vi.mock('@/features/family/hooks/useFamilyMembers', () => ({ useFamilyMembers: vi.fn() }))

const mockedUseChores = vi.mocked(useChores)
const mockedUseChoreMutations = vi.mocked(useChoreMutations)
const mockedUseCompletionHistory = vi.mocked(useCompletionHistory)
const mockedUseFamilyMembers = vi.mocked(useFamilyMembers)

function chore(overrides: Partial<ChoreDto> = {}): ChoreDto {
  return {
    id: 'chore-1',
    title: 'Take out trash',
    description: null,
    assignedToFamilyMemberId: null,
    assignedToName: null,
    recurrence: 'none',
    dueAtUtc: new Date().toISOString(),
    isComplete: false,
    lastCompletedAtUtc: null,
    schedule: [],
    ...overrides,
  }
}

describe('ChoresPage', () => {
  beforeEach(() => {
    mockedUseChores.mockReset()
    mockedUseChoreMutations.mockReset()
    mockedUseCompletionHistory.mockReset()
    mockedUseFamilyMembers.mockReset()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseChoreMutations.mockReturnValue({
      create: { mutate: vi.fn(), isPending: false },
      update: { mutate: vi.fn(), isPending: false },
      remove: { mutate: vi.fn(), isPending: false },
      complete: { mutate: vi.fn(), isPending: false },
      assign: { mutate: vi.fn(), isPending: false },
    } as any)
    mockedUseCompletionHistory.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    mockedUseFamilyMembers.mockReturnValue({
      data: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  })

  it('hides completed chores by default', () => {
    mockedUseChores.mockReturnValue({
      data: [chore({ id: 'open', title: 'Open chore', isComplete: false }), chore({ id: 'done', title: 'Done chore', isComplete: true })],
      isLoading: false,
      isError: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ChoresPage />)

    expect(screen.getByText('Open chore')).toBeInTheDocument()
    expect(screen.queryByText('Done chore')).not.toBeInTheDocument()
    expect(screen.getByText('Hide completed (1)')).toBeInTheDocument()
  })

  it('shows completed chores once the toggle is switched off', async () => {
    const user = userEvent.setup()
    mockedUseChores.mockReturnValue({
      data: [chore({ id: 'open', title: 'Open chore', isComplete: false }), chore({ id: 'done', title: 'Done chore', isComplete: true })],
      isLoading: false,
      isError: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ChoresPage />)
    await user.click(screen.getByRole('switch'))

    expect(screen.getByText('Done chore')).toBeInTheDocument()
  })

  it('shows "all chores are complete" when every chore is done and completed ones are hidden', () => {
    mockedUseChores.mockReturnValue({
      data: [chore({ id: 'done', title: 'Done chore', isComplete: true })],
      isLoading: false,
      isError: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ChoresPage />)

    expect(screen.getByText('All chores are complete.')).toBeInTheDocument()
  })

  it('does not show the hide-completed toggle when there are no chores at all', () => {
    mockedUseChores.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<ChoresPage />)

    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    expect(screen.getByText('No chores yet. Add one to get started.')).toBeInTheDocument()
  })
})

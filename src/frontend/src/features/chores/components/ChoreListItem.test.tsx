import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useChoreMutations } from '@/features/chores/hooks/useChoreMutations'
import { useFamilyMembers } from '@/features/family/hooks/useFamilyMembers'
import type { ChoreDto } from '@/types/chores'
import { ChoreListItem } from './ChoreListItem'

vi.mock('@/features/chores/hooks/useChoreMutations', () => ({
  useChoreMutations: vi.fn(),
}))

vi.mock('@/features/family/hooks/useFamilyMembers', () => ({
  useFamilyMembers: vi.fn(),
}))

const mockedUseChoreMutations = vi.mocked(useChoreMutations)
const mockedUseFamilyMembers = vi.mocked(useFamilyMembers)

function dailyChore(): ChoreDto {
  return {
    id: 'chore-1',
    title: 'Water plants',
    description: null,
    assignedToFamilyMemberId: 'ryan',
    assignedToName: 'Ryan',
    recurrence: 'daily',
    dueAtUtc: new Date().toISOString(),
    isComplete: false,
    lastCompletedAtUtc: null,
    schedule: [],
  }
}

function weekdaysChore(): ChoreDto {
  return {
    id: 'chore-2',
    title: 'Take out trash',
    description: null,
    assignedToFamilyMemberId: null,
    assignedToName: null,
    recurrence: 'weekdays',
    dueAtUtc: new Date().toISOString(),
    isComplete: false,
    lastCompletedAtUtc: null,
    schedule: [
      { dayOfWeek: 'monday', familyMemberId: 'ryan', familyMemberName: 'Ryan', familyMemberColor: '#0ea5e9' },
      { dayOfWeek: 'wednesday', familyMemberId: 'victoria', familyMemberName: 'Victoria', familyMemberColor: '#a855f7' },
    ],
  }
}

describe('ChoreListItem', () => {
  beforeEach(() => {
    class ResizeObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseChoreMutations.mockReturnValue({
      update: { mutate: vi.fn(), isPending: false },
      remove: { mutate: vi.fn(), isPending: false },
      complete: { mutate: vi.fn(), isPending: false },
      assign: { mutate: vi.fn(), isPending: false },
    } as any)
    mockedUseFamilyMembers.mockReturnValue({
      data: [
        { id: 'ryan', name: 'Ryan', color: '#0ea5e9' },
        { id: 'victoria', name: 'Victoria', color: '#a855f7' },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  })

  it('shows a complete button and a reassign picker for an ordinary recurring chore', () => {
    render(<ChoreListItem chore={dailyChore()} />)

    expect(screen.getByRole('button', { name: /mark water plants complete/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /reassign water plants/i })).toBeInTheDocument()
  })

  it('shows a schedule summary instead of a complete button or reassign picker for a specific-days chore', () => {
    render(<ChoreListItem chore={weekdaysChore()} />)

    expect(screen.queryByRole('button', { name: /mark take out trash complete/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: /reassign take out trash/i })).not.toBeInTheDocument()
    expect(screen.getByText('Mon → Ryan, Wed → Victoria')).toBeInTheDocument()
  })
})

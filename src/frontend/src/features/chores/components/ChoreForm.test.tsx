import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFamilyMembers } from '@/features/family/hooks/useFamilyMembers'
import type { ChoreDto } from '@/types/chores'
import { ChoreForm } from './ChoreForm'

vi.mock('@/features/family/hooks/useFamilyMembers', () => ({
  useFamilyMembers: vi.fn(),
}))

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

describe('ChoreForm', () => {
  beforeEach(() => {
    // jsdom has no ResizeObserver at all — Radix Select needs one to mount.
    class ResizeObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)

    mockedUseFamilyMembers.mockReturnValue({
      data: [
        { id: 'ryan', name: 'Ryan', color: '#0ea5e9' },
        { id: 'victoria', name: 'Victoria', color: '#a855f7' },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  })

  it('omits the day-by-day schedule editor for an ordinary recurring chore', () => {
    render(<ChoreForm initial={dailyChore()} submitLabel="Save" isPending={false} onSubmit={vi.fn()} />)

    expect(screen.queryByText('Schedule')).not.toBeInTheDocument()
    expect(screen.getByText('Due')).toBeInTheDocument()
  })

  it('shows the schedule editor, not a single assignee picker, when editing a specific-days chore', () => {
    render(<ChoreForm initial={weekdaysChore()} submitLabel="Save" isPending={false} onSubmit={vi.fn()} />)

    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.getByText('Due time')).toBeInTheDocument()
    expect(screen.queryByText('Assigned to')).not.toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Include Monday' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Include Wednesday' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Include Tuesday' })).not.toBeChecked()
  })

  it('submits the existing schedule unchanged when saving an edited specific-days chore', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ChoreForm initial={weekdaysChore()} submitLabel="Save" isPending={false} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        recurrence: 'weekdays',
        schedule: [
          { dayOfWeek: 'monday', familyMemberId: 'ryan' },
          { dayOfWeek: 'wednesday', familyMemberId: 'victoria' },
        ],
      }),
    )
  })

  it('disables submit once every scheduled day is toggled off', async () => {
    const user = userEvent.setup()
    render(<ChoreForm initial={weekdaysChore()} submitLabel="Save" isPending={false} onSubmit={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()

    await user.click(screen.getByRole('switch', { name: 'Include Monday' }))
    await user.click(screen.getByRole('switch', { name: 'Include Wednesday' }))

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })
})

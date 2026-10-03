import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFamilyMembers } from '@/features/family/hooks/useFamilyMembers'
import type { ChoreScheduleEntryRequest } from '@/types/chores'
import { ChoreScheduleEditor } from './ChoreScheduleEditor'

vi.mock('@/features/family/hooks/useFamilyMembers', () => ({
  useFamilyMembers: vi.fn(),
}))

const mockedUseFamilyMembers = vi.mocked(useFamilyMembers)

describe('ChoreScheduleEditor', () => {
  beforeEach(() => {
    mockedUseFamilyMembers.mockReturnValue({
      data: [
        { id: 'ryan', name: 'Ryan', color: '#0ea5e9' },
        { id: 'victoria', name: 'Victoria', color: '#a855f7' },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  })

  it('renders all seven days', () => {
    render(<ChoreScheduleEditor value={[]} onChange={vi.fn()} />)

    for (const day of ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']) {
      expect(screen.getByText(day)).toBeInTheDocument()
    }
  })

  it('adds an unassigned entry when a day is switched on', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ChoreScheduleEditor value={[]} onChange={onChange} />)

    await user.click(screen.getByRole('switch', { name: 'Include Monday' }))

    expect(onChange).toHaveBeenCalledWith([{ dayOfWeek: 'monday', familyMemberId: null }])
  })

  it('removes the entry when an included day is switched off', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const value: ChoreScheduleEntryRequest[] = [
      { dayOfWeek: 'monday', familyMemberId: 'ryan' },
      { dayOfWeek: 'wednesday', familyMemberId: null },
    ]
    render(<ChoreScheduleEditor value={value} onChange={onChange} />)

    await user.click(screen.getByRole('switch', { name: 'Include Monday' }))

    expect(onChange).toHaveBeenCalledWith([{ dayOfWeek: 'wednesday', familyMemberId: null }])
  })

  it('disables the assignee picker for a day that is not included', () => {
    render(<ChoreScheduleEditor value={[{ dayOfWeek: 'monday', familyMemberId: 'ryan' }]} onChange={vi.fn()} />)

    expect(screen.getByRole('combobox', { name: 'Tuesday assignee' })).toBeDisabled()
  })

  it('enables the assignee picker once a day is included', () => {
    render(<ChoreScheduleEditor value={[{ dayOfWeek: 'monday', familyMemberId: 'ryan' }]} onChange={vi.fn()} />)

    expect(screen.getByRole('combobox', { name: 'Monday assignee' })).toBeEnabled()
  })
})

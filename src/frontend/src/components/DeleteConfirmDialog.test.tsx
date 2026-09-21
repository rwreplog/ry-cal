import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

describe('DeleteConfirmDialog', () => {
  it('does not call onConfirm just from rendering the trigger', () => {
    const onConfirm = vi.fn()
    render(<DeleteConfirmDialog trigger={<button>Delete</button>} title="Delete this?" onConfirm={onConfirm} />)

    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.queryByText('Delete this?')).not.toBeInTheDocument()
  })

  it('opens the confirmation dialog when the trigger is activated', async () => {
    const user = userEvent.setup()
    render(<DeleteConfirmDialog trigger={<button>Delete</button>} title="Delete this?" onConfirm={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.getByText('Delete this?')).toBeInTheDocument()
  })

  it('does not call onConfirm when cancel is chosen', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<DeleteConfirmDialog trigger={<button>Delete</button>} title="Delete this?" onConfirm={onConfirm} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm when the destructive action is chosen', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<DeleteConfirmDialog trigger={<button>Delete</button>} title="Delete this?" onConfirm={onConfirm} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('uses a custom confirm label when provided', async () => {
    const user = userEvent.setup()
    render(
      <DeleteConfirmDialog trigger={<button>Open</button>} title="Remove?" confirmLabel="Remove" onConfirm={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Open' }))

    // Radix marks background content (including the trigger) aria-hidden while the
    // dialog is open, so only the action button is queryable here — not a second
    // "trigger" match.
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })
})

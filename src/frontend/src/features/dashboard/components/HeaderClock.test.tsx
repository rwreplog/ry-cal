import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HeaderClock } from './HeaderClock'

describe('HeaderClock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the current time and a short date', () => {
    const { container } = render(<HeaderClock />)

    // The colon renders in its own span (it blinks via CSS), so the time is split
    // across sibling text nodes — toHaveTextContent concatenates them for us.
    expect(container).toHaveTextContent('12:00 PM')
    // Short form ("Thu, Jan 1"), not the long form ("Thursday, January 1") — the
    // long form was wide enough to wrap onto its own second line in the header's
    // narrow middle column.
    expect(screen.getByText(/thu, jan 1/i)).toBeInTheDocument()
  })

  it('renders larger and in the theme accent color when size="large"', () => {
    const { container } = render(<HeaderClock size="large" />)

    expect(container).toHaveTextContent('12:00 PM')
    const time = container.querySelector('p')
    expect(time).toHaveClass('text-6xl', 'text-primary')
  })
})

import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LastUpdatedIndicator } from './LastUpdatedIndicator'

describe('LastUpdatedIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Noon UTC on a January day (standard time, not DST) is 7:00 AM in
    // America/New_York — a fixed, predictable Eastern time to assert on.
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing before the first successful fetch', () => {
    const { container } = render(<LastUpdatedIndicator updatedAt={0} isFetching={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the last-updated time in Eastern time', () => {
    render(<LastUpdatedIndicator updatedAt={Date.now()} isFetching={false} />)
    expect(screen.getByText(/updated 7:00 AM EST/i)).toBeInTheDocument()
  })

  it('shows "Updating…" with a spinning icon while a fetch is in flight', () => {
    const { container } = render(<LastUpdatedIndicator updatedAt={Date.now()} isFetching={true} />)
    expect(screen.getByText(/updating…/i)).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('does not show the spinning icon once the fetch settles', () => {
    const { container } = render(<LastUpdatedIndicator updatedAt={Date.now()} isFetching={false} />)
    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
  })

  it('turns stale-styled once the data is older than the missed-refresh threshold', () => {
    const updatedAt = Date.now() - 7 * 60 * 1000 // 7 minutes ago — past the 6-minute threshold
    render(<LastUpdatedIndicator updatedAt={updatedAt} isFetching={false} />)

    const text = screen.getByText(/updated 6:53 AM EST/i)
    expect(text.className).toContain('text-amber-600')
  })

  it('is not stale-styled just under the threshold', () => {
    const updatedAt = Date.now() - 5 * 60 * 1000 // 5 minutes ago — under the 6-minute threshold
    render(<LastUpdatedIndicator updatedAt={updatedAt} isFetching={false} />)

    const text = screen.getByText(/updated 6:55 AM EST/i)
    expect(text.className).not.toContain('text-amber-600')
  })
})

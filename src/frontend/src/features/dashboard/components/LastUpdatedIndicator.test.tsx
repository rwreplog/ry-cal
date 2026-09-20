import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LastUpdatedIndicator } from './LastUpdatedIndicator'

describe('LastUpdatedIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing before the first successful fetch', () => {
    const { container } = render(<LastUpdatedIndicator updatedAt={0} isFetching={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows "just now" immediately after a fresh update', () => {
    render(<LastUpdatedIndicator updatedAt={Date.now()} isFetching={false} />)
    expect(screen.getByText(/updated just now/i)).toBeInTheDocument()
  })

  it('shows "Updating…" while a fetch is in flight', () => {
    render(<LastUpdatedIndicator updatedAt={Date.now()} isFetching={true} />)
    expect(screen.getByText(/updating…/i)).toBeInTheDocument()
  })

  it('turns stale-styled once the data is older than the missed-refresh threshold', () => {
    const updatedAt = Date.now() - 7 * 60 * 1000 // 7 minutes ago — past the 6-minute threshold
    render(<LastUpdatedIndicator updatedAt={updatedAt} isFetching={false} />)

    const text = screen.getByText(/updated 7 minutes ago/i)
    expect(text.className).toContain('text-amber-600')
  })

  it('is not stale-styled just under the threshold', () => {
    const updatedAt = Date.now() - 5 * 60 * 1000 // 5 minutes ago — under the 6-minute threshold
    render(<LastUpdatedIndicator updatedAt={updatedAt} isFetching={false} />)

    const text = screen.getByText(/updated 5 minutes ago/i)
    expect(text.className).not.toContain('text-amber-600')
  })
})

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFullscreen } from './useFullscreen'

describe('useFullscreen', () => {
  let requestFullscreen: ReturnType<typeof vi.fn>
  let exitFullscreen: ReturnType<typeof vi.fn>

  beforeEach(() => {
    requestFullscreen = vi.fn().mockResolvedValue(undefined)
    exitFullscreen = vi.fn().mockResolvedValue(undefined)
    document.documentElement.requestFullscreen = requestFullscreen as unknown as typeof document.documentElement.requestFullscreen
    document.exitFullscreen = exitFullscreen as unknown as typeof document.exitFullscreen
    Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true, configurable: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts out of fullscreen when the document has no fullscreenElement', () => {
    const { result } = renderHook(() => useFullscreen())
    expect(result.current.isFullscreen).toBe(false)
  })

  it('requests fullscreen on the document element when entering', async () => {
    const { result } = renderHook(() => useFullscreen())

    await act(async () => {
      await result.current.enter()
    })

    expect(requestFullscreen).toHaveBeenCalledTimes(1)
  })

  it('swallows a rejected requestFullscreen (e.g. missing user gesture) without throwing', async () => {
    requestFullscreen.mockRejectedValueOnce(new Error('not allowed'))
    const { result } = renderHook(() => useFullscreen())

    await expect(
      act(async () => {
        await result.current.enter()
      }),
    ).resolves.not.toThrow()
  })

  it('syncs state from a native fullscreenchange event (e.g. the user pressing Escape)', () => {
    const { result } = renderHook(() => useFullscreen())
    expect(result.current.isFullscreen).toBe(false)

    act(() => {
      Object.defineProperty(document, 'fullscreenElement', { value: document.body, configurable: true })
      document.dispatchEvent(new Event('fullscreenchange'))
    })

    expect(result.current.isFullscreen).toBe(true)
  })

  it('exits fullscreen only when the document is currently in fullscreen', async () => {
    const { result } = renderHook(() => useFullscreen())

    await act(async () => {
      await result.current.exit()
    })
    expect(exitFullscreen).not.toHaveBeenCalled()

    Object.defineProperty(document, 'fullscreenElement', { value: document.body, configurable: true })
    await act(async () => {
      await result.current.exit()
    })
    expect(exitFullscreen).toHaveBeenCalledTimes(1)
  })
})

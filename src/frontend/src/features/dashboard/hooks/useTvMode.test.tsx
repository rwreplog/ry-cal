import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { useTvMode } from './useTvMode'

function wrapper(initialEntry: string) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  }
}

describe('useTvMode', () => {
  afterEach(() => {
    delete document.documentElement.dataset.displayMode
  })

  it('is off by default with no query param and no manual toggle', () => {
    const { result } = renderHook(() => useTvMode(), { wrapper: wrapper('/') })

    expect(result.current.isTvMode).toBe(false)
    expect(document.documentElement.dataset.displayMode).toBeUndefined()
  })

  it('turns on automatically from a ?tv=1 query param', () => {
    const { result } = renderHook(() => useTvMode(), { wrapper: wrapper('/?tv=1') })

    expect(result.current.isTvMode).toBe(true)
    expect(result.current.queryTv).toBe(true)
    expect(document.documentElement.dataset.displayMode).toBe('tv')
  })

  it('turns on from a manual toggle and applies the attribute to <html>', () => {
    const { result } = renderHook(() => useTvMode(), { wrapper: wrapper('/') })

    act(() => result.current.setManualTv(true))

    expect(result.current.isTvMode).toBe(true)
    expect(document.documentElement.dataset.displayMode).toBe('tv')
  })

  it('removes the attribute when TV mode is turned back off', () => {
    const { result } = renderHook(() => useTvMode(), { wrapper: wrapper('/') })

    act(() => result.current.setManualTv(true))
    expect(document.documentElement.dataset.displayMode).toBe('tv')

    act(() => result.current.setManualTv(false))
    expect(document.documentElement.dataset.displayMode).toBeUndefined()
  })
})

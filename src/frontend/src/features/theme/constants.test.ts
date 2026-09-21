import { describe, expect, it } from 'vitest'
import { getEffectiveTheme } from './constants'

describe('getEffectiveTheme', () => {
  it('passes non-auto theme ids through unchanged', () => {
    expect(getEffectiveTheme('family', new Date(2026, 9, 31))).toBe('family')
    expect(getEffectiveTheme('dark', new Date(2026, 9, 31))).toBe('dark')
  })

  it('resolves "auto" to the seasonal theme matching the given date', () => {
    expect(getEffectiveTheme('auto', new Date(2026, 9, 31))).toBe('seasonal-halloween')
    expect(getEffectiveTheme('auto', new Date(2026, 11, 25))).toBe('seasonal-christmas')
  })
})

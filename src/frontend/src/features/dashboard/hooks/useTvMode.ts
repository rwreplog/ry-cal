import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

// Effective TV mode = the `?tv=1` query param (for a wall-mounted browser pointed
// at one fixed URL) OR a manual toggle. Applied to <html>, not a wrapper element —
// the `[data-display-mode='tv']` CSS scaffold rescales rem-based utilities, which
// are relative to the root font-size specifically.
export function useTvMode() {
  const [searchParams] = useSearchParams()
  const queryTv = searchParams.get('tv') === '1'
  const [manualTv, setManualTv] = useState(false)

  const isTvMode = queryTv || manualTv

  useEffect(() => {
    if (isTvMode) {
      document.documentElement.dataset.displayMode = 'tv'
    } else {
      delete document.documentElement.dataset.displayMode
    }
  }, [isTvMode])

  return { isTvMode, queryTv, manualTv, setManualTv }
}

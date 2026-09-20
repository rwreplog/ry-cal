import { useCallback, useEffect, useState } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(() => document.fullscreenElement !== null)

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const enter = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen()
    } catch {
      // Browsers reject requestFullscreen() without a user gesture, or if the
      // document is already in fullscreen — either way, nothing more to do here.
    }
  }, [])

  const exit = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  }, [])

  return { isFullscreen, enter, exit }
}

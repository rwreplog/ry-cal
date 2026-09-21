import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { describe, expect, it } from 'vitest'
import { PreviewThemeBanner } from './PreviewThemeBanner'
import { PreviewThemeProvider, usePreviewTheme } from './PreviewThemeContext'

// Drives the preview context from outside, the way DashboardSettingsPage does.
function SetPreviewOnMount({ id }: { id: string }) {
  const { setPreviewThemeId } = usePreviewTheme()
  useEffect(() => {
    setPreviewThemeId(id)
  }, [id, setPreviewThemeId])
  return null
}

function renderBanner() {
  return render(
    <PreviewThemeProvider>
      <PreviewThemeBanner />
    </PreviewThemeProvider>,
  )
}

function renderBannerWithPreview(id: string) {
  return render(
    <PreviewThemeProvider>
      <SetPreviewOnMount id={id} />
      <PreviewThemeBanner />
    </PreviewThemeProvider>,
  )
}

describe('PreviewThemeBanner', () => {
  it('renders nothing when no preview is active', () => {
    const { container } = renderBanner()

    expect(container).toBeEmptyDOMElement()
  })

  it('names the previewed palette once a preview is active', () => {
    renderBannerWithPreview('seasonal-halloween')

    expect(screen.getByRole('status')).toHaveTextContent(/previewing halloween/i)
  })

  it('clears the preview when "Stop previewing" is clicked', async () => {
    const user = userEvent.setup()
    renderBannerWithPreview('seasonal-christmas')
    expect(screen.getByRole('status')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /stop previewing/i }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})

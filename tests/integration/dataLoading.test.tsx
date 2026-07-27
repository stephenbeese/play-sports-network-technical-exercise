import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'
import { mockFailedFetch } from '../fixtures/mockFetch'
import { t } from '../i18n'

describe('data loading states', () => {
  it('surfaces an error message when the data files fail to load', async () => {
    mockFailedFetch()
    render(<App />)

    const errorPrefix = t('app.loadError', { error: '' })
    expect(
      await screen.findByText((content) => content.startsWith(errorPrefix)),
    ).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})

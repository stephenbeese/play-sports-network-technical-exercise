import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'
import { mockFailedFetch } from '../fixtures/mockFetch'

describe('data loading states', () => {
  it('surfaces an error message when the data files fail to load', async () => {
    mockFailedFetch()
    render(<App />)

    expect(await screen.findByText(/Failed to load data/)).toBeInTheDocument()
    // The table should never appear when loading failed.
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})

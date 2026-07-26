import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'
import { mockDataFetch } from '../fixtures/mockFetch'

/**
 * Renders the full App with the fixture served over a mocked fetch, and waits
 * for the initial load to settle (the table replaces the loading state).
 */
export async function renderDashboard() {
  mockDataFetch()
  const user = userEvent.setup()
  render(<App />)
  await screen.findByRole('table')
  return { user }
}

/** The titles of the video rows currently rendered in the table, in order. */
export function visibleRowTitles(): string[] {
  const table = screen.getByRole('table')
  return within(table)
    .getAllByRole('link')
    .map((link) => link.textContent ?? '')
}

/** Number of data rows on the current table page (excludes the header row). */
export function visibleRowCount(): number {
  return visibleRowTitles().length
}

/** Reads the value shown on a KPI card, located via its label. */
export function kpiValue(label: string): string {
  const labelEl = screen.getByText(label)
  const card = labelEl.parentElement as HTMLElement
  // The card renders label, value and hint as sibling paragraphs.
  const value = card.querySelectorAll('p')[1]
  return value?.textContent ?? ''
}

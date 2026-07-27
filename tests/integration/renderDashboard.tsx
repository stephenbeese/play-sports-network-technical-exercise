import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'
import { mockDataFetch } from '../fixtures/mockFetch'

export async function renderDashboard() {
  mockDataFetch()
  const user = userEvent.setup()
  render(<App />)
  await screen.findByRole('table')
  return { user }
}

export function visibleRowTitles(): string[] {
  const table = screen.getByRole('table')
  return within(table)
    .getAllByRole('link')
    .map((link) => link.textContent ?? '')
}

export function visibleRowCount(): number {
  return visibleRowTitles().length
}

export function kpiValue(label: string): string {
  const labelEl = screen.getByText(label)
  const card = labelEl.parentElement as HTMLElement
  const value = card.querySelectorAll('p')[1]
  return value?.textContent ?? ''
}

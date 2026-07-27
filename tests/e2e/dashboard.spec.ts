import { formatCompact } from '../../src/lib/format'
import {
  countByChannel,
  orderedTitlesBy,
  posts,
  totals,
  videoCount,
} from '../fixtures/videoData'
import { expect, test } from './fixture'

const DEFAULT_PAGE_SIZE = 10
const firstPageCount = Math.min(DEFAULT_PAGE_SIZE, videoCount)

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // Wait for the initial load to settle into the table view.
  await expect(page.getByRole('table')).toBeVisible()
})

function rows(page: import('@playwright/test').Page) {
  return page.locator('table tbody tr')
}

test('renders the dashboard with KPIs and a populated table', async ({
  page,
}) => {
  await expect(page.getByText('Total Views')).toBeVisible()
  await expect(page.getByText(formatCompact(totals.views))).toBeVisible()
  await expect(rows(page)).toHaveCount(firstPageCount)
})

test('search suggestions filter the table', async ({ page }) => {
  await page.getByPlaceholder('Search by title or channel…').fill('Beta')

  const suggestion = page
    .getByRole('listbox')
    .getByRole('option', { name: 'Beta Full Match' })
  await expect(suggestion).toBeVisible()
  await suggestion.click()

  // Titles are unique, so picking one narrows the table to that single video.
  await expect(rows(page)).toHaveCount(1)
})

test('channel and format dropdowns narrow the results', async ({ page }) => {
  await page.getByLabel('Channel').selectOption('Alpha FC')
  await expect(rows(page)).toHaveCount(countByChannel('Alpha FC'))

  await page.getByLabel('Format').selectOption('Short')
  const alphaShorts = posts.filter(
    (post) => post.account_name === 'Alpha FC' && post.video_type === 'Short',
  ).length
  await expect(rows(page)).toHaveCount(alphaShorts)
  await expect(page.getByText(`${alphaShorts} matched filters`)).toBeVisible()
})

test('sorting by a column reorders the table', async ({ page }) => {
  await page
    .getByRole('table')
    .getByRole('button', { name: /Engagements/ })
    .click()

  const firstRowLink = rows(page).first().getByRole('link')
  await expect(firstRowLink).toHaveText(orderedTitlesBy('engagements', 'desc')[0])
})

test('pagination navigates pages and respects page size', async ({ page }) => {
  await expect(page.getByText('1–10')).toBeVisible()

  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByText(`11–${videoCount}`)).toBeVisible()
  await expect(rows(page)).toHaveCount(videoCount - DEFAULT_PAGE_SIZE)

  await page.getByLabel('Rows per page').selectOption('25')
  await expect(rows(page)).toHaveCount(videoCount)
})

test('charts tab renders the chart sections', async ({ page }) => {
  await page.getByRole('tab', { name: 'Charts' }).click()

  for (const heading of [
    'Views over time',
    'Top 10 videos by views',
    'Views by channel',
    'Video count by format',
    'Estimated watch time by channel',
  ]) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  }
  // Real browser layout means Recharts actually draws SVGs.
  await expect(page.locator('svg').first()).toBeVisible()
})

test('reset restores the full result set', async ({ page }) => {
  const channel = page.getByLabel('Channel')
  await channel.selectOption('Alpha FC')
  await expect(rows(page)).toHaveCount(countByChannel('Alpha FC'))

  await page.getByRole('button', { name: 'Reset' }).click()

  await expect(channel).toHaveValue('all')
  await expect(rows(page)).toHaveCount(firstPageCount)
})

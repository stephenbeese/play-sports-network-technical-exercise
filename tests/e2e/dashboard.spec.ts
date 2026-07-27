import { formatCompact, formatNumber } from '../../src/lib/format'
import { t } from '../i18n'
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
  await expect(page.getByRole('table')).toBeVisible()
})

function rows(page: import('@playwright/test').Page) {
  return page.locator('table tbody tr')
}

test('renders the dashboard with KPIs and a populated table', async ({
  page,
}) => {
  await expect(page.getByText(t('kpi.totalViews'))).toBeVisible()
  await expect(page.getByText(formatCompact(totals.views))).toBeVisible()
  await expect(rows(page)).toHaveCount(firstPageCount)
})

test('search suggestions filter the table', async ({ page }) => {
  await page.getByPlaceholder(t('filters.searchPlaceholder')).fill('Beta')

  const suggestion = page
    .getByRole('listbox')
    .getByRole('option', { name: 'Beta Full Match' })
  await expect(suggestion).toBeVisible()
  await suggestion.click()

  await expect(rows(page)).toHaveCount(1)
})

test('channel and format dropdowns narrow the results', async ({ page }) => {
  await page.getByLabel(t('filters.channel')).selectOption('Alpha FC')
  await expect(rows(page)).toHaveCount(countByChannel('Alpha FC'))

  await page.getByLabel(t('filters.format')).selectOption('Short')
  const alphaShorts = posts.filter(
    (post) => post.account_name === 'Alpha FC' && post.video_type === 'Short',
  ).length
  await expect(rows(page)).toHaveCount(alphaShorts)
  await expect(
    page.getByText(
      t('kpi.activeVideosHint', { matched: formatNumber(alphaShorts) }),
    ),
  ).toBeVisible()
})

test('sorting by a column reorders the table', async ({ page }) => {
  await page
    .getByRole('table')
    .getByRole('button', { name: new RegExp(t('table.engagements')) })
    .click()

  const firstRowLink = rows(page).first().getByRole('link')
  await expect(firstRowLink).toHaveText(orderedTitlesBy('engagements', 'desc')[0])
})

test('pagination navigates pages and respects page size', async ({ page }) => {
  await expect(page.getByText('1–10')).toBeVisible()

  await page.getByRole('button', { name: t('pagination.next') }).click()
  await expect(page.getByText(`11–${videoCount}`)).toBeVisible()
  await expect(rows(page)).toHaveCount(videoCount - DEFAULT_PAGE_SIZE)

  await page.getByLabel(t('pagination.rowsPerPage')).selectOption('25')
  await expect(rows(page)).toHaveCount(videoCount)
})

test('charts tab renders the chart sections', async ({ page }) => {
  await page.getByRole('tab', { name: t('tabs.charts') }).click()

  for (const heading of [
    t('charts.viewsOverTime'),
    t('charts.top10'),
    t('charts.viewsByChannel'),
    t('charts.videoCountByFormat'),
    t('charts.watchTimeByChannel'),
  ]) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  }
  await expect(page.locator('svg').first()).toBeVisible()
})

test('reset restores the full result set', async ({ page }) => {
  const channel = page.getByLabel(t('filters.channel'))
  await channel.selectOption('Alpha FC')
  await expect(rows(page)).toHaveCount(countByChannel('Alpha FC'))

  await page.getByRole('button', { name: t('filters.reset') }).click()

  await expect(channel).toHaveValue('all')
  await expect(rows(page)).toHaveCount(firstPageCount)
})

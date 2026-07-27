import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { formatCompact, formatNumber } from '../../src/lib/format'
import { t } from '../i18n'
import {
  channels,
  countByChannel,
  orderedTitlesBy,
  posts,
  totals,
  videoCount,
} from '../fixtures/videoData'
import {
  kpiValue,
  renderDashboard,
  visibleRowCount,
  visibleRowTitles,
} from './renderDashboard'

const DEFAULT_PAGE_SIZE = 10

describe('dashboard', () => {
  describe('initial render', () => {
    beforeEach(async () => {
      await renderDashboard()
    })

    it('joins the two data files into one sorted row per video', () => {
      expect(visibleRowCount()).toBe(Math.min(DEFAULT_PAGE_SIZE, videoCount))
      const expectedFirstPage = orderedTitlesBy('views', 'desc').slice(
        0,
        DEFAULT_PAGE_SIZE,
      )
      expect(visibleRowTitles()).toEqual(expectedFirstPage)
    })

    it('shows headline KPI totals derived from every video', () => {
      expect(kpiValue(t('kpi.totalViews'))).toBe(formatCompact(totals.views))
      expect(kpiValue(t('kpi.activeVideos'))).toBe(String(videoCount))
      expect(
        screen.getByText(
          t('kpi.activeVideosHint', { matched: formatNumber(videoCount) }),
        ),
      ).toBeInTheDocument()
    })
  })

  describe('filtering', () => {
    it('narrows the table and KPI count by free-text search', async () => {
      const { user } = await renderDashboard()

      const search = screen.getByPlaceholderText(t('filters.searchPlaceholder'))
      await user.type(search, 'Beta')

      await waitFor(() => {
        expect(visibleRowCount()).toBe(countByChannel('Beta United'))
      })
      for (const title of visibleRowTitles()) {
        expect(title.startsWith('Beta')).toBe(true)
      }
      expect(
        screen.getByText(
          t('kpi.activeVideosHint', {
            matched: formatNumber(countByChannel('Beta United')),
          }),
        ),
      ).toBeInTheDocument()

      await user.clear(search)
      await waitFor(() => {
        expect(visibleRowCount()).toBe(DEFAULT_PAGE_SIZE)
      })
    })

    it('filters by channel and format together', async () => {
      const { user } = await renderDashboard()

      await user.selectOptions(screen.getByLabelText(t('filters.channel')), 'Alpha FC')
      await waitFor(() => {
        expect(visibleRowCount()).toBe(countByChannel('Alpha FC'))
      })

      await user.selectOptions(screen.getByLabelText(t('filters.format')), 'Short')
      const expectedAlphaShorts = posts.filter(
        (post) => post.account_name === 'Alpha FC' && post.video_type === 'Short',
      ).length
      await waitFor(() => {
        expect(visibleRowCount()).toBe(expectedAlphaShorts)
      })
    })

    it('filters by publish-date range', async () => {
      await renderDashboard()

      const from = '2025-05-01'
      fireEvent.change(screen.getByLabelText(t('filters.publishedFrom')), {
        target: { value: from },
      })

      const expected = posts.filter(
        (post) => post.published_at_date >= from,
      ).length
      await waitFor(() => {
        expect(visibleRowCount()).toBe(expected)
      })
    })
  })

  describe('sorting', () => {
    it('reorders by a column and toggles direction on repeat clicks', async () => {
      const { user } = await renderDashboard()

      const engagementsHeader = within(screen.getByRole('table')).getByRole(
        'button',
        { name: new RegExp(t('table.engagements')) },
      )

      await user.click(engagementsHeader)
      await waitFor(() => {
        expect(visibleRowTitles()[0]).toBe(
          orderedTitlesBy('engagements', 'desc')[0],
        )
      })
      expect(orderedTitlesBy('engagements', 'desc')[0]).not.toBe(
        orderedTitlesBy('views', 'desc')[0],
      )

      await user.click(engagementsHeader)
      await waitFor(() => {
        expect(visibleRowTitles()[0]).toBe(
          orderedTitlesBy('engagements', 'asc')[0],
        )
      })
    })
  })

  describe('pagination', () => {
    it('pages through results and resets on page-size change', async () => {
      const { user } = await renderDashboard()

      expect(screen.getByText('1–10')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: t('pagination.next') }))
      await waitFor(() => {
        expect(screen.getByText(`11–${videoCount}`)).toBeInTheDocument()
        expect(visibleRowCount()).toBe(videoCount - DEFAULT_PAGE_SIZE)
      })

      await user.selectOptions(screen.getByLabelText(t('pagination.rowsPerPage')), '25')
      await waitFor(() => {
        expect(screen.getByText(`1–${videoCount}`)).toBeInTheDocument()
        expect(visibleRowCount()).toBe(videoCount)
      })
    })
  })

  describe('reset', () => {
    it('clears every active filter', async () => {
      const { user } = await renderDashboard()

      const channelSelect = screen.getByLabelText(
        t('filters.channel'),
      ) as HTMLSelectElement
      await user.selectOptions(channelSelect, channels[0])
      await waitFor(() => {
        expect(visibleRowCount()).toBe(countByChannel(channels[0]))
      })

      const reset = screen.getByRole('button', { name: t('filters.reset') })
      expect(reset).toBeEnabled()
      await user.click(reset)

      await waitFor(() => {
        expect(channelSelect.value).toBe('all')
        expect(visibleRowCount()).toBe(DEFAULT_PAGE_SIZE)
      })
      expect(reset).toBeDisabled()
    })
  })

  describe('charts tab', () => {
    it('renders the chart sections when there is data', async () => {
      const { user } = await renderDashboard()

      await user.click(screen.getByRole('tab', { name: t('tabs.charts') }))

      for (const heading of [
        t('charts.viewsOverTime'),
        t('charts.engagementsOverTime'),
        t('charts.top10'),
        t('charts.viewsByChannel'),
        t('charts.videoCountByFormat'),
        t('charts.watchTimeByChannel'),
      ]) {
        expect(
          await screen.findByRole('heading', { name: heading }),
        ).toBeInTheDocument()
      }
    })

    it('shows an empty state when filters match nothing', async () => {
      const { user } = await renderDashboard()

      await user.type(
        screen.getByPlaceholderText(t('filters.searchPlaceholder')),
        'no-such-video',
      )
      await user.click(screen.getByRole('tab', { name: t('tabs.charts') }))

      expect(
        await screen.findByText(t('charts.empty')),
      ).toBeInTheDocument()
    })
  })
})

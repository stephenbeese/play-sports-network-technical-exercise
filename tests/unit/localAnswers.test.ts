import { describe, expect, it } from 'vitest'
import { answerLocally } from '../../src/lib/localAnswers'
import type { VideoRow } from '../../src/types'

function row(overrides: Partial<VideoRow>): VideoRow {
  return {
    video_id: 'v1',
    account_name: 'GCN',
    published_at_date: '2025-01-01',
    video_url: 'https://example.com',
    video_type: 'Long-form',
    title: 'A video',
    video_length: 60000,
    thumbnail_url: '',
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    watchtime: 0,
    engagements: 0,
    ...overrides,
  }
}

const rows: VideoRow[] = [
  row({ video_id: 'a', title: 'Big hit', account_name: 'GCN', views: 1000, engagements: 50, watchtime: 600 }),
  row({ video_id: 'b', title: 'Small one', account_name: 'GMBN', views: 100, engagements: 90, watchtime: 60, video_type: 'Shorts' }),
]

describe('answerLocally', () => {
  it('answers top video by views', () => {
    expect(answerLocally('What is the top video by views?', rows)).toContain('Big hit')
  })

  it('respects the metric when asked about engagements', () => {
    expect(answerLocally('Which video has the most engagements?', rows)).toContain('Small one')
  })

  it('answers top channel by watch time', () => {
    expect(answerLocally('Which channel has the most watch time?', rows)).toContain('GCN')
  })

  it('answers the Shorts vs long-form split', () => {
    expect(answerLocally('How many Shorts vs long-form?', rows)).toContain('1 Shorts')
  })

  it('answers totals', () => {
    expect(answerLocally('What are the total views?', rows)).toContain('1,100')
  })

  it('answers monthly totals from the daily stats', () => {
    const daily = [
      { date: '2025-12-01', views: 10, engagements: 1 },
      { date: '2025-12-25', views: 30, engagements: 2 },
      { date: '2026-01-05', views: 99, engagements: 9 },
    ]
    const answer = answerLocally('can you give me total views for december 2025', rows, daily)
    expect(answer).toContain('December 2025')
    expect(answer).toContain('40')
    expect(answer).not.toContain('99')
  })

  it('says when a month has no data', () => {
    expect(answerLocally('views in march 2024?', rows, [])).toContain('no daily data')
  })

  it('returns null for unknown questions', () => {
    expect(answerLocally('What is the weather today?', rows)).toBeNull()
  })

  it('handles an empty row set', () => {
    expect(answerLocally('top video', [])).toContain('No videos')
  })
})

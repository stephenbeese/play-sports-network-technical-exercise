import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useChat } from '../../src/lib/useChat'
import type { DailyPoint } from '../../src/lib/useFilteredVideos'
import type { VideoRow } from '../../src/types'

const rows: VideoRow[] = [
  {
    video_id: 'a',
    account_name: 'GCN',
    published_at_date: '2025-01-01',
    video_url: 'https://example.com',
    video_type: 'Long-form',
    title: 'Big hit',
    video_length: 60_000,
    thumbnail_url: '',
    likes: 30,
    comments: 10,
    shares: 10,
    views: 1000,
    watchtime: 600,
    engagements: 50,
  },
]
const daily: DailyPoint[] = [{ date: '2025-01-02', views: 1000, engagements: 50 }]

function sseBody(tokens: string[]): string {
  return (
    tokens
      .map((t) => `data: ${JSON.stringify({ choices: [{ delta: { content: t } }] })}`)
      .join('\n') + '\ndata: [DONE]\n'
  )
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useChat', () => {
  it('answers locally in demo mode (no key, no proxy)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('offline'))))
    const { result } = renderHook(() => useChat(rows, daily))

    await waitFor(() => expect(result.current.demoMode).toBe(true))
    await act(() => result.current.send('What is the top video by views?'))

    const answer = result.current.messages.at(-1)!
    expect(answer.role).toBe('assistant')
    expect(answer.content).toContain('Big hit')
    expect(vi.mocked(fetch).mock.calls.every(([url]) => url === '/api/chat')).toBe(true)
  })

  it('sends context + history (no system role) to the proxy and streams the reply', async () => {
    const fetchMock = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      if (!init) return Response.json({ ok: true })
      return new Response(sseBody(['Hello', ' world']), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useChat(rows, daily, true))
    await waitFor(() => expect(result.current.proxyAvailable).toBe(true))
    await act(() => result.current.send('top video?'))

    expect(result.current.messages.at(-1)).toEqual({ role: 'assistant', content: 'Hello world' })

    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')!
    expect(postCall[0]).toBe('/api/chat')
    const body = JSON.parse(postCall[1]!.body as string)
    expect(body.messages.every((m: { role: string }) => m.role !== 'system')).toBe(true)
    expect(body.messages.at(-1)).toEqual({ role: 'user', content: 'top video?' })
    expect(body.context).toContain('total_views=1000')
    expect(body.context).toContain('Across your current filters')
  })

  it('surfaces a proxy error as an assistant warning message', async () => {
    const fetchMock = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      if (!init) return Response.json({ ok: true })
      return new Response('rate limited', { status: 429 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useChat(rows, daily))
    await waitFor(() => expect(result.current.proxyAvailable).toBe(true))
    await act(() => result.current.send('top video?'))

    expect(result.current.messages.at(-1)!.content).toMatch(/^⚠️/)
    expect(result.current.sending).toBe(false)
  })
})

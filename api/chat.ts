// Vercel edge function that proxies chat requests to OpenAI so the API key
// stays server-side. GET is a probe the frontend uses to detect this proxy;
// deployments without it (GitHub Pages, local dev) fall back to demo mode
// or a pasted key.
export const config = { runtime: 'edge' }

const MAX_MESSAGES = 40
const RATE_LIMIT = 20 // requests per window per IP
const WINDOW_MS = 60_000

// ponytail: in-memory per-instance rate limit — enough to stop casual abuse
// on a low-traffic demo; use Upstash/KV if this ever needs to be watertight.
const hits = new Map<string, { count: number; start: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'GET') {
    return Response.json({ ok: true })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Proxy is not configured with an API key.' }, { status: 503 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (rateLimited(ip)) {
    return Response.json({ error: 'Too many requests — slow down.' }, { status: 429 })
  }

  let messages: unknown
  try {
    messages = (await req.json()).messages
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    !messages.every(
      (m) =>
        m &&
        typeof m.content === 'string' &&
        ['system', 'user', 'assistant'].includes(m.role),
    )
  ) {
    return Response.json({ error: 'Invalid messages.' }, { status: 400 })
  }

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: 'gpt-4o-mini', stream: true, messages }),
  })

  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: `OpenAI request failed (${upstream.status}).` }, { status: 502 })
  }

  // Pass the SSE stream straight through — the frontend parses it the same
  // way as a direct OpenAI response.
  return new Response(upstream.body, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

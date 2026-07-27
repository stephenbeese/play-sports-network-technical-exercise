import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import type { VideoRow } from '../types'
import { useChat } from '../lib/useChat'
import type { DailyPoint } from '../lib/useFilteredVideos'

interface ChatPanelProps {
  /** Rows the assistant answers from (pass the filtered set). */
  rows: VideoRow[]
  /** Filtered daily time series, for month/date-range questions. */
  daily: DailyPoint[]
  /** True when any dashboard filter is active, so answers flag filtered totals. */
  filtersActive: boolean
}

const SUGGESTION_KEYS = [
  'chat.suggestions.topVideo',
  'chat.suggestions.topChannelWatchTime',
  'chat.suggestions.viewsDecember',
  'chat.suggestions.shortsVsLong',
]

/** Floating chat assistant: demo mode with no key, OpenAI when a key is set. */
export function ChatPanel({ rows, daily, filtersActive }: ChatPanelProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [keyDraft, setKeyDraft] = useState('')
  const { messages, sending, demoMode, proxyAvailable, apiKey, setApiKey, send, clear } = useChat(
    rows,
    daily,
    filtersActive,
  )
  const bottomRef = useRef<HTMLDivElement>(null)

  // Keep the newest message in view — jump instantly when the panel opens,
  // scroll smoothly as messages stream in.
  useEffect(() => {
    if (!open) return
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = () => {
    send(input)
    setInput('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t('chat.close') : t('chat.open')}
        className="fixed bottom-5 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--accent)] p-3.5 text-xl text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? '✕' : '💬'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-21 right-5 z-40 flex h-[28rem] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-h)]">{t('chat.title')}</p>
                <p className="truncate text-[11px] text-[var(--text)]">
                  {demoMode ? t('chat.demoSubtitle') : t('chat.openaiSubtitle')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clear}
                  className="whitespace-nowrap rounded-lg border border-[var(--border)] px-2 py-1 text-xs text-[var(--text)] transition-colors hover:bg-[var(--social-bg)]"
                >
                  {t('chat.clear')}
                </button>
              )}
              {/* The deployed site answers via the server-side proxy, so a
                  pasted key is only relevant when running locally. */}
              {!proxyAvailable && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyDraft(apiKey)
                    setShowSettings((v) => !v)
                  }}
                  className="whitespace-nowrap rounded-lg border border-[var(--border)] px-2 py-1 text-xs text-[var(--text)] transition-colors hover:bg-[var(--social-bg)]"
                >
                  {apiKey ? t('chat.keySet') : t('chat.addKey')}
                </button>
              )}
              </div>
            </div>

            {showSettings && !proxyAvailable && (
              <div className="flex gap-2 border-b border-[var(--border)] px-4 py-3">
                <input
                  type="password"
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  placeholder={t('chat.keyPlaceholder')}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-xs text-[var(--text-h)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setApiKey(keyDraft)
                    setShowSettings(false)
                  }}
                  className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {t('chat.save')}
                </button>
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.length === 0 && (
                <div>
                  <p className="text-xs text-[var(--text)]">
                    {t('chat.intro')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTION_KEYS.map((key) => {
                      const question = t(key)
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => send(question)}
                          className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-3 py-1.5 text-xs text-[var(--text-h)] transition-colors hover:bg-[var(--social-bg)]"
                        >
                          {question}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'ml-auto bg-[var(--accent)] text-white'
                      : 'bg-[var(--social-bg)] text-[var(--text-h)]'
                  } ${message.content === '' ? 'animate-pulse' : ''}`}
                >
                  {message.content || t('chat.thinking')}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
              className="flex gap-2 border-t border-[var(--border)] px-4 py-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chat.inputPlaceholder')}
                aria-label={t('chat.inputAria')}
                className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-h)]"
              />
              <button
                type="submit"
                disabled={sending || input.trim() === ''}
                className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {t('chat.send')}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

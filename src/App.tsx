import { Layout } from './components/Layout'
import { VideoTable } from './components/VideoTable'
import { useVideoData } from './lib/useVideoData'

const TOP_COUNT = 25

function App() {
  const { rows, loading, error } = useVideoData()

  const topRows = rows.slice(0, TOP_COUNT)

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="!m-0 !text-2xl !font-semibold !tracking-tight text-[var(--text-h)]">
          Top performing videos
        </h1>
        <p className="mt-1 text-sm text-[var(--text)]">
          Ranked by total views across all channels.
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-10 text-center text-sm text-[var(--text)]">
          Loading videos…
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-10 text-center text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          Failed to load data: {error}
        </div>
      )}

      {!loading && !error && <VideoTable rows={topRows} />}
    </Layout>
  )
}

export default App

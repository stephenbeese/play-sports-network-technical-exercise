import { useMemo, useState } from 'react'
import { Layout } from './components/Layout'
import { Pagination } from './components/Pagination'
import { VideoTable } from './components/VideoTable'
import { useVideoData } from './lib/useVideoData'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const DEFAULT_PAGE_SIZE = 10

function App() {
  const { rows, loading, error } = useVideoData()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const startIndex = (currentPage - 1) * pageSize

  const pageRows = useMemo(
    () => rows.slice(startIndex, startIndex + pageSize),
    [rows, startIndex, pageSize],
  )

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(1)
  }

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

      {!loading && !error && (
        <>
          <VideoTable rows={pageRows} startIndex={startIndex} />
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            pageSize={pageSize}
            totalItems={rows.length}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </Layout>
  )
}

export default App

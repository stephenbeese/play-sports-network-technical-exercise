interface PaginationProps {
  page: number
  pageCount: number
  pageSize: number
  totalItems: number
  pageSizeOptions: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function Pagination({
  page,
  pageCount,
  pageSize,
  totalItems,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const lastItem = Math.min(page * pageSize, totalItems)

  const buttonClass =
    'inline-flex items-center rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text-h)] transition-colors enabled:hover:bg-[var(--social-bg)] disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-[var(--text)]">
          Rows per page
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-sm text-[var(--text-h)] transition-colors hover:bg-[var(--social-bg)]"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <p className="text-xs text-[var(--text)]">
          Showing{' '}
          <span className="font-semibold text-[var(--text-h)]">
            {firstItem}–{lastItem}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-[var(--text-h)]">
            {totalItems}
          </span>{' '}
          videos
        </p>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={buttonClass}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span className="px-2 text-sm text-[var(--text)]">
            Page{' '}
            <span className="font-semibold text-[var(--text-h)]">{page}</span> of{' '}
            {pageCount}
          </span>
          <button
            type="button"
            className={buttonClass}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

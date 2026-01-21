import { useMemo, useState } from 'react'
import { cn } from '@/libs'
import { Button } from '@/components'
import { generateDottedPages } from '@/utils/constants'

const DOT_REPRESENTATION = '...'

type Props = Readonly<{
  limit: number
  total: number
  onNextPage?: () => void
  onPreviousPage?: () => void
  onPageChange?: (page: number) => void
  currentPage?: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  // For cursor-based pagination
  currentAfter?: string
  previousCursor?: string | null
  onSetAfter?: (after: string) => void
}>

export function Pagination({
  limit = 10,
  total,
  onNextPage,
  onPreviousPage,
  onPageChange,
  currentPage: controlledPage,
  hasNextPage: externalHasNextPage,
  hasPreviousPage: externalHasPreviousPage,
  currentAfter,
  previousCursor,
  onSetAfter,
}: Props) {
  const [internalPage, setInternalPage] = useState(1)
  const page = controlledPage !== undefined ? controlledPage : internalPage
  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit])
  const pageList = useMemo(() => {
    return generateDottedPages({
      page,
      totalPages,
      dotRepresentation: DOT_REPRESENTATION,
    })
  }, [page, totalPages])

  // Use external pagination flags if provided, otherwise calculate from page/totalPages
  const hasNextPage = externalHasNextPage !== undefined ? externalHasNextPage : page < totalPages
  const hasPreviousPage = externalHasPreviousPage !== undefined ? externalHasPreviousPage : page > 1

  // Check if using cursor-based pagination (when callbacks are provided)
  const isCursorBasedPagination =
    onNextPage !== undefined || onPreviousPage !== undefined || onSetAfter !== undefined

  function handleNextPage() {
    if (onNextPage) {
      onNextPage()
    } else if (page < totalPages) {
      setInternalPage(page + 1)
    }
  }

  function handlePreviousPage() {
    // For cursor-based pagination, handle the previous cursor logic first
    if (onSetAfter && currentAfter !== undefined && previousCursor !== undefined) {
      const currentAfterValue = currentAfter || ''
      const previousCursorValue = previousCursor || ''

      // If previous is null or empty, or if it matches current after, go to first page (clear after)
      const newAfter =
        !previousCursorValue || previousCursorValue === currentAfterValue ? '' : previousCursorValue
      onSetAfter(newAfter)
    } else if (onPreviousPage) {
      onPreviousPage()
    } else if (page > 1) {
      setInternalPage(page - 1)
    }
  }

  function handlePageClick(newPage: number) {
    if (onPageChange) {
      onPageChange(newPage)
    } else {
      setInternalPage(newPage)
    }
  }

  return (
    <div className="flex gap-2 justify-between items-center">
      <Button
        size="small"
        variant="outline"
        icon={'hugeicons:arrow-left-01'}
        iconPosition="left"
        iconProps={{ width: '16px' }}
        className="text-xs leading-6 mr-2.5"
        disabled={!hasPreviousPage}
        onClick={handlePreviousPage}
      >
        <span className="hidden lg:inline-block">Prev</span>
      </Button>

      {/* Only show page numbers if NOT using cursor-based pagination */}
      {!isCursorBasedPagination && (
        <div className="space-x-2">
          {pageList.map((pageItem, index) => {
            if (pageItem === DOT_REPRESENTATION) {
              return (
                <span key={`dot-${index}`} className="text-xs leading-6">
                  {pageItem}
                </span>
              )
            }
            return (
              <button
                key={`page-${pageItem}-${index}`}
                className={cn('text-xs leading-6 w-8 h-8 rounded-lg hover:bg-neutral-grey-50', {
                  'bg-neutral-grey-50 hover:bg-neutral-grey-50/80 text-neutral-grey-500':
                    +pageItem === page,
                })}
                onClick={() => handlePageClick(+pageItem)}
              >
                {pageItem}
              </button>
            )
          })}
        </div>
      )}

      <Button
        size="small"
        variant="outline"
        icon={'hugeicons:arrow-right-01'}
        iconPosition="right"
        iconProps={{ width: '16px' }}
        className="text-xs leading-6"
        onClick={handleNextPage}
        disabled={!hasNextPage}
      >
        <span className="hidden lg:inline-block">Next</span>
      </Button>
    </div>
  )
}

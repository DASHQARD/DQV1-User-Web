import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/libs'
import { Button } from '@/components'
import { generateDottedPages } from '@/utils/constants'

const DOT_REPRESENTATION = '...'

type Props = Readonly<{
  limit: number
  page: number
  setPage: (page: number) => void
  total: number
}>

export function Pagination({ limit = 10, page = 1, setPage, total }: Props) {
  const [goToPage, setGoToPage] = useState(page)
  useEffect(() => {
    if (page !== goToPage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGoToPage(page)
    }
  }, [page, goToPage])

  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit])
  const pageList = useMemo(() => {
    return generateDottedPages({
      page,
      totalPages,
      dotRepresentation: DOT_REPRESENTATION,
    })
  }, [page, totalPages])

  function handleNextPage() {
    if (page < totalPages) setPage(page + 1)
  }

  function handlePreviousPage() {
    if (page > 1) setPage(page - 1)
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
        disabled={page === 1}
        onClick={handlePreviousPage}
      >
        <span className="hidden lg:inline-block">Prev</span>
      </Button>

      <div className="space-x-2">
        {pageList.map((pageItem) => {
          if (pageItem === DOT_REPRESENTATION) {
            return (
              <span key={pageItem} className="text-xs leading-6">
                {pageItem}
              </span>
            )
          }
          return (
            <button
              key={pageItem}
              className={cn('text-xs leading-6 w-8 h-8 rounded-lg hover:bg-neutral-grey-50', {
                'bg-neutral-grey-50 hover:bg-neutral-grey-50/80 text-neutral-grey-500':
                  +pageItem === page,
              })}
              onClick={() => setPage(+pageItem)}
            >
              {pageItem}
            </button>
          )
        })}
      </div>
      <Button
        size="small"
        variant="outline"
        icon={'hugeicons:arrow-right-01'}
        iconPosition="right"
        iconProps={{ width: '16px' }}
        className="text-xs leading-6"
        onClick={handleNextPage}
      >
        <span className="hidden lg:inline-block">Next</span>
      </Button>
    </div>
  )
}

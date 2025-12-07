import React from 'react'

import { type ColumnDef } from '@tanstack/react-table'

import EmptyStateImage from '@/assets/images/empty-state.png'
import { cn } from '@/libs'
import type { CsvHeader, DropdownOption, QueryType } from '@/types'
import { generateAndDownloadCsv, getQueryString } from '@/utils/helpers'

import { Button } from '../Button'
import { Dropdown } from '../Dropdown'
import { EmptyState } from '../EmptyState'
import { Loader } from '../Loader'
import { Pagination } from '../Pagination'
import { PrintView } from '../PrintView'
import { DebouncedSearch } from '../SearchBox'
import { Text } from '../Text'
import { Table } from './Table'

type DateOmits = 'page' | 'limit' | 'search'
type FilterType = {
  simpleSelects?: Array<{
    label: string
    options: string[] | DropdownOption[]
  }>
  date?:
    | Array<keyof Omit<QueryType, DateOmits>>
    | Array<{ queryKey: keyof Omit<QueryType, DateOmits>; label?: string }>
}

type Props = Readonly<{
  columns: ColumnDef<any, any>[]
  data?: Record<string, any>[]
  loading: boolean
  total?: number
  query: QueryType
  setQuery: React.Dispatch<QueryType>
  searchPlaceholder?: string
  className?: string
  buttonGroup?: React.ReactNode
  printTitle?: string
  csvHeaders?: CsvHeader[]
  filterBy?: FilterType
  noSearch?: boolean
  noExport?: boolean
  onRowClick?: (rowData: Record<string, any>) => void
  filterWrapperClassName?: string
}>

export function PaginatedTable({
  data,
  loading,
  total,
  columns,
  query,
  setQuery,
  searchPlaceholder,
  className,
  buttonGroup,
  printTitle,
  csvHeaders,
  filterBy,
  noSearch,
  noExport,
  onRowClick,
  filterWrapperClassName,
}: Props) {
  const memoisedColumns = React.useMemo(() => columns, [columns])
  const memoisedData = React.useMemo(() => data ?? [], [data])

  function onSearch(search: string) {
    setQuery({ ...query, page: 1, search: search.trim() })
  }
  function onPageChange(page: number) {
    setQuery({ ...query, page })
  }

  function onPageSizeChange(limit: number) {
    setQuery({ ...query, page: 1, limit })
  }

  const actions = [
    ...(csvHeaders
      ? [
          {
            label: 'Export as CSV',
            onClickFn: () => {
              setExportPending('csv')
              setPreviousLimit(query.limit)
              onPageSizeChange(Number(total))
            },
          },
        ]
      : []),
    {
      label: 'Export as PDF',
      onClickFn: () => {
        setExportPending('pdf')
        setPreviousLimit(query.limit)
        onPageSizeChange(Number(total))
      },
    },
  ]

  const [exportPending, setExportPending] = React.useState<'csv' | 'pdf' | null>(null)
  const [previousLimit, setPreviousLimit] = React.useState<number | null>(null)

  // Watch for data changes and export when ready
  React.useEffect(() => {
    // Only proceed if:
    // 1. Export is pending
    // 2. Data is loaded (not loading)
    // 3. Query limit has been updated to total (indicating fetch with new limit)
    // 4. Data length matches total (all records fetched)
    if (exportPending && !loading && data && query.limit === total && data.length === total) {
      if (exportPending === 'csv') {
        generateAndDownloadCsv({
          data: data ?? [],
          fileName: printTitle ?? `Afri-transfer${printTitle ?? ''}-${getQueryString(query)}`,
          headers: csvHeaders ?? [],
        })
      } else if (exportPending === 'pdf') {
        globalThis.print()
      }

      // Reset the limit to previous value after export
      if (previousLimit !== null) {
        setQuery({ ...query, limit: previousLimit })
      }

      setExportPending(null)
      setPreviousLimit(null)
    }
  }, [data, total, exportPending, loading, query, printTitle, csvHeaders, previousLimit, setQuery])

  return (
    <div className={cn('grid gap-4', className)}>
      <div className={`flex flex-wrap justify-end items-center gap-2 ${filterWrapperClassName}`}>
        {noSearch ? null : (
          <DebouncedSearch
            value={query.search}
            onChange={onSearch}
            placeholder={searchPlaceholder ?? 'Search...'}
            className="md:w-[343px]"
          />
        )}
        {filterBy?.simpleSelects?.map((item) => {
          const selectedValue = query[item.label as keyof QueryType]
          const selectedOption = item.options.find(
            (x) => (typeof x === 'string' ? x : x.value) === selectedValue,
          )
          const displayText =
            selectedValue && selectedOption
              ? typeof selectedOption === 'string'
                ? selectedOption
                : selectedOption.label
              : `Filter by ${item.label === 'direction' ? 'transaction type' : item.label}`

          return (
            <Dropdown
              key={item.label}
              contentClassName=""
              align="start"
              actions={[
                {
                  label: 'All',
                  value: '',
                },
                ...item.options.map((x) => (typeof x === 'string' ? { label: x, value: x } : x)),
              ].map((option) => ({
                label: option.label,
                onClickFn: () =>
                  setQuery({
                    ...query,
                    [item.label]: option.value,
                  }),
              }))}
            >
              <Button
                variant="outline"
                icon="hugeicons:arrow-down-01"
                iconPosition="right"
                size="medium"
                className="border border-[#e2e4ed] bg-white py-0 rounded-md w-fit text-xs text-[#7c8689] font-normal capitalize"
              >
                {displayText}
              </Button>
            </Dropdown>
          )
        })}

        {/* other filters here */}
        {buttonGroup}

        {noExport ? null : (
          <div className="">
            <Dropdown actions={actions}>
              <Button
                variant="outline"
                icon="hugeicons:arrow-down-01"
                iconPosition="right"
                size="medium"
                className="border border-[#e2e4ed] bg-white py-0 rounded-md w-fit text-xs text-primary-900 capitalize font-semibold "
              >
                Export
              </Button>
            </Dropdown>
          </div>
        )}
      </div>

      {loading ? (
        <div className="w-full h-80 grid place-items-center">
          <div>
            <Loader />
          </div>
        </div>
      ) : (
        <PrintView>
          <div className="overflow-x-auto">
            <Text weight="bold" className="print-view mb-5">
              {printTitle}
            </Text>
            <Table columns={memoisedColumns as any} data={memoisedData} onRowClick={onRowClick} />

            {memoisedData?.length ? null : (
              <EmptyState
                image={EmptyStateImage}
                title="Nothing here yet"
                description="Once data is added or actions are taken, you'll see them appear in this space."
              />
            )}

            <div className="no-print mt-5">
              <Pagination
                total={Number(total)}
                page={Number(query.page)}
                setPage={onPageChange}
                limit={Number(query.limit)}
              />
            </div>
          </div>
        </PrintView>
      )}
    </div>
  )
}

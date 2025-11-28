import React, { useMemo, useState } from 'react'
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { cn } from '@/libs'
import { Loader } from '@/components/Loader'

export type DataTablePageSizeOption = number | { label: string; value: number }

export interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  isLoading?: boolean
  pageSizeOptions?: DataTablePageSizeOption[]
  initialPageSize?: number
  emptyState?: React.ReactNode
  className?: string
  tableClassName?: string
  showPageSizeSelect?: boolean
  stickyHeader?: boolean
}

const defaultEmptyState = (
  <div className="py-16 text-center text-sm text-gray-500">
    <p className="font-semibold text-gray-700">No records found</p>
    <p className="text-gray-500">Try adjusting your filters or adding new data.</p>
  </div>
)

/**
 * Generic data table powered by TanStack Table v8.
 *
 * Example usage:
 * ```tsx
 * const columns: ColumnDef<User>[] = [
 *   { accessorKey: 'name', header: 'Name' },
 *   { accessorKey: 'email', header: 'Email' },
 * ]
 *
 * <DataTable columns={columns} data={users} />
 * ```
 */
export function DataTable<TData, TValue>({
  data,
  columns,
  isLoading,
  pageSizeOptions = [10, 20, 50],
  initialPageSize = 10,
  emptyState = defaultEmptyState,
  className,
  tableClassName,
  showPageSizeSelect = true,
  stickyHeader = true,
}: DataTableProps<TData, TValue>) {
  const preparedPageOptions = useMemo((): Array<{ label: string; value: number }> => {
    if (!Array.isArray(pageSizeOptions))
      return [{ label: `${initialPageSize} / page`, value: initialPageSize }]
    return pageSizeOptions.map((option) =>
      typeof option === 'number' ? { label: `${option} / page`, value: option } : option,
    )
  }, [pageSizeOptions, initialPageSize])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
  })

  return (
    <div className={cn('space-y-4', className)}>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className={cn('relative overflow-x-auto', stickyHeader ? 'max-h-[520px]' : undefined)}>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader />
            </div>
          ) : data.length === 0 ? (
            emptyState
          ) : (
            <table className={cn('w-full border-collapse text-sm', tableClassName)}>
              <thead
                className={cn(
                  'bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500',
                  stickyHeader && 'sticky top-0 z-10',
                )}
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={cn(
                          'px-5 py-4 font-semibold',
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : 'cursor-default',
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2 whitespace-nowrap text-gray-600">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <IconCaretUp />,
                            desc: <IconCaretDown />,
                          }[header.column.getIsSorted() as string] || null}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-4 align-middle text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
                {table.getRowModel().rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-5 py-10 text-center text-sm text-gray-500"
                    >
                      No data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && data.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
            <div>
              Showing{' '}
              <span className="font-semibold text-gray-800">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-gray-800">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length,
                )}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-800">
                {table.getFilteredRowModel().rows.length}
              </span>{' '}
              entries
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {showPageSizeSelect && (
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-gray-500">
                    Rows per page
                  </span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(event) => table.setPageSize(Number(event.target.value))}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#402D87] focus:outline-none focus:ring-2 focus:ring-[#402D87]/20"
                  >
                    {preparedPageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:border-[#402D87] hover:text-[#402D87] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <IconChevronLeft />
                </button>
                <span className="text-sm text-gray-700">
                  Page{' '}
                  <span className="font-semibold">
                    {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:border-[#402D87] hover:text-[#402D87] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <IconChevronRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
  </svg>
)

const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
  </svg>
)

const IconCaretUp = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-3.5 w-3.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 14l6-6 6 6" />
  </svg>
)

const IconCaretDown = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-3.5 w-3.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 10l6 6 6-6" />
  </svg>
)

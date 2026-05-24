import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from '@tanstack/react-table'

import type { TableCellProps } from '@/types'
import { cn } from '@/libs'

import styles from './Table.module.scss'

type Props = Readonly<{
  columns: ColumnDef<any, any>[]
  data: Record<string, any>[]
  onRowClick?: (rowData: TableCellProps['row']['original']) => void
  enableRowSelection?: boolean
  getRowId?: (row: any) => string
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (
    updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState),
  ) => void
  /** On viewports below md, pin the first column while horizontally scrolling the rest. */
  stickyFirstColumnOnMobile?: boolean
}>

export function Table({
  columns,
  data,
  onRowClick,
  enableRowSelection = false,
  getRowId,
  rowSelection,
  onRowSelectionChange,
  stickyFirstColumnOnMobile = false,
}: Props) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection,
    getRowId,
    onRowSelectionChange,
    state: {
      rowSelection: rowSelection || {},
    },
  })

  return (
    <div
      className={cn(
        styles.table_wrapper,
        stickyFirstColumnOnMobile && styles.sticky_first_column_mobile,
      )}
    >
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="uppercase">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className={`transmooth ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

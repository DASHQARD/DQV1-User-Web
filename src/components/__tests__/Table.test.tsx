import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import type { ColumnDef } from '@tanstack/react-table'
import { renderWithProviders, screen } from '@/test/test-utils'
import { Table } from '../Table/Table'

type Row = { id: string; name: string }
const columns: ColumnDef<Row, unknown>[] = [{ accessorKey: 'name', header: 'Name' }]
const data: Row[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
]

describe('Table', () => {
  it('renders table headers', () => {
    renderWithProviders(<Table columns={columns} data={data} getRowId={(r) => r.id} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('renders data rows', () => {
    renderWithProviders(<Table columns={columns} data={data} getRowId={(r) => r.id} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders empty table when data is empty', () => {
    renderWithProviders(<Table columns={columns} data={[]} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })

  it('calls onRowClick when row is clicked', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    renderWithProviders(
      <Table columns={columns} data={data} getRowId={(r) => r.id} onRowClick={onRowClick} />,
    )
    await user.click(screen.getByText('Alice'))
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alice' }))
  })
})

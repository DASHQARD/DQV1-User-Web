import { describe, it, expect } from 'vitest'
import type { ColumnDef } from '@tanstack/react-table'
import { renderWithProviders, screen } from '@/test/test-utils'
import { DataTable } from '../DataTable/DataTable'

type Row = { id: string; name: string; email: string }

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
]

describe('DataTable', () => {
  it('renders table headers when data is present', () => {
    const data: Row[] = [{ id: '1', name: 'Alice', email: 'a@b.com' }]
    renderWithProviders(<DataTable data={data} columns={columns} getRowId={(row) => row.id} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders empty state when data is empty', () => {
    renderWithProviders(<DataTable data={[]} columns={columns} />)
    expect(screen.getByText('No records found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters or adding new data.')).toBeInTheDocument()
  })

  it('renders data rows', () => {
    const data: Row[] = [
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' },
    ]
    renderWithProviders(<DataTable data={data} columns={columns} getRowId={(row) => row.id} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    renderWithProviders(
      <DataTable data={[{ id: '1', name: 'A', email: 'a@b.com' }]} columns={columns} isLoading />,
    )
    expect(screen.getByAltText('Loading...')).toBeInTheDocument()
  })

  it('shows pagination info when data is present', () => {
    const data: Row[] = Array.from({ length: 15 }, (_, i) => ({
      id: String(i),
      name: `User ${i}`,
      email: `user${i}@example.com`,
    }))
    renderWithProviders(
      <DataTable data={data} columns={columns} initialPageSize={10} getRowId={(row) => row.id} />,
    )
    expect(screen.getByText(/Showing/)).toBeInTheDocument()
    expect(screen.getByText(/to/)).toBeInTheDocument()
    expect(screen.getByText(/entries/)).toBeInTheDocument()
    expect(screen.getByText('Rows per page')).toBeInTheDocument()
  })

  it('renders custom empty state when provided', () => {
    renderWithProviders(
      <DataTable
        data={[]}
        columns={columns}
        emptyState={<div data-testid="custom-empty">Custom empty</div>}
      />,
    )
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument()
    expect(screen.getByText('Custom empty')).toBeInTheDocument()
  })
})

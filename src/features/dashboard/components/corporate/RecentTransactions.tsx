import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/libs'
import { Text, Table } from '@/components'
import { StatusCell, DateCell, CurrencyCell } from '@/components/Cells'
import { ROUTES } from '@/utils/constants'
import { MOCK_TRANSACTIONS } from '@/mocks'
import type { ColumnDef } from '@tanstack/react-table'

type Transaction = {
  id: string
  type: 'purchase' | 'redemption'
  amount: number
  date: string
  createdAt: string
  status?: string
  recipientName?: string
  vendorName?: string
}

const addAccountParam = (path: string): string => {
  const separator = path?.includes('?') ? '&' : '?'
  return `${path}${separator}account=corporate`
}

const recentTransactionsColumns: ColumnDef<Transaction>[] = [
  {
    header: 'Transaction ID',
    accessorKey: 'id',
  },
  {
    header: 'Type',
    accessorKey: 'type',
    cell: ({ row }) => {
      const type = row.original.type
      return (
        <Text variant="span" className="text-sm capitalize">
          {type}
        </Text>
      )
    },
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
    cell: CurrencyCell,
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: StatusCell,
  },
  {
    header: 'Date',
    accessorKey: 'createdAt',
    cell: DateCell,
  },
]

export default function RecentTransactions() {
  const recentTransactions = React.useMemo(() => {
    return (MOCK_TRANSACTIONS as Transaction[])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
      <div className="p-6 pb-0 flex justify-between items-center mb-5">
        <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
          <Icon icon="bi:activity" className="text-[#402D87] mr-2" />
          Recent Transactions
        </h5>
        <Link
          to={addAccountParam(ROUTES.IN_APP.DASHBOARD.CORPORATE.TRANSACTIONS)}
          className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
        >
          View all <Icon icon="bi:arrow-right" className="ml-1" />
        </Link>
      </div>

      <div className="px-6 pb-6">
        {recentTransactions.length === 0 ? (
          <div className="text-center py-10 text-[#6c757d]">
            <Icon icon="bi:inbox" className="text-5xl text-[#e9ecef] mb-4" />
            <p className="m-0 text-sm">No recent transactions to display</p>
          </div>
        ) : (
          <Table columns={recentTransactionsColumns} data={recentTransactions} />
        )}
      </div>
    </div>
  )
}

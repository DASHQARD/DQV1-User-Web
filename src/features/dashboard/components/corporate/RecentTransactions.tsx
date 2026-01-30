import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/libs'
import { Text, Table } from '@/components'
import { StatusCell, DateCell, CurrencyCell } from '@/components/Cells'
import { ROUTES } from '@/utils/constants'
import { corporateQueries } from '@/features/dashboard/corporate/hooks'
import type { ColumnDef } from '@tanstack/react-table'
import type { PaymentInfoData } from '@/types/user'

type Transaction = {
  id: string
  type: 'purchase' | 'redemption'
  amount: number
  date: string
  createdAt: string
  status: string
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
    cell: (info) => <StatusCell row={info.row as any} getValue={info.getValue as any} />,
  },
  {
    header: 'Date',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => <DateCell getValue={() => String(getValue() || '')} />,
  },
]

export default function RecentTransactions() {
  const { useGetAllCorporatePaymentsService } = corporateQueries()
  const { data: allCorporatePayments, isLoading } = useGetAllCorporatePaymentsService()

  // Transform API data to Transaction format and limit to 5 most recent
  const recentTransactions = useMemo(() => {
    if (!allCorporatePayments) {
      return []
    }

    // Handle both direct array response and wrapped response with data property
    const paymentsData = Array.isArray(allCorporatePayments)
      ? allCorporatePayments
      : allCorporatePayments?.data || []

    if (!Array.isArray(paymentsData) || paymentsData.length === 0) {
      return []
    }

    return paymentsData
      .slice(0, 5) // Get first 5 transactions (most recent)
      .map((payment: PaymentInfoData) => ({
        id: payment.trans_id || String(payment.id),
        type: (payment.type?.toLowerCase() === 'redemption' ? 'redemption' : 'purchase') as
          | 'purchase'
          | 'redemption',
        amount: payment.amount || 0,
        date: payment.created_at || '',
        createdAt: payment.created_at || '',
        status: payment.status || '',
      }))
  }, [allCorporatePayments])

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
      <div className="p-6 pb-0 flex justify-between items-center mb-5">
        <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
          <Icon icon="bi:activity" className="text-[#402D87] mr-2" />
          Recent Transactions
        </h5>
        <Link
          to={addAccountParam(ROUTES.IN_APP.DASHBOARD.CORPORATE.PURCHASE)}
          className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
        >
          View all <Icon icon="bi:arrow-right" className="ml-1" />
        </Link>
      </div>

      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="text-center py-10 text-[#6c757d]">
            <Icon icon="bi:arrow-repeat" className="text-5xl text-[#e9ecef] mb-4 animate-spin" />
            <p className="m-0 text-sm">Loading transactions...</p>
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <Icon icon="bi:inbox" className="text-4xl text-[#e9ecef] mr-3" />
            <p className="m-0 text-sm text-[#9ca3af]">No recent transactions to display</p>
          </div>
        ) : (
          <Table columns={recentTransactionsColumns} data={recentTransactions} />
        )}
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { Tag, Text } from '@/components'
import { Icon } from '@/libs'
import { cn } from '@/libs/clsx'
import { ROUTES } from '@/utils/constants'
import { formatCurrency, formatDateTime } from '@/utils/format'
import { getStatusVariant } from '@/utils/helpers'
import type { PaymentInfoData } from '@/types/user'

const RECENT_LIMIT = 4

export type RecentTransactionItem = {
  id: string | number
  receiptNumber: string
  amount: number
  status: string
  type: string
  createdAt: string
  label: string
}

function buildLabel(payment: PaymentInfoData & { cart_details?: { items?: { type?: string }[] } }) {
  const cartItems = payment.cart_details?.items || []
  if (cartItems.length === 0) return 'Gift card purchase'

  const cardTypes = [
    ...new Set(
      cartItems.map((item) => {
        const type = item.type?.toLowerCase() || ''
        if (type === 'dashx') return 'DashX'
        if (type === 'dashpro') return 'DashPro'
        if (type === 'dashpass') return 'DashPass'
        if (type === 'dashgo') return 'DashGo'
        return item.type || 'Card'
      }),
    ),
  ]

  return `${cardTypes.join(', ')} purchase`
}

function parsePayments(paymentResponse: unknown): PaymentInfoData[] {
  if (!paymentResponse) return []
  const response = paymentResponse as { data?: PaymentInfoData[] } | PaymentInfoData[]
  if (Array.isArray(response)) return response
  return response?.data || []
}

// eslint-disable-next-line react-refresh/only-export-components
export function mapPaymentsToRecentTransactions(
  paymentResponse: unknown,
  limit = RECENT_LIMIT,
): RecentTransactionItem[] {
  const payments = parsePayments(paymentResponse)
  if (payments.length === 0) return []

  return payments
    .map((payment) => ({
      id: payment.id,
      receiptNumber: payment.receipt_number || '—',
      amount: parseFloat(String(payment.amount ?? 0)),
      status: payment.status || 'unknown',
      type: payment.type || 'checkout',
      createdAt: payment.created_at || '',
      label: buildLabel(
        payment as PaymentInfoData & { cart_details?: { items?: { type?: string }[] } },
      ),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

type UserRecentTransactionsProps = {
  paymentResponse: unknown
  isLoading?: boolean
}

export function UserRecentTransactions({
  paymentResponse,
  isLoading = false,
}: UserRecentTransactionsProps) {
  const navigate = useNavigate()
  const transactions = useMemo(
    () => mapPaymentsToRecentTransactions(paymentResponse),
    [paymentResponse],
  )

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#402D87]/10">
            <Icon icon="bi:clock-history" className="text-lg text-[#402D87]" />
          </div>
          <div>
            <Text variant="h6" weight="semibold" className="text-gray-900">
              Recent transactions
            </Text>
            <p className="mt-0.5 text-xs text-gray-500">Your latest orders and checkouts</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.ORDERS)}
          className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-[#402D87] transition-colors hover:bg-[#402D87]/5"
        >
          View all
          <Icon icon="bi:arrow-right" className="ml-1 inline text-xs" />
        </button>
      </header>

      <div className="flex flex-1 flex-col px-2 py-2">
        {isLoading ? (
          <div className="flex flex-1 flex-col gap-2 p-3">
            {Array.from({ length: RECENT_LIMIT }).map((_, index) => (
              <div
                key={index}
                className="h-[72px] animate-pulse rounded-xl bg-gray-100"
                aria-hidden
              />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <Icon icon="bi:inbox" className="text-3xl text-gray-300" />
            </div>
            <Text variant="span" weight="semibold" className="text-gray-900">
              No transactions yet
            </Text>
            <p className="mt-1 max-w-[240px] text-sm text-gray-500">
              When you buy gift cards, your latest orders will show up here.
            </p>
            <button
              type="button"
              onClick={() => navigate(ROUTES.IN_APP.DASHQARDS)}
              className="mt-5 rounded-lg bg-[#402D87] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#352574]"
            >
              Browse gift cards
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <li key={transaction.id}>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.ORDERS)}
                  className={cn(
                    'flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3.5 text-left',
                    'transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#402D87]/30',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {transaction.receiptNumber}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">{transaction.label}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {transaction.createdAt ? formatDateTime(transaction.createdAt) : '—'}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <p className="text-sm font-semibold tabular-nums text-gray-900">
                      {formatCurrency(transaction.amount, 'GHS')}
                    </p>
                    <Tag
                      value={transaction.status}
                      variant={getStatusVariant(transaction.status)}
                    />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

import type { QueryType } from '@/types'

export interface VendorPayment {
  id: string
  vendor_id: number
  vendor_name: string
  business_name: string
  amount: number
  payment_period: string
  payment_frequency?: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'custom'
  branch_location?: string
  status: 'pending' | 'paid' | 'overdue'
  due_date: string
  paid_date?: string
  invoice_number?: string
  description?: string
}

export interface VendorPaymentsListResponse {
  data: VendorPayment[]
  pagination?: {
    limit: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    next: string | null
    previous: string | null
  }
}

// Dummy data for vendor payments
const dummyVendorPayments: VendorPayment[] = [
  {
    id: '1',
    vendor_id: 1,
    vendor_name: 'Mart Ghana',
    business_name: 'Mart Ghana Limited',
    amount: 15000,
    payment_period: 'January 2024',
    payment_frequency: 'monthly',
    branch_location: 'Accra Central',
    status: 'paid',
    due_date: '2024-02-15T00:00:00Z',
    paid_date: '2024-02-10T00:00:00Z',
    invoice_number: 'INV-2024-001',
    description: 'Payment for January 2024 redemptions',
  },
  {
    id: '2',
    vendor_id: 1,
    vendor_name: 'Mart Ghana',
    business_name: 'Mart Ghana Limited',
    amount: 18250,
    payment_period: 'February 2024',
    payment_frequency: 'monthly',
    branch_location: 'Accra Central',
    status: 'paid',
    due_date: '2024-03-15T00:00:00Z',
    paid_date: '2024-03-12T00:00:00Z',
    invoice_number: 'INV-2024-002',
    description: 'Payment for February 2024 redemptions',
  },
  {
    id: '3',
    vendor_id: 1,
    vendor_name: 'Mart Ghana',
    business_name: 'Mart Ghana Limited',
    amount: 19500,
    payment_period: 'March 2024',
    status: 'paid',
    due_date: '2024-04-15T00:00:00Z',
    paid_date: '2024-04-08T00:00:00Z',
    invoice_number: 'INV-2024-003',
    description: 'Payment for March 2024 redemptions',
  },
  {
    id: '4',
    vendor_id: 1,
    vendor_name: 'Mart Ghana',
    business_name: 'Mart Ghana Limited',
    amount: 21000,
    payment_period: 'April 2024',
    status: 'paid',
    due_date: '2024-05-15T00:00:00Z',
    paid_date: '2024-05-10T00:00:00Z',
    invoice_number: 'INV-2024-004',
    description: 'Payment for April 2024 redemptions',
  },
  {
    id: '5',
    vendor_id: 1,
    vendor_name: 'Mart Ghana',
    business_name: 'Mart Ghana Limited',
    amount: 22500,
    payment_period: 'May 2024',
    status: 'paid',
    due_date: '2024-06-15T00:00:00Z',
    paid_date: '2024-06-11T00:00:00Z',
    invoice_number: 'INV-2024-005',
    description: 'Payment for May 2024 redemptions',
  },
  {
    id: '6',
    vendor_id: 1,
    vendor_name: 'Mart Ghana',
    business_name: 'Mart Ghana Limited',
    amount: 18500,
    payment_period: 'June 2024',
    status: 'paid',
    due_date: '2024-07-15T00:00:00Z',
    paid_date: '2024-07-09T00:00:00Z',
    invoice_number: 'INV-2024-006',
    description: 'Payment for June 2024 redemptions',
  },
  {
    id: '7',
    vendor_id: 1,
    vendor_name: 'Mart Ghana',
    business_name: 'Mart Ghana Limited',
    amount: 19800,
    payment_period: 'July 2024',
    status: 'paid',
    due_date: '2024-08-15T00:00:00Z',
    paid_date: '2024-08-12T00:00:00Z',
    invoice_number: 'INV-2024-007',
    description: 'Payment for July 2024 redemptions',
  },
  {
    id: '8',
    vendor_id: 1,
    vendor_name: 'Mart Ghana',
    business_name: 'Mart Ghana Limited',
    amount: 17500,
    payment_period: 'August 2024',
    status: 'paid',
    due_date: '2024-09-15T00:00:00Z',
    paid_date: '2024-09-08T00:00:00Z',
    invoice_number: 'INV-2024-008',
    description: 'Payment for August 2024 redemptions',
  },
  {
    id: '9',
    vendor_id: 1,
    vendor_name: 'Mart Ghana',
    business_name: 'Mart Ghana Limited',
    amount: 24500,
    payment_period: 'September 2024',
    status: 'paid',
    due_date: '2024-10-15T00:00:00Z',
    paid_date: '2024-10-10T00:00:00Z',
    invoice_number: 'INV-2024-009',
    description: 'Payment for September 2024 redemptions',
  },
  {
    id: '10',
    vendor_id: 1,
    vendor_name: 'Mart Ghana',
    business_name: 'Mart Ghana Limited',
    amount: 22000,
    payment_period: 'October 2024',
    status: 'paid',
    due_date: '2024-11-15T00:00:00Z',
    paid_date: '2024-11-11T00:00:00Z',
    invoice_number: 'INV-2024-010',
    description: 'Payment for October 2024 redemptions',
  },
  {
    id: '11',
    vendor_id: 1,
    vendor_name: 'Mart Ghana',
    business_name: 'Mart Ghana Limited',
    amount: 19200,
    payment_period: 'November 2024',
    status: 'paid',
    due_date: '2024-12-15T00:00:00Z',
    paid_date: '2024-12-09T00:00:00Z',
    invoice_number: 'INV-2024-011',
    description: 'Payment for November 2024 redemptions',
  },
  {
    id: '12',
    vendor_id: 1,
    vendor_name: 'Mart Ghana',
    business_name: 'Mart Ghana Limited',
    amount: 26800,
    payment_period: 'December 2024',
    payment_frequency: 'monthly',
    branch_location: 'Accra Central',
    status: 'pending',
    due_date: '2025-01-15T00:00:00Z',
    invoice_number: 'INV-2024-012',
    description: 'Payment for December 2024 redemptions',
  },
  {
    id: '13',
    vendor_id: 1,
    vendor_name: 'Mart Ghana',
    business_name: 'Mart Ghana Limited',
    amount: 18500,
    payment_period: 'January 2025',
    status: 'pending',
    due_date: '2025-02-15T00:00:00Z',
    invoice_number: 'INV-2025-001',
    description: 'Payment for January 2025 redemptions',
  },
]

export const getVendorPayments = async (query?: QueryType): Promise<VendorPaymentsListResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Apply search filter if provided
  let filteredPayments = [...dummyVendorPayments]

  if (query?.search) {
    const searchTerm = query.search.toLowerCase()
    filteredPayments = filteredPayments.filter(
      (payment) =>
        payment.vendor_name.toLowerCase().includes(searchTerm) ||
        payment.business_name.toLowerCase().includes(searchTerm) ||
        payment.payment_period.toLowerCase().includes(searchTerm) ||
        payment.invoice_number?.toLowerCase().includes(searchTerm) ||
        payment.status.toLowerCase().includes(searchTerm),
    )
  }

  // Apply pagination (using limit only for simplicity with dummy data)
  const limit = query?.limit || 10
  const paginatedPayments = filteredPayments.slice(0, limit)

  return {
    data: paginatedPayments,
    pagination: {
      limit,
      hasNextPage: filteredPayments.length > limit,
      hasPreviousPage: false,
      next: filteredPayments.length > limit ? '1' : null,
      previous: null,
    },
  }
}

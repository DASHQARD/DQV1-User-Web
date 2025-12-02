import React, { useState, useMemo } from 'react'
import { Icon } from '@/libs'
import { formatCurrency, formatDate, formatFullDate } from '@/utils/format'
import { Loader, Modal } from '@/components'

interface Transaction {
  id: string
  date: string
  createdAt: string
  amount: number
  status: string
  type: 'purchase' | 'redemption'
  // Purchase fields
  cardNumber?: string
  recipientName?: string
  phone?: string
  // Redemption fields
  transactionId?: string
  vendorName?: string
  vendorMobile?: string
  rawData?: unknown
}

interface Filters {
  dateFrom: string
  dateTo: string
  phone: string
  vendorName: string
  vendorMomo: string
}

export default function Transactions() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'purchases' | 'redemptions'>('purchases')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(10)
  const [filters, setFilters] = useState<Filters>({
    dateFrom: '',
    dateTo: '',
    phone: '',
    vendorName: '',
    vendorMomo: '',
  })

  // Mock metrics for now
  const [metrics] = useState({
    totalPurchased: 5430.5,
    totalRedeemed: 4179.75,
  })

  // Mock transaction data
  const [purchasesData, setPurchasesData] = useState<Transaction[]>([])
  const [redemptionsData, setRedemptionsData] = useState<Transaction[]>([])

  React.useEffect(() => {
    // Simulate API call
    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API calls
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock purchase data
        const mockPurchases: Transaction[] = [
          {
            id: '1',
            date: new Date(Date.now() - 3600000).toISOString(),
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            cardNumber: '12345678',
            recipientName: 'John Doe',
            phone: '+233241234567',
            amount: 100,
            status: 'completed',
            type: 'purchase',
          },
          {
            id: '2',
            date: new Date(Date.now() - 7200000).toISOString(),
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            cardNumber: '87654321',
            recipientName: 'Jane Smith',
            phone: '+233241234568',
            amount: 250,
            status: 'pending',
            type: 'purchase',
          },
          {
            id: '3',
            date: new Date(Date.now() - 86400000).toISOString(),
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            cardNumber: '11223344',
            recipientName: 'Bob Johnson',
            phone: '+233241234569',
            amount: 50,
            status: 'completed',
            type: 'purchase',
          },
        ]

        // Mock redemption data
        const mockRedemptions: Transaction[] = [
          {
            id: '1',
            date: new Date(Date.now() - 1800000).toISOString(),
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            transactionId: 'TXN12345',
            vendorName: 'ShopRite',
            vendorMobile: '+233241234570',
            amount: 75,
            status: 'completed',
            type: 'redemption',
          },
          {
            id: '2',
            date: new Date(Date.now() - 10800000).toISOString(),
            createdAt: new Date(Date.now() - 10800000).toISOString(),
            transactionId: 'TXN12346',
            vendorName: 'Melcom',
            vendorMobile: '+233241234571',
            amount: 150,
            status: 'pending',
            type: 'redemption',
          },
        ]

        setPurchasesData(mockPurchases)
        setRedemptionsData(mockRedemptions)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const currentData = useMemo(() => {
    return activeTab === 'purchases' ? purchasesData : redemptionsData
  }, [activeTab, purchasesData, redemptionsData])

  const filteredData = useMemo(() => {
    return currentData.filter((item) => {
      const itemDate = new Date(item.date)
      const from = filters.dateFrom ? new Date(filters.dateFrom) : null
      const to = filters.dateTo ? new Date(filters.dateTo) : null

      // Date filtering
      const dateMatch =
        (!from || itemDate >= new Date(from.setHours(0, 0, 0, 0))) &&
        (!to || itemDate <= new Date(to.setHours(23, 59, 59, 999)))

      if (activeTab === 'purchases') {
        const phoneMatch =
          !filters.phone || item.phone?.toLowerCase().includes(filters.phone.toLowerCase())
        return dateMatch && phoneMatch
      } else {
        const vendorMatch =
          !filters.vendorName ||
          item.vendorName?.toLowerCase().includes(filters.vendorName.toLowerCase())
        const momoMatch = !filters.vendorMomo || item.vendorMobile?.includes(filters.vendorMomo)
        return dateMatch && vendorMatch && momoMatch
      }
    })
  }, [currentData, filters, activeTab])

  const pageCount = useMemo(() => {
    return Math.ceil(filteredData.length / rowsPerPage)
  }, [filteredData.length, rowsPerPage])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredData.slice(start, start + rowsPerPage)
  }, [filteredData, currentPage, rowsPerPage])

  const visiblePages = useMemo(() => {
    const total = pageCount
    const current = currentPage
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i)
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (current + delta < total - 1) {
      rangeWithDots.push('...', total)
    } else {
      rangeWithDots.push(total)
    }

    return rangeWithDots.filter((v, i, arr) => arr.indexOf(v) === i && (v !== '...' || v === '...'))
  }, [pageCount, currentPage])

  // Reset pagination when filters or tab changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, filters])

  const switchToPurchases = () => {
    setActiveTab('purchases')
    setCurrentPage(1)
    clearFilters()
  }

  const switchToRedemptions = () => {
    setActiveTab('redemptions')
    setCurrentPage(1)
    clearFilters()
  }

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      phone: '',
      vendorName: '',
      vendorMomo: '',
    })
  }

  const viewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
  }

  const closeModal = () => {
    setSelectedTransaction(null)
  }

  const downloadReceipt = (transaction: Transaction) => {
    if (!transaction) {
      console.error('No transaction data available for receipt download')
      return
    }

    try {
      const receiptData = {
        transactionId: transaction.id,
        type: transaction.type,
        date: transaction.date,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
        ...(transaction.type === 'purchase'
          ? {
              cardNumber: transaction.cardNumber,
              recipientName: transaction.recipientName,
              recipientPhone: transaction.phone,
              country: 'Ghana',
            }
          : {
              redemptionId: transaction.transactionId,
              vendorName: transaction.vendorName,
              vendorMobile: transaction.vendorMobile,
            }),
        receiptGeneratedAt: new Date().toISOString(),
        receiptVersion: '1.0',
        platform: 'DashQard Pro',
      }

      const receiptContent = formatReceiptContent(receiptData)

      const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const safeId = transaction.id.toString().replace(/[^a-zA-Z0-9]/g, '')
      const timestamp = new Date().toISOString().slice(0, 10)
      link.download = `dashqard-${transaction.type}-receipt-${safeId}-${timestamp}.txt`

      link.setAttribute('download', link.download)
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)

      console.log('Receipt downloaded successfully!')
    } catch (error) {
      console.error('Error downloading receipt:', error)
      alert('Error downloading receipt. Please try again.')
    }
  }

  const formatReceiptContent = (data: {
    transactionId: string
    type: string
    date: string
    amount: number
    status: string
    createdAt: string
    cardNumber?: string
    recipientName?: string
    recipientPhone?: string
    country?: string
    redemptionId?: string
    vendorName?: string
    vendorMobile?: string
    receiptGeneratedAt: string
    receiptVersion: string
    platform: string
  }): string => {
    const lines = [
      '==================================================',
      '                DASHQARD PRO RECEIPT              ',
      '==================================================',
      '',
      `Transaction Type: ${data.type.toUpperCase()}`,
      `Transaction ID: ${data.transactionId}`,
      `Date: ${formatFullDate(data.date)}`,
      `Amount: GHS ${parseFloat(data.amount.toString()).toFixed(2)}`,
      `Status: ${data.status}`,
      '',
      '--------------------------------------------------',
      `${data.type === 'purchase' ? 'PURCHASE DETAILS' : 'REDEMPTION DETAILS'}`,
      '--------------------------------------------------',
    ]

    if (data.type === 'purchase') {
      lines.push(
        `Card Number: DQP-${data.cardNumber}`,
        `Recipient Name: ${data.recipientName}`,
        `Recipient Phone: ${data.recipientPhone}`,
        `Country: ${data.country}`,
      )
    } else {
      lines.push(
        `Redemption ID: ${data.redemptionId}`,
        `Vendor Name: ${data.vendorName}`,
        `Vendor Mobile: ${data.vendorMobile}`,
      )
    }

    lines.push(
      '',
      '--------------------------------------------------',
      'RECEIPT INFORMATION',
      '--------------------------------------------------',
      `Generated: ${formatFullDate(data.receiptGeneratedAt)}`,
      `Version: ${data.receiptVersion}`,
      `Platform: ${data.platform}`,
      '',
      '--------------------------------------------------',
      'IMPORTANT NOTES:',
      '--------------------------------------------------',
      '• This receipt is for your records',
      '• Please keep this receipt for future reference',
      '• For support, contact DashQard Pro customer service',
      '',
      '==================================================',
      '        Thank you for using DashQard Pro          ',
      '==================================================',
    )

    return lines.join('\n')
  }

  const getStatusClass = (status: string) => {
    const statusLower = status.toLowerCase().replace(/\s+/g, '-')
    if (['success', 'completed', 'paid'].includes(statusLower)) {
      return 'bg-green-50 text-green-700'
    }
    if (['pending', 'processing'].includes(statusLower)) {
      return 'bg-yellow-50 text-yellow-800'
    }
    if (['failed', 'cancelled'].includes(statusLower)) {
      return 'bg-red-50 text-red-700'
    }
    return 'bg-gray-50 text-gray-700'
  }

  if (isLoading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-white">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-[600px] rounded-xl overflow-hidden">
      {/* Main Content */}
      <div className="min-h-[600px] flex flex-col">
        {/* Header Section */}
        <div className="py-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-[#2c3e50] mb-2 flex items-center">
            <Icon icon="bi:list" className="mr-3 text-[#402D87]" />
            Transactions
          </h2>
          <p className="text-base text-gray-500">
            View your purchase and redemption transaction history
          </p>
        </div>

        {/* Toggle Cards Section */}
        <div className="py-5 border-b border-gray-200 mb-8">
          <div>
            <div className="text-center mb-6">
              <h6 className="text-lg font-semibold text-gray-700 mb-2">Select Transaction Type</h6>
              <p className="text-sm text-gray-500">
                Click on a card below to view different transaction types
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {/* Total Purchased Card */}
              <div
                className={`bg-white border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                  activeTab === 'purchases'
                    ? 'border-[#402D87] bg-gradient-to-br from-[rgba(64,45,135,0.05)] to-[rgba(64,45,135,0.1)] shadow-[0_4px_20px_rgba(64,45,135,0.2)]'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5'
                }`}
                onClick={switchToPurchases}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300 ${
                    activeTab === 'purchases'
                      ? 'bg-[#402D87] text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Icon icon="bi:cart-plus" />
                </div>
                <div className="flex-1">
                  <h5
                    className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                      activeTab === 'purchases' ? 'text-[#402D87]' : 'text-gray-700'
                    }`}
                  >
                    Purchases
                  </h5>
                  <p className="text-2xl font-bold text-[#402D87] mb-1 leading-none">
                    {formatCurrency(metrics.totalPurchased)}
                  </p>
                  <p className="text-xs text-gray-500">Total purchased amount</p>
                </div>
                <div
                  className={`text-xl transition-colors duration-300 ${
                    activeTab === 'purchases' ? 'text-[#402D87]' : 'text-gray-400'
                  }`}
                >
                  <Icon icon="bi:chevron-right" />
                </div>
              </div>

              {/* Total Redeemed Card */}
              <div
                className={`bg-white border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                  activeTab === 'redemptions'
                    ? 'border-[#402D87] bg-gradient-to-br from-[rgba(64,45,135,0.05)] to-[rgba(64,45,135,0.1)] shadow-[0_4px_20px_rgba(64,45,135,0.2)]'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5'
                }`}
                onClick={switchToRedemptions}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300 ${
                    activeTab === 'redemptions'
                      ? 'bg-[#402D87] text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Icon icon="bi:credit-card-2-front" />
                </div>
                <div className="flex-1">
                  <h5
                    className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                      activeTab === 'redemptions' ? 'text-[#402D87]' : 'text-gray-700'
                    }`}
                  >
                    Redemptions
                  </h5>
                  <p className="text-2xl font-bold text-[#402D87] mb-1 leading-none">
                    {formatCurrency(metrics.totalRedeemed)}
                  </p>
                  <p className="text-xs text-gray-500">Total redeemed amount</p>
                </div>
                <div
                  className={`text-xl transition-colors duration-300 ${
                    activeTab === 'redemptions' ? 'text-[#402D87]' : 'text-gray-400'
                  }`}
                >
                  <Icon icon="bi:chevron-right" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="flex-1 flex flex-col">
          {/* Filters */}
          <div className="bg-gray-50 p-5 rounded-lg mb-6 flex flex-col sm:flex-row items-end justify-between gap-5">
            <div className="flex gap-4 flex-wrap flex-1">
              <div className="flex flex-col gap-1.5 min-w-[150px]">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide m-0">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white transition-all focus:border-[#402D87] focus:ring-2 focus:ring-[#402D87]/25 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5 min-w-[150px]">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide m-0">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white transition-all focus:border-[#402D87] focus:ring-2 focus:ring-[#402D87]/25 outline-none"
                />
              </div>
              {activeTab === 'purchases' && (
                <div className="flex flex-col gap-1.5 min-w-[150px]">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide m-0">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={filters.phone}
                    onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white transition-all focus:border-[#402D87] focus:ring-2 focus:ring-[#402D87]/25 outline-none"
                  />
                </div>
              )}
              {activeTab === 'redemptions' && (
                <div className="flex flex-col gap-1.5 min-w-[150px]">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide m-0">
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    value={filters.vendorName}
                    onChange={(e) => setFilters({ ...filters, vendorName: e.target.value })}
                    placeholder="Enter vendor name"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white transition-all focus:border-[#402D87] focus:ring-2 focus:ring-[#402D87]/25 outline-none"
                  />
                </div>
              )}
            </div>
            <div>
              <button
                onClick={clearFilters}
                className="whitespace-nowrap rounded-md font-medium px-4 py-2 text-sm cursor-pointer transition-all border border-gray-500 bg-transparent text-gray-600 hover:bg-gray-500 hover:text-white"
              >
                <Icon icon="bi:x-circle" className="mr-1 inline" />
                Clear Filters
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="bg-gray-50 px-5 py-5 border-b border-gray-200 flex items-center justify-between">
              <h5 className="text-lg font-semibold text-gray-700 m-0">
                {activeTab === 'purchases' ? 'Purchase History' : 'Redemption History'}
              </h5>
              <div>
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                  {filteredData.length} records found
                </span>
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {paginatedData.length > 0 ? (
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200 text-xs uppercase tracking-wide">
                        Date
                      </th>
                      {activeTab === 'purchases' && (
                        <>
                          <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200 text-xs uppercase tracking-wide">
                            Card Number
                          </th>
                          <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200 text-xs uppercase tracking-wide">
                            Recipient
                          </th>
                          <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200 text-xs uppercase tracking-wide">
                            Phone
                          </th>
                        </>
                      )}
                      {activeTab === 'redemptions' && (
                        <>
                          <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200 text-xs uppercase tracking-wide">
                            Transaction ID
                          </th>
                          <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200 text-xs uppercase tracking-wide">
                            Vendor Name
                          </th>
                          <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200 text-xs uppercase tracking-wide">
                            Vendor Mobile
                          </th>
                        </>
                      )}
                      <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200 text-xs uppercase tracking-wide">
                        Amount
                      </th>
                      <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200 text-xs uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-5 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200 text-xs uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item) => (
                      <tr
                        key={item.id}
                        className="cursor-pointer transition-all hover:bg-gray-50"
                        onClick={() => viewDetails(item)}
                      >
                        <td className="px-5 py-4 border-b border-gray-100 align-middle">
                          {formatDate(item.date)}
                        </td>
                        {activeTab === 'purchases' && (
                          <>
                            <td className="px-5 py-4 border-b border-gray-100 align-middle">
                              <span className="font-mono font-semibold text-[#402D87] bg-[rgba(64,45,135,0.1)] px-2 py-0.5 rounded text-xs">
                                DQP-{item.cardNumber}
                              </span>
                            </td>
                            <td className="px-5 py-4 border-b border-gray-100 align-middle">
                              <span className="font-medium text-gray-700">
                                {item.recipientName}
                              </span>
                            </td>
                            <td className="px-5 py-4 border-b border-gray-100 align-middle">
                              <span className="font-mono text-gray-500">{item.phone}</span>
                            </td>
                          </>
                        )}
                        {activeTab === 'redemptions' && (
                          <>
                            <td className="px-5 py-4 border-b border-gray-100 align-middle">
                              <span className="font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">
                                {item.transactionId}
                              </span>
                            </td>
                            <td className="px-5 py-4 border-b border-gray-100 align-middle">
                              <span className="font-medium text-gray-700">{item.vendorName}</span>
                            </td>
                            <td className="px-5 py-4 border-b border-gray-100 align-middle">
                              <span className="font-mono text-gray-500">{item.vendorMobile}</span>
                            </td>
                          </>
                        )}
                        <td className="px-5 py-4 border-b border-gray-100 align-middle">
                          <span className="font-bold text-[#402D87] text-[15px]">
                            {formatCurrency(item.amount)}
                          </span>
                        </td>
                        <td className="px-5 py-4 border-b border-gray-100 align-middle">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusClass(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td
                          className="px-5 py-4 border-b border-gray-100 align-middle"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => viewDetails(item)}
                            className="rounded-md font-medium text-xs px-3 py-1.5 cursor-pointer transition-all border-none flex items-center bg-[#402D87] text-white hover:bg-[#2d2060]"
                          >
                            <Icon icon="bi:eye" className="mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-20 px-5 text-center">
                  <div className="text-6xl text-gray-200 mb-5">
                    <Icon icon="bi:inbox" />
                  </div>
                  <h5 className="text-xl font-semibold text-gray-700 mb-2">
                    No transactions found
                  </h5>
                  <p className="text-sm text-gray-500">
                    {activeTab === 'purchases'
                      ? 'No purchase transactions match your current filters.'
                      : 'No redemption transactions match your current filters.'}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="px-5 py-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                  {Math.min(currentPage * rowsPerPage, filteredData.length)} of{' '}
                  {filteredData.length} transactions
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 border border-gray-200 bg-white rounded-md flex items-center justify-center cursor-pointer transition-all hover:border-[#402D87] hover:text-[#402D87] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="bi:chevron-left" />
                  </button>
                  <div className="flex gap-1 mx-3">
                    {visiblePages.map((page, index) => (
                      <React.Fragment key={index}>
                        {page === '...' ? (
                          <span className="w-9 h-9 flex items-center justify-center text-gray-500">
                            ...
                          </span>
                        ) : (
                          <button
                            onClick={() => setCurrentPage(page as number)}
                            className={`w-9 h-9 border rounded-md flex items-center justify-center cursor-pointer transition-all text-sm font-medium ${
                              page === currentPage
                                ? 'bg-[#402D87] border-[#402D87] text-white'
                                : 'border-gray-200 bg-white hover:border-[#402D87] hover:text-[#402D87]'
                            }`}
                          >
                            {page}
                          </button>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
                    disabled={currentPage === pageCount}
                    className="w-9 h-9 border border-gray-200 bg-white rounded-md flex items-center justify-center cursor-pointer transition-all hover:border-[#402D87] hover:text-[#402D87] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="bi:chevron-right" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Modal
          isOpen={!!selectedTransaction}
          setIsOpen={(open) => !open && closeModal()}
          showClose
          position="center"
          panelClass="max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          <div className="flex flex-col h-full">
            <div className="px-6 py-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h4 className="text-xl font-semibold text-gray-700 m-0 flex items-center">
                <Icon
                  icon={activeTab === 'purchases' ? 'bi:cart-plus' : 'bi:credit-card-2-front'}
                  className="mr-2 text-[#402D87]"
                />
                {activeTab === 'purchases' ? 'Purchase' : 'Redemption'} Details
              </h4>
            </div>
            <div className="px-6 py-6 overflow-y-auto max-h-[60vh] flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div>
                  <h6 className="text-sm font-semibold text-[#402D87] uppercase tracking-wide mb-4 pb-2 border-b-2 border-[rgba(64,45,135,0.1)]">
                    Basic Information
                  </h6>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-500 font-medium">Date:</span>
                      <span className="text-sm text-gray-700 font-medium text-right">
                        {formatFullDate(selectedTransaction.date)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-500 font-medium">Amount:</span>
                      <span className="text-lg font-bold text-[#402D87] text-right">
                        {formatCurrency(selectedTransaction.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-gray-500 font-medium">Status:</span>
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusClass(selectedTransaction.status)}`}
                      >
                        {selectedTransaction.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Purchase/Redemption Specific Details */}
                {activeTab === 'purchases' ? (
                  <div>
                    <h6 className="text-sm font-semibold text-[#402D87] uppercase tracking-wide mb-4 pb-2 border-b-2 border-[rgba(64,45,135,0.1)]">
                      Purchase Details
                    </h6>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-500 font-medium">Card Number:</span>
                        <span className="text-sm text-gray-700 font-medium text-right">
                          DQP-{selectedTransaction.cardNumber}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-500 font-medium">Recipient Name:</span>
                        <span className="text-sm text-gray-700 font-medium text-right">
                          {selectedTransaction.recipientName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-500 font-medium">Recipient Phone:</span>
                        <span className="text-sm text-gray-700 font-medium text-right">
                          {selectedTransaction.phone}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-gray-500 font-medium">Country:</span>
                        <span className="text-sm text-gray-700 font-medium text-right">Ghana</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h6 className="text-sm font-semibold text-[#402D87] uppercase tracking-wide mb-4 pb-2 border-b-2 border-[rgba(64,45,135,0.1)]">
                      Redemption Details
                    </h6>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-500 font-medium">Transaction ID:</span>
                        <span className="text-sm text-gray-700 font-medium text-right">
                          {selectedTransaction.transactionId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-500 font-medium">Vendor Name:</span>
                        <span className="text-sm text-gray-700 font-medium text-right">
                          {selectedTransaction.vendorName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-gray-500 font-medium">Vendor Mobile:</span>
                        <span className="text-sm text-gray-700 font-medium text-right">
                          {selectedTransaction.vendorMobile}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="md:col-span-2">
                  <h6 className="text-sm font-semibold text-[#402D87] uppercase tracking-wide mb-4 pb-2 border-b-2 border-[rgba(64,45,135,0.1)]">
                    Additional Information
                  </h6>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-500 font-medium">Transaction ID:</span>
                      <span className="text-sm text-gray-700 font-medium text-right">
                        {selectedTransaction.id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-gray-500 font-medium">Created:</span>
                      <span className="text-sm text-gray-700 font-medium text-right">
                        {formatFullDate(selectedTransaction.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-6 border-t border-gray-200 flex gap-3 justify-end flex-shrink-0">
              <button
                onClick={closeModal}
                className="rounded-md font-medium px-4 py-2 text-sm cursor-pointer transition-all border border-gray-500 bg-gray-500 text-white hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => downloadReceipt(selectedTransaction)}
                className="rounded-md font-medium px-4 py-2 text-sm cursor-pointer transition-all border-none flex items-center bg-[#402D87] text-white hover:bg-[#2d2060]"
              >
                <Icon icon="bi:download" className="mr-1" />
                Download Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

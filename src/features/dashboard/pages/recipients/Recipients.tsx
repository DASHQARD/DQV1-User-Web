import { Loader } from '@/components'

import type { RecipientResponse } from '@/types/cart'
import { formatCurrency, formatDate } from '@/utils/format'
import { useRecipients } from '../../hooks'

const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase()
  if (['success', 'completed', 'paid', 'redeemed'].includes(statusLower)) {
    return 'bg-green-50 text-green-700 border-green-200'
  }
  if (['pending', 'processing'].includes(statusLower)) {
    return 'bg-yellow-50 text-yellow-800 border-yellow-200'
  }
  if (['failed', 'cancelled', 'expired'].includes(statusLower)) {
    return 'bg-red-50 text-red-700 border-red-200'
  }
  return 'bg-gray-50 text-gray-700 border-gray-200'
}

export default function Recipients() {
  const { useUserRecipientService } = useRecipients()
  const { data: recipients, isLoading } = useUserRecipientService()

  console.log('recipients', recipients)

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recipients</h1>
        <p className="text-gray-600">Manage and view all your gift card recipients</p>
      </div>

      {/* Recipients Table */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(recipients?.data) &&
                  recipients.data.map((recipient: RecipientResponse) => (
                    <tr
                      key={recipient.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#402D87] to-[#2d1a72] text-white flex items-center justify-center font-semibold text-sm mr-3">
                            {recipient.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {recipient.name || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">Cart #{recipient.cart_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{recipient.email}</div>
                        <div className="text-xs text-gray-500">{recipient.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(recipient.amount)}
                        </div>
                        <div className="text-xs text-gray-500">Qty: {recipient.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            recipient.status,
                          )}`}
                        >
                          {recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(recipient.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {recipient.message ? (
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-700 truncate" title={recipient.message}>
                              "{recipient.message}"
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No message</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

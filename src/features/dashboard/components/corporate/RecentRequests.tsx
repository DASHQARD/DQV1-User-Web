import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/libs'
import { Text, Tag } from '@/components'
import { ROUTES } from '@/utils/constants'

import { getStatusVariant } from '@/utils/helpers'
import { corporateQueries } from '../../corporate'
import { formatDate } from '@/utils/format'

export default function RecentRequests() {
  const { useGetRequestsCorporateService } = corporateQueries()
  const { data: requestsResponse } = useGetRequestsCorporateService()

  const recentRequests = useMemo(() => {
    if (!requestsResponse) return []
    return Array.isArray(requestsResponse) ? requestsResponse : []
  }, [requestsResponse])

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
      <div className="p-6 pb-0 flex justify-between items-center mb-5">
        <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
          <Icon icon="bi:clipboard-check" className="text-[#402D87] mr-2" />
          Requests
        </h5>

        <Link
          to={`${ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS}?account=vendor`}
          className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
        >
          View all <Icon icon="bi:arrow-right" className="ml-1" />
        </Link>
      </div>

      <div className="px-6 pb-6">
        {recentRequests.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <Icon icon="bi:inbox" className="text-6xl text-[#e9ecef] mb-3" />
            <Text variant="p" className="text-sm text-[#6c757d] m-0">
              No requests to display
            </Text>
          </div>
        ) : (
          <div className="divide-y divide-[#F2F4F7]">
            {recentRequests.map((request: any) => (
              <article
                key={request.id}
                className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                {/* Left: Request ID and Type */}
                <div className="flex-1 min-w-0">
                  <Text variant="span" className="text-sm font-semibold text-gray-900 block mb-1">
                    {request.request_id || `RQ-${request.id}`}
                  </Text>
                  <Text variant="span" className="text-xs text-gray-500 block mb-3">
                    {request.type || 'N/A'}
                  </Text>
                  <Text variant="span" className="text-xs text-gray-400">
                    {formatDate(request?.created_at)}
                  </Text>
                </div>

                {/* Middle: Description and Name */}
                <div className="flex-1 min-w-0 px-4">
                  <Text variant="span" className="text-sm text-gray-900 block mb-1">
                    {request.description || 'No description'}
                  </Text>
                  <Text variant="span" className="text-xs text-gray-500">
                    {request.name || 'Unknown'}
                  </Text>
                </div>

                {/* Right: Status Badge */}
                <div className="shrink-0">
                  <Tag value={request.status} variant={getStatusVariant(request.status)} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

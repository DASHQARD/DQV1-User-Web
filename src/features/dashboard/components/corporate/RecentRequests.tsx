import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/libs'
import { Text, Tag } from '@/components'
import { ROUTES } from '@/utils/constants'
import { MOCK_REQUESTS } from '@/mocks'
import { getStatusVariant } from '@/utils/helpers'
import { formatRelativeTime } from '@/utils/format'

const addAccountParam = (path: string): string => {
  const separator = path?.includes('?') ? '&' : '?'
  return `${path}${separator}account=corporate`
}

function formatRequestType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function RecentRequests() {
  const recentRequests = React.useMemo(() => {
    return MOCK_REQUESTS.slice(0, 4).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
      <div className="p-6 pb-0 flex justify-between items-center mb-5">
        <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
          <Icon icon="bi:clipboard-check" className="text-[#402D87] mr-2" />
          Requests
        </h5>
        <Link
          to={addAccountParam(ROUTES.IN_APP.DASHBOARD.CORPORATE.REQUESTS)}
          className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
        >
          View all <Icon icon="bi:arrow-right" className="ml-1" />
        </Link>
      </div>

      <div className="px-6 pb-6">
        {recentRequests.length === 0 ? (
          <div className="text-center py-10 text-[#6c757d]">
            <Icon icon="bi:inbox" className="text-5xl text-[#e9ecef] mb-4" />
            <p className="m-0 text-sm">No requests to display</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F2F4F7]">
            {recentRequests.map((request) => (
              <article
                key={request.id}
                className="flex flex-wrap items-center gap-4 py-4 text-sm text-[#475467]"
              >
                <div className="flex-1 min-w-[120px]">
                  <Text variant="span" className="text-xs font-medium text-gray-800 block mb-1">
                    {request.id}
                  </Text>
                  <Text variant="span" className="text-xs text-gray-500">
                    {formatRequestType(request.type)}
                  </Text>
                </div>

                <div className="flex-1 min-w-[150px]">
                  <Text variant="span" className="text-xs text-gray-800 block mb-1">
                    {request.product}
                  </Text>
                  <Text variant="span" className="text-xs text-gray-500">
                    {request.requestedBy}
                  </Text>
                </div>

                <div className="min-w-[80px]">
                  <Tag value={request.status} variant={getStatusVariant(request.status)} />
                </div>

                <div className="min-w-[140px] text-right">
                  <Text variant="span" className="text-xs text-gray-400">
                    {formatRelativeTime(request.createdAt)}
                  </Text>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

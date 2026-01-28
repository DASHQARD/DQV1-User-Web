import React from 'react'
import { Link } from 'react-router-dom'
import { Text, Loader } from '@/components'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { ROUTES } from '@/utils/constants'

interface RecentBranchesProps {
  branches: any[]
  isLoading: boolean
  addAccountParam: (path: string) => string
}

export function RecentBranches({ branches, isLoading, addAccountParam }: RecentBranchesProps) {
  // Get recent branches (first 5)
  const recentBranches = React.useMemo(() => {
    return branches.slice(0, 5)
  }, [branches])

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
      <div className="p-6 pb-0 flex justify-between items-center mb-5">
        <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
          <Icon icon="bi:building" className="text-[#402D87] mr-2" /> Branches
          {branches.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">({branches.length})</span>
          )}
        </h5>
        <Link
          to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES)}
          className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
        >
          Manage branches <Icon icon="bi:arrow-right" className="ml-1" />
        </Link>
      </div>
      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader />
          </div>
        ) : recentBranches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Icon icon="bi:building" className="text-4xl mb-2 opacity-50" />
            <p className="text-sm m-0">No branches added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBranches.map((branch: any) => (
              <Link
                key={branch.id}
                to={addAccountParam(`${ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES}/${branch.id}`)}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#402D87]/10 flex items-center justify-center shrink-0">
                    <Icon icon="bi:building" className="text-[#402D87]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text variant="span" weight="semibold" className="text-gray-900 block">
                      {branch.branch_name}
                    </Text>
                    <div className="flex items-center gap-2 mt-1">
                      <Icon icon="bi:geo-alt" className="text-gray-400 text-sm" />
                      <Text variant="span" className="text-gray-500 text-sm truncate">
                        {branch.branch_location}
                      </Text>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {branch.status && (
                    <span
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        branch.status === 'approved' || branch.status === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : branch.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800',
                      )}
                    >
                      {branch.status}
                    </span>
                  )}
                  <Icon
                    icon="bi:chevron-right"
                    className="text-gray-400 group-hover:text-[#402D87] transition-colors"
                  />
                </div>
              </Link>
            ))}
            {branches.length > 5 && (
              <div className="text-center pt-2">
                <Link
                  to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES)}
                  className="text-[#402D87] text-sm font-medium hover:text-[#2d1a72] transition-colors"
                >
                  View all {branches.length} branches
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

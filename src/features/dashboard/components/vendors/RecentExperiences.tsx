import React from 'react'
import { Link } from 'react-router-dom'
import { Text, Loader, EmptyState } from '@/components'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { formatCurrency } from '@/utils/format'
import { EmptyStateImage } from '@/assets/images'

interface RecentExperiencesProps {
  experiences: any[]
  isLoading: boolean
  addAccountParam: (path: string) => string
}

export function RecentExperiences({
  experiences,
  isLoading,
  addAccountParam,
}: RecentExperiencesProps) {
  // Get recent experiences (first 5)
  const recentExperiences = React.useMemo(() => {
    return experiences.slice(0, 5)
  }, [experiences])

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
      <div className="p-6 pb-0 flex justify-between items-center mb-5">
        <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
          <Icon icon="bi:briefcase-fill" className="text-[#402D87] mr-2" /> My Experiences
          {experiences.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">({experiences.length})</span>
          )}
        </h5>
        <Link
          to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE)}
          className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
        >
          View all <Icon icon="bi:arrow-right" className="ml-1" />
        </Link>
      </div>
      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader />
          </div>
        ) : recentExperiences.length === 0 ? (
          <div className="py-8">
            <EmptyState
              image={EmptyStateImage}
              title="No experiences created yet"
              description="Create your first experience to start offering gift cards to customers"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {recentExperiences.map((experience: any) => (
              <Link
                key={experience.id}
                to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE)}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#402D87]/10 flex items-center justify-center shrink-0">
                    <Icon icon="bi:briefcase" className="text-[#402D87]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text variant="span" weight="semibold" className="text-gray-900 block">
                      {experience.product || experience.card_name || 'Experience'}
                    </Text>
                    <div className="flex items-center gap-2 mt-1">
                      <Text variant="span" className="text-gray-500 text-sm">
                        {experience.type || experience.card_type || 'Gift Card'}
                      </Text>
                      {experience.status && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span
                            className={cn(
                              'text-xs font-medium',
                              experience.status === 'approved' || experience.status === 'verified'
                                ? 'text-green-600'
                                : experience.status === 'pending'
                                  ? 'text-yellow-600'
                                  : 'text-gray-600',
                            )}
                          >
                            {experience.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {experience.price && (
                    <Text variant="span" weight="semibold" className="text-[#402D87]">
                      {formatCurrency(Number(experience.price), experience.currency || 'GHS')}
                    </Text>
                  )}
                  <Icon
                    icon="bi:chevron-right"
                    className="text-gray-400 group-hover:text-[#402D87] transition-colors"
                  />
                </div>
              </Link>
            ))}
            {experiences.length > 5 && (
              <div className="text-center pt-2">
                <Link
                  to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE)}
                  className="text-[#402D87] text-sm font-medium hover:text-[#2d1a72] transition-colors"
                >
                  View all {experiences.length} experiences
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

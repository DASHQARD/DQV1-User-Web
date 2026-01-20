import { useState, useMemo } from 'react'
import { CardItems } from '../CardItems'
import { useNavigate } from 'react-router-dom'
import { Loader, Text, EmptyState } from '@/components'
import { usePublicCatalog } from '../../hooks/website'
import { cn } from '@/libs'
import EmptyStateImage from '@/assets/images/empty-state.png'

type TabType = 'dashx' | 'dashpass'

export const FeaturedCards = () => {
  const navigate = useNavigate()
  const { publicCards, isLoading } = usePublicCatalog()
  const [activeTab, setActiveTab] = useState<TabType>('dashx')

  // Tab options
  const tabOptions = [
    { value: 'dashx', label: 'DashX' },
    { value: 'dashpass', label: 'DashPass' },
  ]

  // Filter cards based on active tab and limit to 4
  const filteredCards = useMemo(() => {
    if (!publicCards) return []
    const normalizedTargetType = activeTab.toLowerCase()

    return publicCards
      .filter((card: any) => {
        const cardType = card.type?.toString().toLowerCase().trim() || ''

        return cardType === normalizedTargetType
      })
      .slice(0, 4)
  }, [publicCards, activeTab])

  return (
    <section className="py-8 md:py-12">
      <div className="wrapper flex flex-col gap-4 bg-white rounded-2xl">
        <div className="flex flex-col gap-4">
          <div className="px-4 md:px-6 pt-4 md:pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Text variant="h3" weight="medium" className="text-gray-900">
              Featured Cards
            </Text>
            <button
              onClick={() => navigate('/dashqards')}
              className="text-sm font-medium text-[#014fd3] hover:underline whitespace-nowrap"
            >
              See more
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 md:px-6 pt-4">
          <div className="inline-flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
            {tabOptions.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as TabType)}
                className={cn(
                  'px-4 md:px-6 py-2 text-sm md:text-base font-medium rounded-md transition-all whitespace-nowrap',
                  activeTab === tab.value
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 md:px-6 pb-4 md:pb-6 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : filteredCards.length === 0 ? (
            <EmptyState
              image={EmptyStateImage}
              title={`No ${activeTab === 'dashx' ? 'DashX' : 'DashPass'} cards available`}
              description="Check back soon for new cards or browse our full collection."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCards.map((card: any, index: number) => {
                // Create unique key by combining card_id with branch info or index
                const uniqueKey = `${card.card_id || card.id}-${card.branch_name || card.branch_id || index}`
                return <CardItems key={uniqueKey} {...card} />
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

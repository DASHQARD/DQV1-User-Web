import { useLocation } from 'react-router-dom'
import { Button, Text, TabbedView } from '@/components'
import {
  PurchaseDetails,
  BulkPurchaseEmployeesModal,
  IndividualPurchaseModal,
} from '@/features/dashboard/components'
import { Icon } from '@/libs'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'

import { usePurchaseManagement } from '@/features/dashboard/hooks'

export default function Purchase() {
  const { purchaseTabConfig } = usePurchaseManagement()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const currentTab = searchParams.get('tab') || 'individual'

  const bulkPurchaseModal = usePersistedModalState({
    paramName: MODALS.BULK_EMPLOYEE_PURCHASE.PARAM_NAME,
  })

  const individualPurchaseModal = usePersistedModalState({
    paramName: MODALS.PURCHASE.INDIVIDUAL.ROOT,
  })

  const handleIndividualPurchase = () => {
    individualPurchaseModal.openModal(MODALS.PURCHASE.INDIVIDUAL.CREATE)
  }

  const handleBulkPurchase = () => {
    bulkPurchaseModal.openModal(MODALS.BULK_EMPLOYEE_PURCHASE.CHILDREN.CREATE)
  }

  return (
    <>
      <div className="py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Purchases
            </Text>
            <div className="flex items-center gap-3">
              <Button
                variant={currentTab === 'individual' ? 'primary' : 'outline'}
                size="medium"
                onClick={handleIndividualPurchase}
                className="flex items-center gap-2"
              >
                <Icon icon="bi:person-fill" className="w-4 h-4" />
                Individual Purchase
              </Button>
              <Button
                variant={currentTab === 'bulk' ? 'secondary' : 'outline'}
                size="medium"
                onClick={handleBulkPurchase}
                className="flex items-center gap-2"
              >
                <Icon icon="bi:people-fill" className="w-4 h-4" />
                Bulk Purchase
              </Button>
            </div>
          </div>

          <TabbedView
            tabs={purchaseTabConfig}
            defaultTab="individual"
            urlParam="tab"
            containerClassName="space-y-6"
            btnClassName="pb-2"
            tabsClassName="gap-2 border-b border-gray-200"
          />
        </div>
      </div>

      <PurchaseDetails />
      <BulkPurchaseEmployeesModal modal={bulkPurchaseModal} />
      <IndividualPurchaseModal />
    </>
  )
}

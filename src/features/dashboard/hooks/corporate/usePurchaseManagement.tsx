import { usePersistedModalState, useReducerSpread } from '@/hooks'
import { useAuthStore } from '@/stores'
import { DEFAULT_QUERY, MODALS } from '@/utils/constants'
import { PastPurchase } from '../../components/corporate/purchase'

export function usePurchaseManagement() {
  const [query, setQuery] = useReducerSpread(DEFAULT_QUERY)
  const user = useAuthStore().user

  const purchaseModal = usePersistedModalState({
    paramName: MODALS.PURCHASE.PARAM_NAME,
  })

  const purchaseTabConfig = [
    {
      key: 'past' as const,
      label: 'Past Purchases',
      component: PastPurchase,
    },
  ]

  function getPurchaseOptions(
    purchase: any,
    option: {
      hasView?: boolean
      hasUpdate?: boolean
      hasDelete?: boolean
    },
  ) {
    if (!purchase) return []
    const baseOptions = []

    const viewOption = [
      {
        label: 'View',
        onClickFn: () => purchaseModal.openModal(MODALS.PURCHASE.CHILDREN.VIEW, purchase),
      },
    ]

    const editOption = {
      label: 'Edit',
      onClickFn: () => {
        // TODO: Implement edit purchase functionality
        console.log('Edit purchase:', purchase)
      },
    }

    const deleteOption = {
      label: 'Delete',
      onClickFn: () => {
        // TODO: Implement delete purchase functionality
        console.log('Delete purchase:', purchase)
      },
    }

    if (option?.hasView) {
      baseOptions.push(...viewOption)
    }

    if (option?.hasUpdate) {
      baseOptions.push(editOption)
    }

    if (option?.hasDelete) {
      baseOptions.push(deleteOption)
    }

    return baseOptions
  }

  return {
    purchaseModal,
    query,
    setQuery,
    purchaseTabConfig,
    getPurchaseOptions,
    user,
  }
}

import { Button, Checkbox, Input, Text } from '@/components'
import { Icon } from '@/libs'
import { useForm } from 'react-hook-form'
import React from 'react'
import { usePublicCatalogMutations } from '../../hooks/website/usePublicCatalogMutations'
import { useToast } from '@/hooks'

interface PublicDashGoFormProps {
  vendorName: string
  vendorDetails: any
  availableBranches: any[]
  quickAmounts: number[]
  selectedAmount: string
  vendor_id: string
}

export default function PublicDashGoForm({
  vendorName,
  vendorDetails,
  availableBranches,

  quickAmounts,
  selectedAmount,

  vendor_id,
}: PublicDashGoFormProps) {
  const { useCreateDashGoAndAssignService } = usePublicCatalogMutations()
  const createDashGoMutation = useCreateDashGoAndAssignService()
  const { error } = useToast()

  const form = useForm<{ amount: string }>({
    defaultValues: {
      amount: '100',
    },
  })

  // State for selected branches
  const [selectedBranchIds, setSelectedBranchIds] = React.useState<Set<number>>(
    new Set(availableBranches.map((branch: { branch_id: number }) => branch.branch_id)),
  )

  // Update selected branches when available branches change
  React.useEffect(() => {
    if (availableBranches.length > 0) {
      setSelectedBranchIds(
        new Set(availableBranches.map((branch: { branch_id: number }) => branch.branch_id)),
      )
    }
  }, [availableBranches])

  const handleBranchToggle = (branchId: number) => {
    setSelectedBranchIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(branchId)) {
        newSet.delete(branchId)
      } else {
        newSet.add(branchId)
      }
      return newSet
    })
  }

  const onSubmit = async (data: { amount: string }) => {
    const cardAmount = parseFloat(data.amount)
    if (isNaN(cardAmount) || cardAmount <= 0) {
      return
    }

    if (!vendor_id) {
      return
    }

    // Validate that at least one branch is selected
    if (selectedBranchIds.size === 0) {
      error('Please select at least one redemption branch')
      return
    }

    const redemptionBranches = Array.from(selectedBranchIds).map((branchId) => ({
      branch_id: branchId,
    }))

    createDashGoMutation.mutate({
      recipient_ids: [],
      vendor_id: parseInt(vendor_id, 10),
      product: 'DashGo Gift Card',
      description: `Custom DashGo card for ${vendorName}`,
      price: cardAmount,
      currency: 'GHS',
      issue_date: new Date().toISOString().split('T')[0],
      redemption_branches: redemptionBranches,
    })
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col gap-1">
        <Text variant="h1" className="capitalize">
          DashGo Gift Qard
        </Text>
        <Text variant="p" className="text-grey-500">
          Vendor: {vendorName}
        </Text>
        <div className="flex items-center gap-1">
          <Icon icon="bi:geo-alt-fill" className="size-4 text-grey-500" />
          <Text variant="p" className="text-grey-500">
            {(vendorDetails as any)?.business_country ||
              (vendorDetails as any)?.business_address ||
              'Location not available'}
          </Text>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Text variant="h2" className="capitalize">
          Description
        </Text>
        <Text variant="p" className="text-grey-600 leading-relaxed">
          Create a custom DashGo gift card with your desired amount for {vendorName}. Use this card
          at {vendorName} locations.
        </Text>
      </div>

      {/* Amount Input */}
      <div>
        <Text variant="h3" weight="bold" className="text-gray-900 mb-4">
          Select Amount
        </Text>

        {/* Quick Selection Buttons */}
        <div className="flex gap-3 mb-4 flex-wrap">
          {quickAmounts.map((amount) => {
            const isSelected = parseFloat(selectedAmount || '0') === amount
            return (
              <button
                key={amount}
                type="button"
                onClick={() => form.setValue('amount', amount.toString())}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isSelected
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300'
                }`}
              >
                GHS {amount.toLocaleString()}
              </button>
            )
          })}
        </div>

        {/* Amount Input Field */}

        <Input
          type="number"
          step="0.01"
          min="1"
          max="10000"
          prefix={
            <span className="pointer-events-none font-bold text-primary-500 text-lg">GHS</span>
          }
          {...form.register('amount', {
            required: 'Amount is required',
            validate: (value) => {
              const numValue = parseFloat(value)
              if (isNaN(numValue) || numValue <= 0) {
                return 'Please enter a valid amount greater than 0'
              }
              if (numValue > 10000) {
                return `Maximum amount is GHS 10000`
              }
              return true
            },
          })}
          placeholder="0.00"
          innerClassName="h-[56px]!"
          error={form.formState.errors.amount?.message}
        />

        <p className="mt-2 text-sm text-gray-500">Maximum amount: GHS 10000</p>
      </div>

      {/* Redemption Branches Selection */}
      {availableBranches.length > 0 && (
        <div>
          <Text variant="h3" weight="bold" className="text-gray-900 mb-4">
            Select Redemption Branches
          </Text>
          <Text variant="p" className="text-gray-600 mb-4 text-sm">
            Choose the branches where this DashGo card can be redeemed
          </Text>
          <div className="space-y-3 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
            {availableBranches.map(
              (branch: { branch_id: number; branch_name: string; branch_location: string }) => {
                const isSelected = selectedBranchIds.has(branch.branch_id)
                return (
                  <div
                    key={branch.branch_id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleBranchToggle(branch.branch_id)}
                      label=""
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Text variant="span" weight="semibold" className="text-gray-900 block">
                        {branch.branch_name}
                      </Text>
                      {branch.branch_location && (
                        <div className="flex items-center gap-1 mt-1">
                          <Icon icon="bi:geo-alt-fill" className="size-3 text-gray-500" />
                          <Text variant="span" className="text-gray-600 text-sm">
                            {branch.branch_location}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                )
              },
            )}
          </div>
          {selectedBranchIds.size === 0 && (
            <p className="mt-2 text-sm text-red-500">Please select at least one branch</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="secondary"
          type="submit"
          disabled={
            !form.watch('amount') ||
            parseFloat(form.watch('amount') || '0') <= 0 ||
            createDashGoMutation.isPending ||
            !vendor_id ||
            selectedBranchIds.size === 0
          }
          loading={createDashGoMutation.isPending}
          className="flex-1"
        >
          <Icon icon="bi:cart-plus" className="size-5 mr-2" />
          Add to Cart
        </Button>
      </div>
    </form>
  )
}

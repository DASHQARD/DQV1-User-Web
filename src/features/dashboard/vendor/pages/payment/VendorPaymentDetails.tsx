import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Text } from '@/components'
import { Icon } from '@/libs'
import { useCountriesData, useUserProfile, useToast } from '@/hooks'
import { VendorAccountStatusBanner } from '@/features/dashboard/components/vendors/VendorAccountStatusBanner'
import { useVendorOnboardingProgress } from '@/features/dashboard/hooks/useVendorOnboardingProgress'
import {
  canFetchVendorPaymentDetails,
  canManageVendorPaymentDetails,
  hasVendorPaymentDetails,
  isVendorPendingAdminApproval,
} from '@/features/dashboard/utils/vendorAccountStatus'
import {
  addPaymentDetails,
  getPaymentDetails,
  updatePaymentDetails,
  deletePaymentDetails,
} from '@/features/dashboard/corporate/services'
import { PaymentDetailsModals } from '@/features/dashboard/corporate/pages/paymentDetails/PaymentDetailsModals'
import BranchPaymentDetails from './BranchPaymentDetails'

export default function VendorPaymentDetails() {
  const { success, error } = useToast()
  const queryClient = useQueryClient()
  const { useGetUserProfileService } = useUserProfile()
  const { countries } = useCountriesData()
  const { data: userProfile } = useGetUserProfileService()

  if (userProfile?.user_type === 'branch') {
    return <BranchPaymentDetails />
  }

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false)
  const [addForm, setAddForm] = useState({
    payment_method: 'mobile_money',
    mobile_money_provider: 'mtn',
    mobile_money_number: '',
    bank_name: '',
    branch: '',
    account_name: '',
    account_number: '',
    swift_code: '',
    sort_code: '',
  })
  const [editForm, setEditForm] = useState({
    payment_method: 'mobile_money',
    mobile_money_provider: 'mtn',
    mobile_money_number: '',
    bank_name: 'string',
    branch: 'string',
    account_name: 'string',
    account_number: '0000000000',
    swift_code: 'string',
    sort_code: 'string',
  })

  const { isComplete: isOnboardingComplete } = useVendorOnboardingProgress()
  const hasExistingPaymentDetails = hasVendorPaymentDetails(userProfile)
  const canFetchPaymentDetails = canFetchVendorPaymentDetails(userProfile)
  const canManagePaymentDetails = canManageVendorPaymentDetails(userProfile)
  const showPendingApprovalBanner = isVendorPendingAdminApproval(
    userProfile,
    isOnboardingComplete,
  )

  const { data: myPaymentDetails, isLoading: isLoadingMyPaymentDetails } = useQuery({
    queryKey: ['vendor-payment-details'],
    queryFn: getPaymentDetails,
    enabled: userProfile?.user_type !== 'branch' && canFetchPaymentDetails,
  })
  const paymentDetailsData = myPaymentDetails?.data || myPaymentDetails || {}
  const mobileMoneyAccounts = Array.isArray(paymentDetailsData?.mobile_money_accounts)
    ? paymentDetailsData.mobile_money_accounts
    : []
  const bankAccounts = Array.isArray(paymentDetailsData?.bank_accounts)
    ? paymentDetailsData.bank_accounts
    : []

  const addPaymentMutation = useMutation({
    mutationFn: (payload: any) => addPaymentDetails(payload),
    onSuccess: (response) => {
      success(response?.message || 'Payment details added successfully')
      queryClient.invalidateQueries({ queryKey: ['vendor-payment-details'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
    onError: (err: any) => error(err?.message || 'Failed to add payment details'),
  })

  const updatePaymentMutation = useMutation({
    mutationFn: (payload: any) => updatePaymentDetails(payload),
    onSuccess: (response) => {
      success(response?.message || 'Payment details updated successfully')
      queryClient.invalidateQueries({ queryKey: ['vendor-payment-details'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
    onError: (err: any) => error(err?.message || 'Failed to update payment details'),
  })

  const deletePaymentMutation = useMutation({
    mutationFn: () => deletePaymentDetails(),
    onSuccess: (response) => {
      success(response?.message || 'Payment details deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['vendor-payment-details'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
    onError: (err: any) => error(err?.message || 'Failed to delete payment details'),
  })

  const handleSubmitAddPaymentDetails = () => {
    const payload =
      addForm.payment_method === 'mobile_money'
        ? {
            payment_method: 'mobile_money',
            mobile_money_provider: addForm.mobile_money_provider,
            mobile_money_number: addForm.mobile_money_number,
          }
        : {
            payment_method: 'bank',
            bank_name: addForm.bank_name,
            branch: addForm.branch,
            account_name: addForm.account_name,
            account_number: addForm.account_number,
            swift_code: addForm.swift_code,
            sort_code: addForm.sort_code,
          }

    addPaymentMutation.mutate(payload, {
      onSuccess: () => {
        setIsAddModalOpen(false)
      },
    })
  }

  const openEditPaymentModal = (type: 'mobile_money' | 'bank', account: any) => {
    setEditForm({
      payment_method: type,
      mobile_money_provider: account?.provider || account?.mobile_money_provider || 'mtn',
      mobile_money_number: account?.momo_number || account?.mobile_money_number || '',
      bank_name: account?.bank_name || 'string',
      branch: account?.bank_branch || account?.branch || 'string',
      account_name: account?.account_holder_name || account?.account_name || 'string',
      account_number: account?.account_number || '0000000000',
      swift_code: account?.swift_code || 'string',
      sort_code: account?.sort_code || 'string',
    })
    setIsEditModalOpen(true)
  }

  const handleSubmitEditPaymentDetails = () => {
    updatePaymentMutation.mutate(
      {
        payment_method: editForm.payment_method,
        mobile_money_provider: editForm.mobile_money_provider,
        mobile_money_number: editForm.mobile_money_number,
        bank_name: editForm.bank_name,
        branch: editForm.branch,
        account_name: editForm.account_name,
        account_number: editForm.account_number,
        swift_code: editForm.swift_code,
        sort_code: editForm.sort_code,
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false)
        },
      },
    )
  }

  const formatFieldLabel = (value: string) =>
    value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

  const handleDeleteAllPaymentDetails = () =>
    deletePaymentMutation.mutate(undefined, {
      onSuccess: () => setIsDeleteAllModalOpen(false),
    })

  return (
    <div className="lg:py-10 space-y-8">
      <Text variant="h2" weight="semibold" className="text-primary-900">
        Payment Details
      </Text>

      {showPendingApprovalBanner && (
        <VendorAccountStatusBanner
          status={userProfile?.status}
          hasRemainingSetupSteps={!isOnboardingComplete}
        />
      )}

      {!canManagePaymentDetails && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Payment details can be added after DashQard verifies your vendor account. Complete your
          compliance steps and wait for admin approval before setting up payouts.
        </div>
      )}

      {hasExistingPaymentDetails && !canFetchPaymentDetails && canManagePaymentDetails && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Payment details are saved on your profile. Full payout management will be available after
          a DashQard administrator approves your account.
        </div>
      )}
      {canManagePaymentDetails && (
        <div className="flex justify-end">
          <div className="flex items-center gap-3">
            {canFetchPaymentDetails && (
              <Button variant="danger" onClick={() => setIsDeleteAllModalOpen(true)}>
                Delete All Payment Methods
              </Button>
            )}
            <Button variant="secondary" onClick={() => setIsAddModalOpen(true)}>
              Add Payment Details
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <Text variant="h6" weight="medium">
          Current Payment Details
        </Text>
        {isLoadingMyPaymentDetails ? (
          <Text variant="span">Loading payment details...</Text>
        ) : mobileMoneyAccounts.length === 0 && bankAccounts.length === 0 ? (
          <Text variant="span" className="text-gray-600">
            No payment details found for this account.
          </Text>
        ) : (
          <div className="space-y-6">
            <div>
              <Text variant="span" weight="semibold" className="block mb-2">
                Mobile Money Accounts ({mobileMoneyAccounts.length})
              </Text>
              {mobileMoneyAccounts.length === 0 ? (
                <Text variant="span" className="text-sm text-gray-500">
                  No mobile money accounts.
                </Text>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mobileMoneyAccounts.map((account: any, index: number) => (
                    <div
                      key={String(account.id ?? index)}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50 relative"
                    >
                      <button
                        type="button"
                        onClick={() => openEditPaymentModal('mobile_money', account)}
                        disabled={!canManagePaymentDetails}
                        className="absolute top-2 right-2 text-gray-500 hover:text-primary-900 transition-colors disabled:hidden"
                        aria-label="Update payment details"
                      >
                        <Icon icon="bi:three-dots-vertical" className="text-base" />
                      </button>
                      <Text variant="span" className="block text-sm">
                        <strong>Provider:</strong>{' '}
                        {account.provider || account.mobile_money_provider || '-'}
                      </Text>
                      <Text variant="span" className="block text-sm">
                        <strong>Number:</strong>{' '}
                        {account.momo_number || account.mobile_money_number || '-'}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Text variant="span" weight="semibold" className="block mb-2">
                Bank Accounts ({bankAccounts.length})
              </Text>
              {bankAccounts.length === 0 ? (
                <Text variant="span" className="text-sm text-gray-500">
                  No bank accounts.
                </Text>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bankAccounts.map((account: any, index: number) => (
                    <div
                      key={String(account.id ?? index)}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50 relative"
                    >
                      <button
                        type="button"
                        onClick={() => openEditPaymentModal('bank', account)}
                        disabled={!canManagePaymentDetails}
                        className="absolute top-2 right-2 text-gray-500 hover:text-primary-900 transition-colors disabled:hidden"
                        aria-label="Update payment details"
                      >
                        <Icon icon="bi:three-dots-vertical" className="text-base" />
                      </button>
                      <Text variant="span" className="block text-sm">
                        <strong>Bank:</strong> {account.bank_name || '-'}
                      </Text>
                      <Text variant="span" className="block text-sm">
                        <strong>Account Name:</strong>{' '}
                        {account.account_holder_name || account.account_name || '-'}
                      </Text>
                      <Text variant="span" className="block text-sm">
                        <strong>Account Number:</strong> {account.account_number || '-'}
                      </Text>
                      <Text variant="span" className="block text-sm">
                        <strong>Branch:</strong> {account.bank_branch || account.branch || '-'}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <PaymentDetailsModals
        countries={countries}
        formatFieldLabel={formatFieldLabel}
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        addForm={addForm}
        setAddForm={setAddForm}
        handleSubmitAddPaymentDetails={handleSubmitAddPaymentDetails}
        isAdding={addPaymentMutation.isPending}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        handleSubmitEditPaymentDetails={handleSubmitEditPaymentDetails}
        isUpdating={updatePaymentMutation.isPending}
        isDeleteAllModalOpen={isDeleteAllModalOpen}
        setIsDeleteAllModalOpen={setIsDeleteAllModalOpen}
        handleDeleteAll={handleDeleteAllPaymentDetails}
        isDeleting={deletePaymentMutation.isPending}
      />
    </div>
  )
}

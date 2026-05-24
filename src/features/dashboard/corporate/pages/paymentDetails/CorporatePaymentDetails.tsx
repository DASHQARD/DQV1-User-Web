import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { Button, Text } from '@/components'
import { Icon } from '@/libs'
import { useCountriesData, useUserProfile, useToast } from '@/hooks'
import { hasVendorPaymentDetails } from '@/features/dashboard/utils/vendorOnboardingProgress'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'
import { ROUTES } from '@/utils/constants'
import { addPaymentDetails, getPaymentDetails, deletePaymentDetails } from '../../services'
import { PaymentDetailsModals } from './PaymentDetailsModals'

export function CorporatePaymentDetails() {
  const { success, error } = useToast()
  const queryClient = useQueryClient()
  const { useGetUserProfileService } = useUserProfile()
  const { countries } = useCountriesData()
  const { data: userProfile } = useGetUserProfileService()
  const { useUpdatePaymentDetailsService } = corporateMutations()
  const { mutateAsync: submitPaymentDetailsUpdateRequest, isPending: isUpdating } =
    useUpdatePaymentDetailsService()
  const isCorporateSuperAdmin = userProfile?.user_type === 'corporate super admin'

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

  const hasExistingPaymentDetails = hasVendorPaymentDetails(userProfile)

  const { data: myPaymentDetails, isLoading: isLoadingMyPaymentDetails } = useQuery({
    queryKey: ['corp-admin-payment-details'],
    queryFn: getPaymentDetails,
    enabled: isCorporateSuperAdmin && hasExistingPaymentDetails,
  })
  const paymentDetailsData = myPaymentDetails?.data || myPaymentDetails || {}
  const mobileMoneyAccounts = Array.isArray(paymentDetailsData?.mobile_money_accounts)
    ? paymentDetailsData.mobile_money_accounts
    : []
  const bankAccounts = Array.isArray(paymentDetailsData?.bank_accounts)
    ? paymentDetailsData.bank_accounts
    : []

  const addPaymentMutation = useMutation({
    mutationFn: (payload: Parameters<typeof addPaymentDetails>[0]) => addPaymentDetails(payload),
    onSuccess: (response) => {
      success(response?.message || 'Payment details added successfully')
      queryClient.invalidateQueries({ queryKey: ['corp-admin-payment-details'] })
    },
    onError: (err: { message?: string }) => error(err?.message || 'Failed to add payment details'),
  })

  const deletePaymentMutation = useMutation({
    mutationFn: () => deletePaymentDetails(),
    onSuccess: (response) => {
      success(response?.message || 'Payment details deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['corp-admin-payment-details'] })
    },
    onError: (err: { message?: string }) =>
      error(err?.message || 'Failed to delete payment details'),
  })

  if (!isCorporateSuperAdmin) {
    return <Navigate to={`${ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME}?account=corporate`} replace />
  }

  const handleSubmitAddPaymentDetails = () => {
    const payload =
      addForm.payment_method === 'mobile_money'
        ? {
            payment_method: 'mobile_money' as const,
            mobile_money_provider: addForm.mobile_money_provider,
            mobile_money_number: addForm.mobile_money_number,
          }
        : {
            payment_method: 'bank' as const,
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

  const openEditPaymentModal = (type: 'mobile_money' | 'bank', account: Record<string, unknown>) => {
    setEditForm({
      payment_method: type,
      mobile_money_provider: String(
        account?.provider || account?.mobile_money_provider || 'mtn',
      ),
      mobile_money_number: String(account?.momo_number || account?.mobile_money_number || ''),
      bank_name: String(account?.bank_name || ''),
      branch: String(account?.bank_branch || account?.branch || ''),
      account_name: String(account?.account_holder_name || account?.account_name || ''),
      account_number: String(account?.account_number || ''),
      swift_code: String(account?.swift_code || ''),
      sort_code: String(account?.sort_code || ''),
    })
    setIsEditModalOpen(true)
  }

  const handleSubmitEditPaymentDetails = async () => {
    try {
      await submitPaymentDetailsUpdateRequest({
        payment_method: editForm.payment_method as 'mobile_money' | 'bank',
        mobile_money_provider: editForm.mobile_money_provider,
        mobile_money_number: editForm.mobile_money_number,
        bank_name: editForm.bank_name,
        branch: editForm.branch,
        account_name: editForm.account_name,
        account_number: editForm.account_number,
        swift_code: editForm.swift_code,
        sort_code: editForm.sort_code,
      })
      setIsEditModalOpen(false)
    } catch {
      // Toast handled by mutation hook
    }
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
        Corporate Payment Details (Super Admin)
      </Text>

      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3">
        <Icon icon="bi:info-circle" className="text-amber-600 text-xl shrink-0 mt-0.5" />
        <div>
          <Text variant="span" weight="semibold" className="text-amber-900 block mb-1">
            Payment updates require admin approval
          </Text>
          <Text variant="p" className="text-amber-800/90 text-sm">
            Changes to existing payment details are submitted as a request. A platform admin must
            approve them before they take effect.
          </Text>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="flex items-center gap-3">
          <Button variant="danger" onClick={() => setIsDeleteAllModalOpen(true)}>
            Delete All Payment Methods
          </Button>
          <Button variant="secondary" onClick={() => setIsAddModalOpen(true)}>
            Add Payment Details
          </Button>
        </div>
      </div>

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
                  {mobileMoneyAccounts.map((account: Record<string, unknown>, index: number) => (
                    <div
                      key={String(account.id ?? index)}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50 relative"
                    >
                      <button
                        type="button"
                        onClick={() => openEditPaymentModal('mobile_money', account)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-primary-900 transition-colors"
                        aria-label="Request payment details update"
                      >
                        <Icon icon="bi:three-dots-vertical" className="text-base" />
                      </button>
                      <Text variant="span" className="block text-sm">
                        <strong>Provider:</strong>{' '}
                        {String(account.provider || account.mobile_money_provider || '-')}
                      </Text>
                      <Text variant="span" className="block text-sm">
                        <strong>Number:</strong>{' '}
                        {String(account.momo_number || account.mobile_money_number || '-')}
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
                  {bankAccounts.map((account: Record<string, unknown>, index: number) => (
                    <div
                      key={String(account.id ?? index)}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50 relative"
                    >
                      <button
                        type="button"
                        onClick={() => openEditPaymentModal('bank', account)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-primary-900 transition-colors"
                        aria-label="Request payment details update"
                      >
                        <Icon icon="bi:three-dots-vertical" className="text-base" />
                      </button>
                      <Text variant="span" className="block text-sm">
                        <strong>Bank:</strong> {String(account.bank_name || '-')}
                      </Text>
                      <Text variant="span" className="block text-sm">
                        <strong>Account Name:</strong>{' '}
                        {String(account.account_holder_name || account.account_name || '-')}
                      </Text>
                      <Text variant="span" className="block text-sm">
                        <strong>Account Number:</strong> {String(account.account_number || '-')}
                      </Text>
                      <Text variant="span" className="block text-sm">
                        <strong>Branch:</strong>{' '}
                        {String(account.bank_branch || account.branch || '-')}
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
        isUpdating={isUpdating}
        isDeleteAllModalOpen={isDeleteAllModalOpen}
        setIsDeleteAllModalOpen={setIsDeleteAllModalOpen}
        handleDeleteAll={handleDeleteAllPaymentDetails}
        isDeleting={deletePaymentMutation.isPending}
      />
    </div>
  )
}

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Text, Button, Dropdown, Tag, EmptyState, Input, Modal } from '@/components'
import { Icon, cn } from '@/libs'
import {
  RedemptionDetails,
  BranchDetailsModal,
  ViewExperience,
  UpdateBranchStatusModal,
  UpdateBranchManagerDetailsModal,
  DeleteBranchModal,
  DeleteBranchPaymentDetailsModal,
  BranchMetricsCards,
} from '@/features/dashboard/components'
import { ROUTES, MODALS } from '@/utils/constants'
import LoaderGif from '@/assets/gifs/loader.gif'
import { getStatusVariant } from '@/utils/helpers/common'
import EmptyStateImage from '@/assets/images/empty-state.png'
import { formatCurrency, formatDate } from '@/utils/format'
import { StatusCell } from '@/components'
import { getImageUrl, getCardBackground, getCardTypeName } from '@/utils/cardDisplay'
import { useToast } from '@/hooks'
import {
  getPaymentDetailsByBranchId,
  updateBranchPaymentDetails,
  deleteVendorBranchPaymentDetails,
} from '@/features/dashboard/corporate/services'
import { useBranchDetails } from './useBranchDetails'

export function BranchDetails() {
  const { success, error } = useToast()
  const {
    branchModal,
    experienceModal,
    branchStatusModal,
    branches,
    experiences,
    recentRedemptions,
    branchSummary,
    isLoading,
    isError,
    errorMessage,
    isLoadingRedemptions,
    isLoadingCorporateBranchSummary,
    goToBranches,
  } = useBranchDetails()
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false)
  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] = useState(false)
  const branchId = branches?.id || branches?.branch_id
  const [updateForm, setUpdateForm] = useState({
    payment_method: 'mobile_money',
    mobile_money_provider: '',
    mobile_money_number: '',
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    bank_branch: '',
    swift_code: '',
    sort_code: '',
  })

  const { data: branchPaymentDetailsResponse, isLoading: isLoadingBranchPaymentDetails } = useQuery(
    {
      queryKey: ['branch-payment-details-view', branchId],
      queryFn: () => getPaymentDetailsByBranchId(branchId),
      enabled: !!branchId,
    },
  )
  const branchPaymentDetails =
    branchPaymentDetailsResponse?.data || branchPaymentDetailsResponse || {}
  const branchMobileMoneyAccounts = Array.isArray(branchPaymentDetails?.mobile_money_accounts)
    ? branchPaymentDetails.mobile_money_accounts
    : []
  const branchBankAccounts = Array.isArray(branchPaymentDetails?.bank_accounts)
    ? branchPaymentDetails.bank_accounts
    : []

  const updateBranchMutation = useMutation({
    mutationFn: (payload: any) => updateBranchPaymentDetails(payload),
    onSuccess: (response: any) => {
      success(response?.message || 'Branch payment details updated successfully')
    },
    onError: (err: any) => error(err?.message || 'Failed to update branch payment details'),
  })

  const deleteBranchMutation = useMutation({
    mutationFn: (id: string) => deleteVendorBranchPaymentDetails(id),
    onSuccess: (response: any) => {
      success(response?.message || 'Branch payment details deleted successfully')
    },
    onError: (err: any) => error(err?.message || 'Failed to delete branch payment details'),
  })
  const openEditPaymentModal = () => {
    const mobile = branchMobileMoneyAccounts[0] || {}
    const bank = branchBankAccounts[0] || {}
    const paymentMethod =
      mobile?.momo_number || mobile?.mobile_money_number ? 'mobile_money' : 'bank'
    setUpdateForm({
      payment_method: paymentMethod,
      mobile_money_provider: mobile.provider || mobile.mobile_money_provider || '',
      mobile_money_number: mobile.momo_number || mobile.mobile_money_number || '',
      bank_name: bank.bank_name || '',
      account_holder_name: bank.account_holder_name || bank.account_name || '',
      account_number: bank.account_number || '',
      bank_branch: bank.bank_branch || bank.branch || '',
      swift_code: bank.swift_code || '',
      sort_code: bank.sort_code || '',
    })
    setIsEditPaymentModalOpen(true)
  }

  const openDeletePaymentModal = () => {
    setIsDeletePaymentModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <img src={LoaderGif} alt="loading" className="w-10 h-10" />
      </div>
    )
  }

  if (isError || !branches) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <Icon icon="bi:exclamation-circle" className="text-4xl text-red-500" />
        <Text variant="h3" className="text-gray-700">
          {errorMessage}
        </Text>
        <Button variant="secondary" onClick={goToBranches}>
          Back to Branches
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="md:py-10 space-y-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div className="flex-1">
            <button
              onClick={goToBranches}
              className="flex items-center gap-1 text-gray-500 text-xs cursor-pointer"
            >
              <Icon icon="hugeicons:arrow-left-01" className="text-primary-900" />
              Back to Branches
            </button>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <h2 className="text-2xl font-semibold text-primary-900">
                {branches?.branch_name || 'Branch Details'}
              </h2>
              {branches?.status && (
                <Tag
                  value={branches.status}
                  variant={getStatusVariant(branches.status) as any}
                  className={cn(branches.status === 'pending' && 'animate-pulse')}
                />
              )}
              {branches?.status === 'pending' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Icon icon="bi:clock-history" className="text-yellow-600 text-sm" />
                  <Text variant="span" className="text-xs font-medium text-yellow-800">
                    Pending Approval
                  </Text>
                </div>
              )}
            </div>
            {branches?.branch_location && (
              <Text variant="span" className="text-sm text-gray-600 mt-1 block">
                {branches.branch_location}
              </Text>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Dropdown
              actions={[
                ...(branches?.user_id
                  ? [
                      {
                        label: 'Update Branch Manager Details',
                        onClickFn: () => {
                          branchStatusModal.openModal(
                            MODALS.BRANCH.UPDATE_MANAGER_DETAILS,
                            branches,
                          )
                        },
                      },
                    ]
                  : []),
                {
                  label: 'Update Status',
                  onClickFn: () => {
                    branchStatusModal.openModal(MODALS.BRANCH.UPDATE_STATUS, branches)
                  },
                },
                // {
                //   label: 'Delete Branch',
                //   onClickFn: () => {
                //     branchStatusModal.openModal(MODALS.BRANCH.DELETE, branches)
                //   },
                // },
              ]}
            >
              <Button variant="outline" size="medium" className="rounded-full">
                <Icon icon="hugeicons:more-vertical" className="mr-2" />
                Actions
              </Button>
            </Dropdown>
            <Button
              variant="secondary"
              size="medium"
              onClick={() => branchModal.openModal(MODALS.BRANCH.VIEW, branches || undefined)}
              className="rounded-full"
            >
              View Branch Details
            </Button>
          </div>
        </div>

        <BranchMetricsCards
          summary={branchSummary}
          isLoading={isLoadingRedemptions || isLoadingCorporateBranchSummary}
        />

        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
          <div className="p-6 pb-0 flex justify-between items-center mb-5">
            <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
              <Icon icon="bi:arrow-left-right" className="text-[#402D87] mr-2" /> Recent Redemptions
            </h5>
            <Link
              to={`${ROUTES.IN_APP.DASHBOARD.VENDOR.REDEMPTIONS}?account=vendor`}
              className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
            >
              View all <Icon icon="bi:arrow-right" className="ml-1" />
            </Link>
          </div>
          <div className="px-6 pb-6">
            {isLoadingRedemptions ? (
              <div className="flex items-center justify-center py-8">
                <img src={LoaderGif} alt="Loading..." className="w-8 h-8" />
              </div>
            ) : recentRedemptions.length === 0 ? (
              <EmptyState
                image={EmptyStateImage}
                title="No Redemptions Yet"
                description="Once redemptions are made for this branch, they will appear here."
              />
            ) : (
              <div className="space-y-3">
                {recentRedemptions.map((redemption: any) => {
                  const redemptionDate =
                    redemption.redemption_date || redemption.created_at || redemption.updated_at
                  return (
                    <div
                      key={redemption.id || redemption.redemption_id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-[#402D87]/10 flex items-center justify-center shrink-0">
                          <Icon icon="bi:arrow-left-right" className="text-[#402D87] text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Text
                              variant="span"
                              weight="semibold"
                              className="text-gray-900 text-sm"
                            >
                              {redemption.card_type || 'Gift Card'}
                            </Text>
                            {redemption.redemption_id && (
                              <Text variant="span" className="text-gray-500 text-xs">
                                #{redemption.redemption_id}
                              </Text>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            {redemption.phone_number && (
                              <span className="flex items-center gap-1">
                                <Icon icon="bi:phone" className="size-3" />
                                {redemption.phone_number}
                              </span>
                            )}
                            {redemptionDate && (
                              <span className="flex items-center gap-1">
                                <Icon icon="bi:calendar" className="size-3" />
                                {formatDate(redemptionDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <Text variant="span" weight="bold" className="text-gray-900 block">
                            {formatCurrency(redemption.amount || '0', redemption.currency || 'GHS')}
                          </Text>
                          {redemption.status && (
                            <StatusCell
                              getValue={() => redemption.status}
                              row={{
                                original: {
                                  id: redemption.id || redemption.redemption_id || '',
                                  status: redemption.status,
                                },
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
          <div className="p-6 pb-0 flex justify-between items-center mb-6">
            <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
              <Icon icon="bi:briefcase-fill" className="text-[#402D87] mr-2" /> Experiences
            </h5>
            <Link
              to={`${ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE}?account=vendor`}
              className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
            >
              View all <Icon icon="bi:arrow-right" className="ml-1" />
            </Link>
          </div>
          <div className="px-6 pb-6">
            {experiences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 min-h-[300px]">
                <Icon icon="bi:briefcase" className="text-6xl text-gray-300 opacity-40 mb-4" />
                <Text variant="p" className="text-sm text-gray-400 font-normal">
                  No experiences created yet
                </Text>
              </div>
            ) : (
              <div className="flex gap-5 overflow-x-auto overflow-y-hidden py-1">
                {experiences.slice(0, 6).map((experience: any) => {
                  const cardType = experience.type || experience.card_type || 'dashx'
                  const firstImage = experience.images?.[0]?.file_url
                  const imageSrc =
                    (firstImage ? getImageUrl(firstImage) : null) || getCardBackground(cardType)
                  const productName = experience.product || experience.card_name || 'Experience'
                  const vendorName = experience.vendor_name || 'Vendor'

                  return (
                    <button
                      type="button"
                      key={experience.id}
                      onClick={() => {
                        experienceModal.openModal(MODALS.EXPERIENCE.VIEW, experience)
                      }}
                      className="shrink-0 w-[240px] rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow overflow-hidden text-left cursor-pointer"
                    >
                      <div className="relative aspect-video bg-gray-100 overflow-hidden">
                        <img
                          src={imageSrc}
                          alt={productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = getCardBackground(cardType)
                          }}
                        />
                      </div>
                      <div className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#402D87]/10 text-[#402D87] mb-2">
                          <Icon icon="bi:briefcase-fill" className="text-[8px]" />
                          {getCardTypeName(cardType)}
                        </span>
                        <Text
                          variant="span"
                          weight="semibold"
                          className="text-gray-900 block line-clamp-2 text-xs leading-snug mb-2"
                        >
                          {productName}
                        </Text>
                        <div className="mb-2">
                          {experience.expiry_date && (
                            <Text
                              variant="span"
                              className="text-gray-500 text-[10px] flex items-center gap-0.5"
                            >
                              <Icon icon="bi:calendar-event" className="size-2.5" />
                              Expires {formatDate(experience.expiry_date)}
                            </Text>
                          )}
                        </div>
                        <div className="flex items-center gap-2 pt-1.5 border-t border-gray-100">
                          <div className="w-6 h-6 rounded-full bg-[#402D87]/10 flex items-center justify-center shrink-0">
                            <Icon icon="bi:shop" className="text-[#402D87] text-[10px]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Text
                              variant="span"
                              weight="semibold"
                              className="text-gray-900 block text-xs truncate"
                            >
                              {vendorName}
                            </Text>
                            <Text variant="span" className="text-gray-500 text-[10px] block">
                              Vendor
                            </Text>
                          </div>
                          <Text
                            variant="span"
                            weight="bold"
                            className="text-[#402D87] text-xs shrink-0"
                          >
                            {formatCurrency(experience.price || 0, experience.currency || 'GHS')}
                          </Text>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Text variant="h6" weight="medium">
              Branch Payment Details Management
            </Text>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={openEditPaymentModal}>
                <Icon icon="bi:pencil-square" className="mr-2" />
                Edit Payment Detail
              </Button>
              <Button variant="outline" onClick={openDeletePaymentModal}>
                <Icon icon="bi:trash3" className="mr-2 text-red-500" />
                Delete Payment Detail
              </Button>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
            <Text variant="span" weight="semibold" className="block">
              Current Branch Payment Details
            </Text>
            {isLoadingBranchPaymentDetails ? (
              <Text variant="span" className="text-sm text-gray-600">
                Loading branch payment details...
              </Text>
            ) : branchMobileMoneyAccounts.length === 0 && branchBankAccounts.length === 0 ? (
              <Text variant="span" className="text-sm text-gray-500">
                No payment details found for this branch.
              </Text>
            ) : (
              <div className="space-y-4">
                <div>
                  <Text variant="span" className="text-sm font-medium block mb-2">
                    Mobile Money Accounts ({branchMobileMoneyAccounts.length})
                  </Text>
                  {branchMobileMoneyAccounts.length === 0 ? (
                    <Text variant="span" className="text-xs text-gray-500">
                      No mobile money accounts.
                    </Text>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {branchMobileMoneyAccounts.map((account: any, idx: number) => (
                        <div
                          key={String(account.id ?? idx)}
                          className="bg-white border border-gray-200 rounded-md p-3"
                        >
                          <Text variant="span" className="text-xs block">
                            <strong>Provider:</strong>{' '}
                            {account.provider || account.mobile_money_provider || '-'}
                          </Text>
                          <Text variant="span" className="text-xs block">
                            <strong>Number:</strong>{' '}
                            {account.momo_number || account.mobile_money_number || '-'}
                          </Text>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Text variant="span" className="text-sm font-medium block mb-2">
                    Bank Accounts ({branchBankAccounts.length})
                  </Text>
                  {branchBankAccounts.length === 0 ? (
                    <Text variant="span" className="text-xs text-gray-500">
                      No bank accounts.
                    </Text>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {branchBankAccounts.map((account: any, idx: number) => (
                        <div
                          key={String(account.id ?? idx)}
                          className="bg-white border border-gray-200 rounded-md p-3"
                        >
                          <Text variant="span" className="text-xs block">
                            <strong>Bank:</strong> {account.bank_name || '-'}
                          </Text>
                          <Text variant="span" className="text-xs block">
                            <strong>Account Name:</strong>{' '}
                            {account.account_holder_name || account.account_name || '-'}
                          </Text>
                          <Text variant="span" className="text-xs block">
                            <strong>Account Number:</strong> {account.account_number || '-'}
                          </Text>
                          <Text variant="span" className="text-xs block">
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
        </div>
      </div>

      <BranchDetailsModal />
      <DeleteBranchPaymentDetailsModal />
      <RedemptionDetails />
      <ViewExperience />
      <UpdateBranchStatusModal />
      <UpdateBranchManagerDetailsModal />
      <DeleteBranchModal />

      <Modal
        isOpen={isEditPaymentModalOpen}
        setIsOpen={setIsEditPaymentModalOpen}
        panelClass="!max-w-2xl"
        position="center"
      >
        <div className="p-6 space-y-4">
          <Text variant="h3" weight="semibold">
            Edit Branch Payment Details
          </Text>
          <div>
            <label className="text-sm font-medium block mb-1">Payment Method</label>
            <select
              value={updateForm.payment_method}
              onChange={(e: any) =>
                setUpdateForm((prev) => ({ ...prev, payment_method: e.target.value }))
              }
              className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white"
            >
              <option value="mobile_money">Mobile Money</option>
              <option value="bank">Bank</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {updateForm.payment_method === 'mobile_money' ? (
              <>
                <Input
                  label="Mobile Money Provider"
                  value={updateForm.mobile_money_provider}
                  onChange={(e: any) =>
                    setUpdateForm((prev) => ({ ...prev, mobile_money_provider: e.target.value }))
                  }
                />
                <Input
                  label="Mobile Money Number"
                  value={updateForm.mobile_money_number}
                  onChange={(e: any) =>
                    setUpdateForm((prev) => ({ ...prev, mobile_money_number: e.target.value }))
                  }
                />
              </>
            ) : (
              <>
                <Input
                  label="Bank Name"
                  value={updateForm.bank_name}
                  onChange={(e: any) =>
                    setUpdateForm((prev) => ({ ...prev, bank_name: e.target.value }))
                  }
                />
                <Input
                  label="Bank Branch"
                  value={updateForm.bank_branch}
                  onChange={(e: any) =>
                    setUpdateForm((prev) => ({ ...prev, bank_branch: e.target.value }))
                  }
                />
                <Input
                  label="Account Holder Name"
                  value={updateForm.account_holder_name}
                  onChange={(e: any) =>
                    setUpdateForm((prev) => ({ ...prev, account_holder_name: e.target.value }))
                  }
                />
                <Input
                  label="Account Number"
                  value={updateForm.account_number}
                  onChange={(e: any) =>
                    setUpdateForm((prev) => ({ ...prev, account_number: e.target.value }))
                  }
                />
                <Input
                  label="Swift Code"
                  value={updateForm.swift_code}
                  onChange={(e: any) =>
                    setUpdateForm((prev) => ({ ...prev, swift_code: e.target.value }))
                  }
                />
                <Input
                  label="Sort Code"
                  value={updateForm.sort_code}
                  onChange={(e: any) =>
                    setUpdateForm((prev) => ({ ...prev, sort_code: e.target.value }))
                  }
                />
              </>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsEditPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              loading={updateBranchMutation.isPending}
              onClick={() => {
                if (!branchId) return
                const existingMobile = branchMobileMoneyAccounts[0]
                const existingBank = branchBankAccounts[0]
                updateBranchMutation.mutate(
                  {
                    branch_id: branchId,
                    mobile_money_accounts:
                      updateForm.payment_method === 'mobile_money' && updateForm.mobile_money_number
                        ? [
                            {
                              id: existingMobile?.id ?? 0,
                              mobile_money_number: updateForm.mobile_money_number,
                              mobile_money_provider: updateForm.mobile_money_provider,
                            },
                          ]
                        : [],
                    bank_accounts:
                      updateForm.payment_method === 'bank' && updateForm.account_number
                        ? [
                            {
                              id: existingBank?.id ?? 0,
                              account_number: updateForm.account_number,
                              account_holder_name: updateForm.account_holder_name,
                              bank_name: updateForm.bank_name,
                              bank_branch: updateForm.bank_branch,
                              swift_code: updateForm.swift_code,
                              sort_code: updateForm.sort_code,
                            },
                          ]
                        : [],
                  },
                  {
                    onSuccess: () => setIsEditPaymentModalOpen(false),
                  },
                )
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeletePaymentModalOpen}
        setIsOpen={setIsDeletePaymentModalOpen}
        panelClass="!max-w-md"
        position="center"
      >
        <div className="p-6 space-y-4">
          <Text variant="h3" weight="semibold">
            Delete Branch Payment Details
          </Text>
          <Text variant="span" className="text-sm text-gray-600 block">
            Are you sure you want to delete all payment details attached to this branch?
          </Text>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsDeletePaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteBranchMutation.isPending}
              disabled={!branchId}
              onClick={() => {
                if (!branchId) return
                deleteBranchMutation.mutate(String(branchId), {
                  onSuccess: () => setIsDeletePaymentModalOpen(false),
                })
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

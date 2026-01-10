import React from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button,
  Modal,
  Text,
  Tag,
  Avatar,
  Input,
  Combobox,
  RadioGroup,
  RadioGroupItem,
  BasePhoneInput,
  Loader,
} from '@/components'
import { Icon } from '@/libs'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { getStatusVariant } from '@/utils/helpers/common'
import type { Branch } from '@/utils/schemas'
import { useVendorMutations } from '@/features/dashboard/vendor/hooks/useVendorMutations'
import { vendorQueries } from '@/features/dashboard/vendor/hooks/useVendorQueries'
import { GHANA_BANKS } from '@/assets/data/banks'
import { useCountriesData } from '@/hooks'
import type { UpdateBranchPaymentDetailsPayload, AddBranchPaymentDetailsPayload } from '@/types'

interface BranchDetailsModalProps {
  branch: Branch | null
}

const PaymentDetailsSchema = z
  .object({
    payment_method: z.enum(['mobile_money', 'bank']).optional(),
    mobile_money_provider: z.string().optional(),
    mobile_money_number: z.string().optional(),
    bank_name: z.string().optional(),
    bank_branch: z.string().optional(),
    account_holder_name: z.string().optional(),
    account_number: z.string().optional(),
    swift_code: z.string().optional(),
    sort_code: z.string().optional(),
  })
  .refine(
    (data) => {
      // If payment_method is mobile_money, provider and number are required
      if (data.payment_method === 'mobile_money') {
        return !!(data.mobile_money_provider && data.mobile_money_number)
      }
      return true
    },
    {
      message: 'Mobile Money Provider and Mobile Money Number are required',
      path: ['mobile_money_provider'],
    },
  )
  .refine(
    (data) => {
      // If payment_method is bank, all bank fields are required
      if (data.payment_method === 'bank') {
        return !!(
          data.bank_name &&
          data.account_number &&
          data.account_holder_name &&
          data.sort_code &&
          data.swift_code
        )
      }
      return true
    },
    {
      message: 'All bank details are required',
      path: ['bank_name'],
    },
  )

export function BranchDetailsModal({ branch: branchProp }: BranchDetailsModalProps) {
  const modal = usePersistedModalState<Branch>({
    paramName: MODALS.BRANCH.VIEW,
  })

  // Use modalData if available (when opened via openModal with data), otherwise use prop
  const branch = React.useMemo(() => {
    return modal.modalData || branchProp || null
  }, [modal.modalData, branchProp])

  const {
    useUpdateBranchPaymentDetailsService,
    useDeleteBranchPaymentDetailsService,
    useAddBranchPaymentDetailsService,
  } = useVendorMutations()
  const { mutateAsync: updateBranchPaymentDetails, isPending: isUpdatingPaymentDetails } =
    useUpdateBranchPaymentDetailsService()
  const { mutateAsync: deleteBranchPaymentDetails, isPending: isDeletingPaymentDetails } =
    useDeleteBranchPaymentDetailsService()
  const { mutateAsync: addBranchPaymentDetails, isPending: isAddingPaymentDetails } =
    useAddBranchPaymentDetailsService()

  const { useGetBranchPaymentDetailsService } = vendorQueries()
  const { data: paymentDetailsResponse, isLoading: isLoadingPaymentDetails } =
    useGetBranchPaymentDetailsService(branch?.id || null)

  const { countries } = useCountriesData()

  // Extract payment details from response
  const mobileMoneyAccounts = React.useMemo(() => {
    return paymentDetailsResponse?.mobile_money_accounts || []
  }, [paymentDetailsResponse])

  const bankAccounts = React.useMemo(() => {
    return paymentDetailsResponse?.bank_accounts || []
  }, [paymentDetailsResponse])

  const [isEditing, setIsEditing] = React.useState(false)
  const [editedBranch, setEditedBranch] = React.useState(branch)
  const [isEditingPayment, setIsEditingPayment] = React.useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)

  // Initialize payment form with existing data
  const initialPaymentValues = React.useMemo(() => {
    if (mobileMoneyAccounts.length > 0) {
      const account = mobileMoneyAccounts[0]
      // Format phone number for BasePhoneInput (expects +233-XXXXXXXXX format)
      // API returns format like "0507301396" (local format)
      let phoneNumber = account.momo_number || ''
      if (phoneNumber) {
        // Extract only digits
        const digitsOnly = phoneNumber.replace(/\D/g, '')
        // Remove country code prefix if present (233 for Ghana)
        let localNumber = digitsOnly
        if (digitsOnly.startsWith('233')) {
          localNumber = digitsOnly.slice(3) // Remove '233' prefix
        } else if (digitsOnly.startsWith('0')) {
          localNumber = digitsOnly.slice(1) // Remove '0' prefix
        }
        // Format for BasePhoneInput: "+233-{local_number}"
        phoneNumber = localNumber ? `+233-${localNumber}` : ''
      }
      return {
        payment_method: 'mobile_money' as const,
        mobile_money_provider: account.provider || '',
        mobile_money_number: phoneNumber || '',
        bank_name: '',
        bank_branch: '',
        account_holder_name: '',
        account_number: '',
        swift_code: '',
        sort_code: '',
      }
    }
    if (bankAccounts.length > 0) {
      const account = bankAccounts[0]
      return {
        payment_method: 'bank' as const,
        mobile_money_provider: '',
        mobile_money_number: '',
        bank_name: account.bank_name || '',
        bank_branch: account.bank_branch || '',
        account_holder_name: account.account_holder_name || '',
        account_number: account.account_number || '',
        swift_code: account.swift_code || '',
        sort_code: account.sort_code || '',
      }
    }
    return {
      payment_method: 'mobile_money' as const,
      mobile_money_provider: '',
      mobile_money_number: '',
      bank_name: '',
      bank_branch: '',
      account_holder_name: '',
      account_number: '',
      swift_code: '',
      sort_code: '',
    }
  }, [mobileMoneyAccounts, bankAccounts])

  const paymentForm = useForm<z.infer<typeof PaymentDetailsSchema>>({
    resolver: zodResolver(PaymentDetailsSchema),
    defaultValues: initialPaymentValues,
  })

  const paymentMethod = useWatch({
    control: paymentForm.control,
    name: 'payment_method',
  })

  React.useEffect(() => {
    setEditedBranch(branch)
  }, [branch])

  // Track if modal is open to reset form only when opening
  const isModalOpen = modal.isModalOpen(MODALS.BRANCH.VIEW)
  const prevModalOpenRef = React.useRef(false)
  const initialPaymentValuesRef = React.useRef(initialPaymentValues)

  // Update ref when initialPaymentValues changes
  React.useEffect(() => {
    initialPaymentValuesRef.current = initialPaymentValues
  }, [initialPaymentValues])

  React.useEffect(() => {
    // Only reset form when modal opens (transitions from closed to open)
    if (isModalOpen && !prevModalOpenRef.current) {
      paymentForm.reset(initialPaymentValuesRef.current)
    }
    prevModalOpenRef.current = isModalOpen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen])

  // Reset form when editing is cancelled - use ref to avoid infinite loop
  const prevIsEditingPaymentRef = React.useRef(isEditingPayment)
  React.useEffect(() => {
    // Only reset when transitioning from editing to not editing
    if (prevIsEditingPaymentRef.current && !isEditingPayment) {
      paymentForm.reset(initialPaymentValuesRef.current)
    }
    prevIsEditingPaymentRef.current = isEditingPayment
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditingPayment])

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    setIsEditing(false)
    setIsEditingPayment(false)
    setIsDeleteModalOpen(false)
    // Reset form with current initial values when closing
    paymentForm.reset(initialPaymentValuesRef.current)
  }, [modal, paymentForm])

  const handleDeletePaymentDetails = async () => {
    if (!branch?.id) return

    try {
      await deleteBranchPaymentDetails(branch.id)
      setIsDeleteModalOpen(false)
      setIsEditingPayment(false)
      paymentForm.reset(initialPaymentValuesRef.current)
    } catch (error) {
      console.error('Failed to delete branch payment details:', error)
      // Keep modal open on error so user can retry
    }
  }

  const handleSavePaymentDetails = async (data: z.infer<typeof PaymentDetailsSchema>) => {
    if (!branch?.id) return

    try {
      // Check if payment details already exist
      const hasExistingPaymentDetails = mobileMoneyAccounts.length > 0 || bankAccounts.length > 0

      if (!hasExistingPaymentDetails) {
        // Use POST /vendors/add/branch-payment-details to add new payment details
        const payload: AddBranchPaymentDetailsPayload = {
          branch_id: Number(branch.id),
        }

        if (
          data.payment_method === 'mobile_money' &&
          data.mobile_money_provider &&
          data.mobile_money_number
        ) {
          // Convert phone number from BasePhoneInput format (+233-XXXXXXXXX) to API format (0XXXXXXXXX)
          let phoneNumber = data.mobile_money_number.replace(/\D/g, '') // Remove non-digits
          if (phoneNumber.startsWith('233')) {
            phoneNumber = phoneNumber.slice(3) // Remove '233' prefix
          }
          // Ensure it starts with '0' for local format
          const formattedNumber = phoneNumber.startsWith('0') ? phoneNumber : `0${phoneNumber}`

          payload.mobile_money_accounts = [
            {
              momo_number: formattedNumber, // Use formattedNumber for API (e.g., "0507301396")
              provider: data.mobile_money_provider,
            },
          ]
        } else if (data.payment_method === 'bank') {
          payload.bank_accounts = [
            {
              account_number: data.account_number || '',
              account_holder_name: data.account_holder_name || '',
              bank_name: data.bank_name || '',
              bank_branch: data.bank_branch || '',
              swift_code: data.swift_code || '',
              sort_code: data.sort_code || '',
            },
          ]
        }

        await addBranchPaymentDetails(payload)
      } else {
        // Use PUT /payment-details/update-branch to update existing payment details
        const payload: UpdateBranchPaymentDetailsPayload = {
          branch_id: Number(branch.id),
        }

        if (
          data.payment_method === 'mobile_money' &&
          data.mobile_money_provider &&
          data.mobile_money_number
        ) {
          // Get existing account ID if available, otherwise use 0 for new
          const existingAccountId = mobileMoneyAccounts[0]?.id || 0

          // Convert phone number from BasePhoneInput format (+233-XXXXXXXXX) to API format (0XXXXXXXXX)
          let phoneNumber = data.mobile_money_number.replace(/\D/g, '') // Remove non-digits
          if (phoneNumber.startsWith('233')) {
            phoneNumber = phoneNumber.slice(3) // Remove '233' prefix
          }
          // Ensure it starts with '0' for local format
          const formattedNumber = phoneNumber.startsWith('0') ? phoneNumber : `0${phoneNumber}`

          payload.mobile_money_accounts = [
            {
              id: existingAccountId,
              momo_number: formattedNumber, // Use formattedNumber for API (e.g., "0507301396")
              provider: data.mobile_money_provider,
            },
          ]
        } else if (data.payment_method === 'bank') {
          // Get existing account ID if available, otherwise use 0 for new
          const existingAccountId = bankAccounts[0]?.id || 0

          payload.bank_accounts = [
            {
              id: existingAccountId,
              account_number: data.account_number || '',
              account_holder_name: data.account_holder_name || '', // PUT endpoint uses 'account_holder_name'
              bank_name: data.bank_name || '',
              bank_branch: data.bank_branch || '', // PUT endpoint uses 'bank_branch'
              swift_code: data.swift_code || '',
              sort_code: data.sort_code || '',
            },
          ]
        }

        await updateBranchPaymentDetails(payload)
      }

      // Editing mode will be closed and form reset in the mutation's onSuccess handler via query invalidation
      // But we also reset it here to ensure UI state is updated immediately
      setIsEditingPayment(false)
      paymentForm.reset(initialPaymentValuesRef.current)
    } catch (error) {
      console.error('Failed to save branch payment details:', error)
      // Keep editing mode open on error so user can retry
    }
  }

  const mobileMoneyProviders = [
    { label: 'MTN', value: 'mtn' },
    { label: 'Vodafone', value: 'vodafone' },
    { label: 'AirtelTigo', value: 'airteltigo' },
  ]

  const bankOptions = GHANA_BANKS.map((bank) => ({
    label: bank.name,
    value: bank.name,
  }))

  if (!branch) return null

  return (
    <Modal
      position="side"
      title="Branch Details"
      isOpen={modal.isModalOpen(MODALS.BRANCH.VIEW)}
      setIsOpen={handleCloseModal}
      panelClass="!w-[864px]"
    >
      <section className="max-w-[480px] w-full mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button type="button" onClick={handleCloseModal}>
                <Icon icon="hugeicons:arrow-left-01" className="text-primary-900" />
              </button>
              <Text as="h2" className="text-xl font-semibold text-gray-900">
                Branch Details
              </Text>
            </div>
            {!isEditing && !isEditingPayment && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setIsEditing(true)}
                className="rounded-full"
              >
                Edit
              </Button>
            )}
          </div>

          {/* Branch Profile Section */}
          <div className="bg-white rounded-xl py-5 border border-gray-200">
            <div className="px-6 flex items-center justify-center gap-6">
              <section className="flex items-center gap-3 flex-col">
                <Avatar
                  name={branch.branch_name}
                  size="lg"
                  className="rounded-xl flex justify-center items-center"
                />
                <div className="py-2.5 px-2 flex flex-col gap-1 text-center capitalize">
                  <Text variant="h4" weight="medium" className="text-gray-800">
                    {branch.branch_name}
                  </Text>
                  <div className="flex gap-2 items-center justify-center">
                    <Text variant="span" className="text-secondary-800 text-sm text-nowrap">
                      {branch.branch_code}
                    </Text>
                    <Tag value={branch.status} variant={getStatusVariant(branch.status) as any} />
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Branch Information */}
          <div className="flex flex-col gap-6">
            <Text variant="h5" weight="medium">
              Branch Information
            </Text>
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Branch ID</p>
                {isEditing ? (
                  <Input
                    value={editedBranch?.full_branch_id || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedBranch({ ...editedBranch!, full_branch_id: e.target.value })
                    }
                  />
                ) : (
                  <Text variant="span">{branch.full_branch_id || branch.id}</Text>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Branch Code</p>
                {isEditing ? (
                  <Input
                    value={editedBranch?.branch_code || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedBranch({ ...editedBranch!, branch_code: e.target.value })
                    }
                  />
                ) : (
                  <Text variant="span">{branch.branch_code}</Text>
                )}
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <p className="text-xs text-gray-400">Location</p>
                {isEditing ? (
                  <Input
                    value={editedBranch?.branch_location || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedBranch({ ...editedBranch!, branch_location: e.target.value })
                    }
                  />
                ) : (
                  <Text variant="span">{branch.branch_location}</Text>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Branch Type</p>
                {isEditing ? (
                  <Input
                    value={editedBranch?.branch_type || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedBranch({ ...editedBranch!, branch_type: e.target.value })
                    }
                  />
                ) : (
                  <Text variant="span">{branch.branch_type}</Text>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Status</p>
                <Tag value={branch.status} variant={getStatusVariant(branch.status) as any} />
              </div>
            </section>
          </div>

          {/* Branch Owner/Manager Section */}
          <div className="border-t border-gray-200 pt-6">
            <Text variant="h5" weight="medium" className="mb-4">
              Branch Owner
            </Text>
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Manager Name</p>
                {isEditing ? (
                  <Input
                    value={editedBranch?.branch_manager_name || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedBranch({ ...editedBranch!, branch_manager_name: e.target.value })
                    }
                  />
                ) : (
                  <Text variant="span">{branch.branch_manager_name}</Text>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Manager Email</p>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editedBranch?.branch_manager_email || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedBranch({ ...editedBranch!, branch_manager_email: e.target.value })
                    }
                  />
                ) : (
                  <Text variant="span">{branch.branch_manager_email}</Text>
                )}
              </div>
            </section>
          </div>

          {/* Payment Details Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <Text variant="h5" weight="medium">
                Payment Details
              </Text>
              {!isEditingPayment && (
                <div className="flex items-center gap-2">
                  {(mobileMoneyAccounts.length > 0 || bankAccounts.length > 0) && (
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="rounded-full text-red-600 border-red-600 hover:bg-red-50"
                      disabled={isDeletingPaymentDetails}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setIsEditingPayment(true)}
                    className="rounded-full"
                  >
                    {mobileMoneyAccounts.length > 0 || bankAccounts.length > 0 ? 'Edit' : 'Add'}
                  </Button>
                </div>
              )}
            </div>

            {isLoadingPaymentDetails ? (
              <div className="flex items-center justify-center py-8">
                <Loader />
              </div>
            ) : isEditingPayment ? (
              <form
                onSubmit={paymentForm.handleSubmit(handleSavePaymentDetails)}
                className="space-y-6"
              >
                <div>
                  <Text variant="span" className="text-sm font-medium text-gray-700 mb-3 block">
                    Payment Method
                  </Text>
                  <Controller
                    control={paymentForm.control}
                    name="payment_method"
                    render={({ field }) => (
                      <RadioGroup value={field.value} onValueChange={field.onChange}>
                        <div className="flex gap-6">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="mobile_money" id="mobile-money" />
                            <label htmlFor="mobile-money" className="cursor-pointer text-sm">
                              Mobile Money
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="bank" id="bank" />
                            <label htmlFor="bank" className="cursor-pointer text-sm">
                              Bank Account
                            </label>
                          </div>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>

                {paymentMethod === 'mobile_money' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Controller
                        control={paymentForm.control}
                        name="mobile_money_provider"
                        render={({ field, fieldState: { error } }) => (
                          <Combobox
                            label="Mobile Money Provider"
                            options={mobileMoneyProviders}
                            value={field.value}
                            onChange={(e: any) => {
                              const value = e?.target?.value || e?.value || ''
                              field.onChange(value)
                            }}
                            error={error?.message}
                            placeholder="Select provider"
                          />
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Controller
                        control={paymentForm.control}
                        name="mobile_money_number"
                        render={({ field: { value, onChange } }) => (
                          <BasePhoneInput
                            placeholder="Enter number eg. 5512345678"
                            options={countries || []}
                            selectedVal={value}
                            maxLength={10}
                            handleChange={onChange}
                            label="Mobile Money Number"
                            error={paymentForm.formState.errors.mobile_money_number?.message}
                          />
                        )}
                      />
                      <p className="text-xs text-gray-500">
                        Please enter your number in the format:{' '}
                        <span className="font-medium">5512345678</span>
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Controller
                        control={paymentForm.control}
                        name="bank_name"
                        render={({ field, fieldState: { error } }) => (
                          <Combobox
                            label="Bank Name"
                            options={bankOptions}
                            value={field.value}
                            onChange={(e: any) => {
                              const value = e?.target?.value || e?.value || ''
                              field.onChange(value)
                            }}
                            error={error?.message}
                            placeholder="Select bank"
                            isSearchable={true}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Input
                        label="Bank Branch"
                        placeholder="Enter bank branch"
                        {...paymentForm.register('bank_branch')}
                        error={paymentForm.formState.errors.bank_branch?.message}
                      />
                    </div>

                    <div>
                      <Input
                        label="Account Number"
                        placeholder="Enter account number"
                        {...paymentForm.register('account_number')}
                        error={paymentForm.formState.errors.account_number?.message}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Input
                        label="Account Holder Name"
                        placeholder="Enter account holder name"
                        {...paymentForm.register('account_holder_name')}
                        error={paymentForm.formState.errors.account_holder_name?.message}
                      />
                    </div>

                    <div>
                      <Input
                        label="Sort Code"
                        placeholder="Enter sort code"
                        {...paymentForm.register('sort_code')}
                        error={paymentForm.formState.errors.sort_code?.message}
                      />
                    </div>

                    <div>
                      <Input
                        label="SWIFT Code"
                        placeholder="Enter SWIFT code"
                        {...paymentForm.register('swift_code')}
                        error={paymentForm.formState.errors.swift_code?.message}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    variant="secondary"
                    size="medium"
                    loading={isUpdatingPaymentDetails || isAddingPaymentDetails}
                    className="flex-1 rounded-full"
                  >
                    Save Payment Details
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="medium"
                    onClick={() => {
                      setIsEditingPayment(false)
                      paymentForm.reset(initialPaymentValuesRef.current)
                    }}
                    disabled={isUpdatingPaymentDetails || isAddingPaymentDetails}
                    className="flex-1 rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mobileMoneyAccounts.length > 0 && (
                  <>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">Payment Method</p>
                      <Text variant="span">Mobile Money</Text>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">Account Number</p>
                      <Text variant="span">{mobileMoneyAccounts[0].momo_number}</Text>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">Provider</p>
                      <Text variant="span" className="capitalize">
                        {mobileMoneyAccounts[0].provider}
                      </Text>
                    </div>
                  </>
                )}
                {bankAccounts.length > 0 && (
                  <>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">Payment Method</p>
                      <Text variant="span">Bank Account</Text>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">Bank Name</p>
                      <Text variant="span">{bankAccounts[0].bank_name}</Text>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">Account Number</p>
                      <Text variant="span">{bankAccounts[0].account_number}</Text>
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <p className="text-xs text-gray-400">Account Holder Name</p>
                      <Text variant="span">{bankAccounts[0].account_holder_name}</Text>
                    </div>
                  </>
                )}
                {mobileMoneyAccounts.length === 0 && bankAccounts.length === 0 && (
                  <div className="sm:col-span-2">
                    <Text variant="span" className="text-gray-500 text-sm">
                      No payment details added yet. Click "Add" to add payment details.
                    </Text>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                size="medium"
                onClick={() => {
                  // TODO: Save changes for branch info (not payment details)
                  setIsEditing(false)
                }}
                className="flex-1 rounded-full"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                size="medium"
                onClick={() => {
                  setIsEditing(false)
                  setEditedBranch(branch)
                }}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Delete Payment Details Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        panelClass="!max-w-md"
        position="center"
      >
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-4 items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Icon icon="bi:exclamation-triangle-fill" className="text-2xl text-red-600" />
            </div>
            <div className="space-y-2 text-center">
              <Text variant="h3" className="font-semibold">
                Delete Payment Details
              </Text>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the payment details for this branch? This action
                cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 rounded-full"
              disabled={isDeletingPaymentDetails}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeletePaymentDetails}
              className="flex-1 rounded-full"
              disabled={isDeletingPaymentDetails}
              loading={isDeletingPaymentDetails}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  )
}

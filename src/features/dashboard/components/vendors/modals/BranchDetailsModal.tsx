import React from 'react'
import { Controller } from 'react-hook-form'
import {
  Button,
  Modal,
  Text,
  Tag,
  Input,
  Combobox,
  RadioGroup,
  RadioGroupItem,
  BasePhoneInput,
  Loader,
} from '@/components'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'
import { getStatusVariant } from '@/utils/helpers/common'
import { useBranchDetailsModal } from './useBranchDetailsModal'

export function BranchDetailsModal() {
  const {
    modal,
    branch,
    isEditing,
    editedBranch,
    setEditedBranch,
    setIsEditing,
    isEditingPayment,
    setIsEditingPayment,
    openDeletePaymentDetailsModal,
    paymentForm,
    paymentMethod,
    mobileMoneyAccounts,
    bankAccounts,
    isLoadingPaymentDetails,
    isUpdatingPaymentDetails,
    isAddingPaymentDetails,
    handleCloseModal,
    handleSavePaymentDetails,
    cancelPaymentEdit,
    mobileMoneyProviders,
    bankOptions,
    countries,
  } = useBranchDetailsModal()

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
          </div>

          <div className="bg-white rounded-xl py-5 border border-gray-200">
            <div className="px-6 flex items-center justify-center gap-6">
              <section className="flex items-center gap-3 flex-col">
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
                      onClick={openDeletePaymentDetailsModal}
                      className="rounded-full text-red-600 border-red-600 hover:bg-red-50"
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
                            onChange={(e: unknown) => {
                              const ev = e as { target?: { value?: string }; value?: string }
                              field.onChange(ev?.target?.value ?? ev?.value ?? '')
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
                            onChange={(e: unknown) => {
                              const ev = e as { target?: { value?: string }; value?: string }
                              field.onChange(ev?.target?.value ?? ev?.value ?? '')
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
                    onClick={cancelPaymentEdit}
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

          {isEditing && (
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                size="medium"
                onClick={() => setIsEditing(false)}
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
    </Modal>
  )
}

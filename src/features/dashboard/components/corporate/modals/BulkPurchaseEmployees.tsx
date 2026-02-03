import React from 'react'
import { Button, FileUploader, Modal, Text, Input, Checkbox, Tabs, Combobox } from '@/components'
import { CardItems } from '@/features/website/components/CardItems/CardItems'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'
import DashProBg from '@/assets/svgs/dashpro_bg.svg'
import RecipientTemplate from '@/assets/recipient_template.xlsx?url'
import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'
import { formatCurrency } from '@/utils/format'
import { useBulkPurchaseEmployeesModal } from '@/features/dashboard/components/corporate/modals/useBulkPurchaseEmployeesModal'
import type { RecipientRow, CardRecipientAssignment } from '@/types'

export function BulkPurchaseEmployees() {
  const modal = usePersistedModalState({
    paramName: MODALS.BULK_EMPLOYEE_PURCHASE.PARAM_NAME,
  })

  return (
    <>
      <Button
        variant="secondary"
        className="cursor-pointer"
        size="medium"
        onClick={() => modal.openModal(MODALS.BULK_EMPLOYEE_PURCHASE.CHILDREN.CREATE)}
      >
        <Icon icon="hugeicons:upload-01" className="mr-2" />
        Bulk Purchase (Employees)
      </Button>
      <BulkPurchaseEmployeesModal />
    </>
  )
}

export function BulkPurchaseEmployeesModal() {
  const {
    modal,
    step,
    setStep,
    file,
    setFile,
    uploadedRecipients,
    selectedVendor,
    selectedVendorId,
    selectedCardId,
    selectedCardType,
    selectedRecipients,
    cardRecipientAssignments,
    setCardRecipientAssignments,
    dashGoAmount,
    setDashGoAmount,
    activeTab,
    setActiveTab,
    cartId,
    existingCartItems,
    hasExistingCartItems,
    vendorOptions,
    selectedVendorData,
    selectedVendorName,
    allCards,
    vendorCards,
    isLoadingVendors,
    downloadTemplate,
    handleUpload,
    handleToggleRecipient,
    handleSelectAllRecipients,
    handleVendorSelect,
    handleClearVendor,
    handleBackToVendors,
    handleCardSelect,
    handleDashGoSelect,
    handleDashProSelect,
    handleSaveCardAssignment,
    handleSaveToCart,
    handleClose,
    handleCloseAndNavigate,
    uploadMutation,
    createDashGoMutation,
    createDashProMutation,
    addToCartMutation,
    hasExistingRecipients,
    existingRecipientsList,
    existingRecipientsLoading,
    choiceMade,
    handleReplaceAll,
    handleAddToRecipients,
    handleProceedToSelectCards,
    deleteUnassignedBulkMutation,
  } = useBulkPurchaseEmployeesModal()

  const stepLabels = hasExistingRecipients
    ? [
        { step: 0, label: 'Choose' },
        { step: 1, label: 'Upload' },
        { step: 2, label: 'Select Cards' },
      ]
    : [
        { step: 1, label: 'Upload' },
        { step: 2, label: 'Select Cards' },
      ]

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.BULK_EMPLOYEE_PURCHASE.CHILDREN.CREATE)}
      setIsOpen={handleClose}
      title="Bulk Purchase Gift Cards for Employees"
      position="side"
      panelClass="!w-[964px] p-8"
    >
      <div className="p-6 space-y-6 flex flex-col min-h-full">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {stepLabels.map(({ step: s, label }, idx) => (
            <React.Fragment key={s}>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="ml-2 text-sm font-medium">{label}</span>
              </div>
              {idx < stepLabels.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Checking for recipients (avoid showing Upload until we know) */}
        {step === 1 && !hasExistingRecipients && existingRecipientsLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Text variant="p" className="text-sm text-gray-600">
              Checking for existing recipients...
            </Text>
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Step 0: Existing recipients — Replace all or Add to */}
        {step === 0 && hasExistingRecipients && (
          <div className="space-y-6">
            <Text variant="p" className="text-sm text-gray-600">
              You have {existingRecipientsList.length} existing recipient(s). Do you want to replace
              all recipients or add to the recipients?
            </Text>
            {existingRecipientsLoading ? (
              <Text variant="span" className="text-sm text-gray-500">
                Loading recipients...
              </Text>
            ) : (
              <div className="max-h-[240px] overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Recipient Name
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingRecipientsList.map((r: RecipientRow) => (
                      <tr key={r.id} className="border-t border-gray-200">
                        <td className="px-4 py-2">{r.name}</td>
                        <td className="px-4 py-2">{r.email}</td>
                        <td className="px-4 py-2">{r.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleReplaceAll}
                disabled={deleteUnassignedBulkMutation.isPending}
                loading={deleteUnassignedBulkMutation.isPending}
              >
                Replace all recipients
              </Button>
              <Button variant="secondary" onClick={handleAddToRecipients}>
                Add to the recipients
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Upload Recipients (only when not loading recipients) */}
        {step === 1 && !existingRecipientsLoading && (
          <div className="space-y-6">
            <div className="space-y-2">
              {choiceMade === 'add' ? (
                <Text variant="p" className="text-sm text-gray-600">
                  You have {uploadedRecipients.length} recipient(s). Upload an Excel file to add
                  more (optional), or proceed to select cards.
                </Text>
              ) : (
                <Text variant="p" className="text-sm text-gray-600">
                  Upload an Excel file with recipient details (first name, last name, email, phone
                  number, message). After uploading, you'll be able to assign gift cards to each
                  recipient.
                </Text>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Text variant="span" weight="semibold" className="text-gray-900 block mb-2">
                  File Format Required
                </Text>
                <Text variant="p" className="text-sm text-gray-600 mb-2">
                  Your file must include the following columns (in this order):
                </Text>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>
                    <strong>last_name</strong> (required) - Recipient's last name
                  </li>
                  <li>
                    <strong>email</strong> (required) - Recipient's email address
                  </li>
                  <li>
                    <strong>phone</strong> (required) - Recipient's phone number
                  </li>
                  <li>
                    <strong>message</strong> (optional) - Personal message for the recipient
                  </li>
                  <li>
                    <strong>first_name</strong> (required) - Recipient's first name
                  </li>
                </ul>
              </div>

              <div className="flex items-end ml-4">
                <Button variant="outline" onClick={() => downloadTemplate(RecipientTemplate)}>
                  <Icon icon="hugeicons:download-01" className="mr-2" />
                  Download Template
                </Button>
              </div>
            </div>

            <FileUploader
              label="Upload Recipients File (Excel)"
              accept=".xlsx,.xls"
              value={file}
              onChange={setFile}
            />
          </div>
        )}

        {/* Step 2: Browse Vendors & Select Cards */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Text variant="h6" weight="semibold" className="text-gray-900">
                Browse Cards & Assign Recipients ({uploadedRecipients.length} recipients)
              </Text>
              {hasExistingCartItems && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
                  <Icon icon="hugeicons:shopping-cart-01" className="w-4 h-4 text-primary-600" />
                  <Text variant="span" className="text-sm text-primary-700 font-medium">
                    {existingCartItems.length} item(s) saved in cart
                  </Text>
                </div>
              )}
            </div>

            {/* Show existing cart items summary */}
            {hasExistingCartItems && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon icon="hugeicons:info-circle" className="w-5 h-5 text-blue-600" />
                    <Text variant="span" weight="semibold" className="text-blue-900">
                      Saved Cart Items
                    </Text>
                  </div>
                </div>
                <Text variant="p" className="text-sm text-blue-700 mb-2">
                  You have {existingCartItems.length} item(s) already saved in your cart. You can
                  continue adding more cards or proceed to checkout.
                </Text>
                <div className="mt-3 space-y-2">
                  {existingCartItems.slice(0, 3).map((cart: any, index: number) => (
                    <div key={index} className="text-sm text-blue-800">
                      • Cart #{cart.cart_id} - {cart.items?.length || 0} card(s)
                    </div>
                  ))}
                  {existingCartItems.length > 3 && (
                    <Text variant="span" className="text-sm text-blue-700">
                      ...and {existingCartItems.length - 3} more
                    </Text>
                  )}
                </div>
              </div>
            )}

            {!selectedVendor ? (
              <>
                {/* Vendor Selection */}
                <Tabs
                  tabs={[
                    { value: 'vendors', label: 'Vendors' },
                    { value: 'dashpro', label: 'DashPro' },
                  ]}
                  active={activeTab}
                  setActive={(value: string) => setActiveTab(value as 'vendors' | 'dashpro')}
                  className="gap-6"
                  btnClass="pb-2"
                />

                {activeTab === 'vendors' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Vendor <span className="text-red-500">*</span>
                      </label>
                      <Combobox
                        options={vendorOptions}
                        value={selectedVendorId}
                        onChange={(e: any) => {
                          const vendorId = e.target.value
                          if (vendorId) {
                            handleVendorSelect(vendorId)
                          } else {
                            handleClearVendor()
                          }
                        }}
                        placeholder="Search for a vendor by name..."
                        isLoading={isLoadingVendors}
                        isClearable
                        className="w-full"
                      />
                      {selectedVendor && selectedVendorData && (
                        <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Icon icon="bi:check-circle-fill" className="text-green-600" />
                            <Text variant="span" weight="medium" className="text-green-900">
                              {selectedVendorName}
                            </Text>
                          </div>
                          {(selectedVendorData as { branches_with_cards?: unknown[] })
                            .branches_with_cards && (
                            <Text variant="span" className="text-sm text-green-700 block mt-1">
                              {
                                (selectedVendorData as { branches_with_cards?: unknown[] })
                                  .branches_with_cards?.length
                              }{' '}
                              branch(es) available
                            </Text>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-linear-to-br from-[#f8f9fa] to-[#e9ecef] rounded-lg p-6 border border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                      {/* Left Column - DashPro Card Visual */}
                      <div className="flex justify-center">
                        <div className="relative w-full max-w-[400px] h-[240px] rounded-2xl shadow-xl overflow-hidden">
                          <img
                            src={DashProBg}
                            alt="DashPro background"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                            <div className="flex items-start justify-between">
                              <div className="text-xl font-black tracking-[0.3em]">DASHPRO</div>
                              <div className="text-right text-xl font-semibold">
                                GHS {dashGoAmount || '0.00'}
                              </div>
                            </div>
                            <div className="flex items-end justify-between">
                              <div className="text-base font-semibold uppercase">Monetary Card</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - DashPro Details and Actions */}
                      <div className="space-y-4">
                        <div>
                          <Text variant="h3" weight="semibold" className="text-gray-900">
                            DashPro Gift Card
                          </Text>
                          <Text variant="p" className="text-sm text-gray-600">
                            A monetary gift card that recipients can redeem for cash or use for
                            purchases
                          </Text>
                        </div>

                        <div>
                          <Text variant="h4" weight="medium" className="text-gray-900 mb-2">
                            Description
                          </Text>
                          <Text variant="p" className="text-sm text-gray-600">
                            DashPro is a monetary gift card that provides recipients with a cash
                            value they can redeem or use for purchases. Simply enter the amount and
                            assign it to your selected employees.
                          </Text>
                        </div>

                        {/* Amount Input */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Enter Amount
                          </label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-primary-500">
                              GHS
                            </span>
                            <Input
                              type="number"
                              value={dashGoAmount}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setDashGoAmount(e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full rounded-lg border border-gray-200 px-4 py-3 pl-16 text-lg font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            />
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          variant="secondary"
                          onClick={handleDashProSelect}
                          disabled={!dashGoAmount || parseFloat(dashGoAmount || '0') <= 0}
                          className="w-full"
                        >
                          Quick Assign
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recipients Table for DashPro - Show when DashPro is selected */}
                {selectedCardType === 'dashpro' && (
                  <div
                    id="recipients-table-section"
                    className="space-y-4 border-t border-gray-200 pt-4 mt-6"
                  >
                    <div className="flex items-center justify-between">
                      <Text variant="span" weight="medium" className="text-gray-700 block">
                        Select Recipients for DashPro
                      </Text>
                      <Button variant="outline" size="small" onClick={handleSelectAllRecipients}>
                        {selectedRecipients.size ===
                        uploadedRecipients.filter((r: RecipientRow) => r.id).length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">
                              <Checkbox
                                checked={
                                  uploadedRecipients.filter((r: RecipientRow) => r.id).length > 0 &&
                                  selectedRecipients.size ===
                                    uploadedRecipients.filter((r: RecipientRow) => r.id).length
                                }
                                indeterminate={
                                  selectedRecipients.size > 0 &&
                                  selectedRecipients.size <
                                    uploadedRecipients.filter((r: RecipientRow) => r.id).length
                                }
                                onChange={handleSelectAllRecipients}
                              />
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Recipient Name
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Phone
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Message
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadedRecipients.map((recipient: RecipientRow) => {
                            if (!recipient.id) return null
                            const isChecked = selectedRecipients.has(recipient.id)

                            return (
                              <tr
                                key={`recipient-${recipient.id}`}
                                className="border-t border-gray-200 hover:bg-gray-50"
                              >
                                <td className="px-4 py-3">
                                  <Checkbox
                                    checked={isChecked}
                                    onChange={() => handleToggleRecipient(recipient.id!)}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="font-medium text-gray-900">
                                    {recipient.name}
                                  </Text>
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="text-gray-700">
                                    {recipient.email}
                                  </Text>
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="text-gray-700">
                                    {recipient.phone}
                                  </Text>
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="text-gray-600">
                                    {recipient.message || '-'}
                                  </Text>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                      <Text variant="span" className="text-sm text-gray-700">
                        {selectedRecipients.size} of{' '}
                        {uploadedRecipients.filter((r: RecipientRow) => r.id).length} recipients
                        selected
                      </Text>
                      <Button
                        variant="secondary"
                        onClick={handleSaveCardAssignment}
                        disabled={
                          selectedRecipients.size === 0 ||
                          !dashGoAmount ||
                          parseFloat(dashGoAmount || '0') <= 0
                        }
                        loading={createDashProMutation.isPending}
                      >
                        Save Assignment
                      </Button>
                    </div>
                  </div>
                )}

                {/* Summary of Assignments for DashPro */}
                {Object.keys(cardRecipientAssignments).length > 0 && (
                  <div className="space-y-3 border-t border-gray-200 pt-4 mt-6">
                    <Text variant="h6" weight="semibold" className="text-gray-900">
                      Assignment Summary
                    </Text>
                    <div className="space-y-2">
                      {(
                        Object.entries(cardRecipientAssignments) as [
                          string,
                          CardRecipientAssignment,
                        ][]
                      ).map(([key, assignment]) => {
                        // Get recipient details from uploadedRecipients
                        const assignedRecipients = assignment.recipientIds
                          .map((id: number) =>
                            uploadedRecipients.find((r: RecipientRow) => r.id === id),
                          )
                          .filter(Boolean) as RecipientRow[]

                        return (
                          <div
                            key={key}
                            className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <Text variant="span" weight="medium" className="text-gray-900">
                                {assignment.cardName || 'Unknown Card'} ({assignment.cardType})
                              </Text>
                              <Text variant="span" className="text-sm text-gray-600 block mt-1">
                                Assigned to {assignment.recipientIds.length} recipient(s) -{' '}
                                {formatCurrency(
                                  (assignment.cardPrice || 0) * assignment.recipientIds.length,
                                  assignment.cardCurrency || 'GHS',
                                )}
                              </Text>
                              {/* Show recipient names and emails */}
                              <div className="mt-2 space-y-1">
                                {assignedRecipients.map((recipient: RecipientRow) => (
                                  <div key={recipient.id} className="text-sm text-gray-700">
                                    <Text variant="span" className="font-medium">
                                      {recipient.name}
                                    </Text>
                                    <Text variant="span" className="text-gray-500 ml-2">
                                      ({recipient.email})
                                    </Text>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => {
                                setCardRecipientAssignments(
                                  (prev: Record<string, CardRecipientAssignment>) => {
                                    const newAssignments = { ...prev }
                                    delete newAssignments[key]
                                    return newAssignments
                                  },
                                )
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Total Amount for DashPro */}
                {Object.keys(cardRecipientAssignments).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <Text variant="span" weight="semibold" className="text-gray-900">
                        Total Amount:
                      </Text>
                      <Text variant="span" weight="bold" className="text-lg text-primary-600">
                        {formatCurrency(
                          (
                            Object.values(cardRecipientAssignments) as CardRecipientAssignment[]
                          ).reduce(
                            (sum: number, assignment: CardRecipientAssignment) =>
                              sum + (assignment.cardPrice || 0) * assignment.recipientIds.length,
                            0,
                          ),
                          'GHS',
                        )}
                      </Text>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  {Object.keys(cardRecipientAssignments).length > 0 && (
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        await handleSaveToCart()
                        handleCloseAndNavigate('/checkout')
                      }}
                      disabled={
                        Object.keys(cardRecipientAssignments).length === 0 ||
                        addToCartMutation.isPending
                      }
                      loading={addToCartMutation.isPending}
                    >
                      Save & Checkout
                    </Button>
                  )}
                  {Object.keys(cardRecipientAssignments).length === 0 && hasExistingCartItems && (
                    <Button
                      variant="secondary"
                      onClick={() => handleCloseAndNavigate('/checkout')}
                      disabled={!cartId}
                    >
                      Proceed to Checkout
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Card Selection for Selected Vendor */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="small" onClick={handleBackToVendors}>
                      <Icon icon="hugeicons:arrow-left-01" className="mr-2" />
                      Back to Vendors
                    </Button>
                    <Text variant="span" weight="semibold" className="text-gray-900">
                      {selectedVendorName}
                    </Text>
                  </div>
                </div>

                <Text variant="p" className="text-sm text-gray-600">
                  Select a card to assign to recipients
                </Text>

                {/* DashGo Featured Section - Always shown for selected vendor */}
                {selectedVendor && (
                  <div className="bg-linear-to-br from-[#f8f9fa] to-[#e9ecef] rounded-lg p-6 border border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                      {/* Left Column - DashGo Card Visual */}
                      <div className="flex justify-center">
                        <div className="relative w-full max-w-[400px] h-[240px] rounded-2xl shadow-xl overflow-hidden">
                          <img
                            src={DashGoBg}
                            alt="DashGo background"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                            <div className="flex items-start justify-between">
                              <div className="text-xl font-black tracking-[0.3em]">DASHGO</div>
                              <div className="text-right text-xl font-semibold">
                                GHS {dashGoAmount || '0.00'}
                              </div>
                            </div>
                            <div className="flex items-end justify-between">
                              <div className="text-base font-semibold uppercase">
                                {selectedVendorName}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - DashGo Details and Actions */}
                      <div className="space-y-4">
                        <div>
                          <Text variant="h3" weight="semibold" className="text-gray-900">
                            DashGo Gift Card
                          </Text>
                          <Text variant="p" className="text-sm text-gray-600">
                            Vendor: {selectedVendorName}
                          </Text>
                        </div>

                        <div>
                          <Text variant="h4" weight="medium" className="text-gray-900 mb-2">
                            Description
                          </Text>
                          <Text variant="p" className="text-sm text-gray-600">
                            DashGo is a vendor-locked monetary gift card redeemable only at{' '}
                            {selectedVendorName}. Enter your desired amount to create a custom gift
                            card that can be used at this vendor's locations. Partial redemption is
                            allowed. selected employees
                          </Text>
                        </div>

                        {/* Amount Input */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Enter Amount
                          </label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-primary-500">
                              GHS
                            </span>
                            <Input
                              type="number"
                              value={dashGoAmount}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setDashGoAmount(e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full rounded-lg border border-gray-200 px-4 py-3 pl-16 text-lg font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            />
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          variant="secondary"
                          onClick={handleDashGoSelect}
                          disabled={!dashGoAmount || parseFloat(dashGoAmount || '0') <= 0}
                          className="w-full"
                        >
                          Quick Assign
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Vendor Cards (DashX, DashPass, etc.) */}
                {vendorCards.length > 0 ? (
                  <div className="space-y-3">
                    <Text variant="span" weight="semibold" className="text-gray-900">
                      Other Cards
                    </Text>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto">
                      {vendorCards.map((card: any) => {
                        const assignmentKey = `card-${card.card_id}`
                        const assignment = cardRecipientAssignments[assignmentKey]
                        const assignedCount = assignment?.recipientIds.length || 0
                        const isSelected =
                          selectedCardId === card.card_id && selectedCardType === 'card'

                        return (
                          <div
                            key={card.card_id}
                            className={`transition-all ${
                              isSelected ? 'ring-2 ring-primary-500 rounded-2xl' : ''
                            }`}
                          >
                            <CardItems
                              branch_name={card.branch_name || ''}
                              branch_location={card.branch_location || ''}
                              card_id={card.card_id}
                              product={card.product}
                              vendor_name={
                                card.vendor_name || selectedVendorName || 'Unknown Vendor'
                              }
                              rating={card.rating}
                              price={card.price}
                              currency={card.currency}
                              type={card.type}
                              description={card.description || ''}
                              expiry_date={card.expiry_date || ''}
                              terms_and_conditions={card.terms_and_conditions || []}
                              created_at={card.created_at || ''}
                              base_price={card.price || ''}
                              markup_price={null}
                              service_fee="0"
                              status={card.status || 'active'}
                              recipient_count="0"
                              images={card.images || []}
                              updated_at={card.updated_at || card.created_at || ''}
                              vendor_id={card.vendor_id}
                              buttonText="Quick Assign"
                              onGetQard={() => handleCardSelect(card.card_id, 'card')}
                            />
                            {assignedCount > 0 && (
                              <div className="mt-2 text-center">
                                <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                                  {assignedCount} assigned
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Recipients Table - Only show when a card is selected */}
                {(selectedCardId || selectedCardType) && (
                  <div
                    id="recipients-table-section"
                    className="space-y-4 border-t border-gray-200 pt-4 mt-6"
                  >
                    <div className="flex items-center justify-between">
                      <Text variant="span" weight="medium" className="text-gray-700 block">
                        Select Recipients for{' '}
                        {selectedCardType === 'dashgo'
                          ? 'DashGo'
                          : selectedCardType === 'dashpro'
                            ? 'DashPro'
                            : selectedCardType === 'card'
                              ? String(
                                  allCards.find((c: any) => c.card_id === selectedCardId)
                                    ?.product || 'this Card',
                                )
                              : 'this Card'}
                      </Text>
                      <Button variant="outline" size="small" onClick={handleSelectAllRecipients}>
                        {selectedRecipients.size ===
                        uploadedRecipients.filter((r: RecipientRow) => r.id).length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">
                              <Checkbox
                                checked={
                                  uploadedRecipients.filter((r: RecipientRow) => r.id).length > 0 &&
                                  selectedRecipients.size ===
                                    uploadedRecipients.filter((r: RecipientRow) => r.id).length
                                }
                                indeterminate={
                                  selectedRecipients.size > 0 &&
                                  selectedRecipients.size <
                                    uploadedRecipients.filter((r: RecipientRow) => r.id).length
                                }
                                onChange={handleSelectAllRecipients}
                              />
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Recipient Name
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Phone
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Message
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadedRecipients.map((recipient: RecipientRow) => {
                            if (!recipient.id) return null
                            const isChecked = selectedRecipients.has(recipient.id)

                            return (
                              <tr
                                key={`recipient-${recipient.id}`}
                                className="border-t border-gray-200 hover:bg-gray-50"
                              >
                                <td className="px-4 py-3">
                                  <Checkbox
                                    checked={isChecked}
                                    onChange={() => handleToggleRecipient(recipient.id!)}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="font-medium text-gray-900">
                                    {recipient.name}
                                  </Text>
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="text-gray-700">
                                    {recipient.email}
                                  </Text>
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="text-gray-700">
                                    {recipient.phone}
                                  </Text>
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="text-gray-600">
                                    {recipient.message || '-'}
                                  </Text>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                      <div>
                        <Text variant="span" weight="medium" className="text-gray-700 block">
                          {selectedRecipients.size} recipient(s) selected
                        </Text>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={handleSaveCardAssignment}
                        disabled={
                          selectedRecipients.size === 0 ||
                          (selectedCardType === 'dashgo' &&
                            (!dashGoAmount || parseFloat(dashGoAmount) <= 0)) ||
                          (selectedCardType === 'dashpro' &&
                            (!dashGoAmount || parseFloat(dashGoAmount) <= 0))
                        }
                        loading={createDashGoMutation.isPending || createDashProMutation.isPending}
                      >
                        Save Assignment
                      </Button>
                    </div>
                  </div>
                )}

                {/* Summary of Assignments */}
                {Object.keys(cardRecipientAssignments).length > 0 && (
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <Text variant="h6" weight="semibold" className="text-gray-900">
                      Assignment Summary
                    </Text>
                    <div className="space-y-2">
                      {(
                        Object.entries(cardRecipientAssignments) as [
                          string,
                          CardRecipientAssignment,
                        ][]
                      ).map(([key, assignment]) => {
                        // Get recipient details from uploadedRecipients
                        const assignedRecipients = assignment.recipientIds
                          .map((id: number) =>
                            uploadedRecipients.find((r: RecipientRow) => r.id === id),
                          )
                          .filter(Boolean) as RecipientRow[]

                        return (
                          <div
                            key={key}
                            className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <Text variant="span" weight="medium" className="text-gray-900">
                                {assignment.cardName || 'Unknown Card'} ({assignment.cardType})
                              </Text>
                              <Text variant="span" className="text-sm text-gray-600 block mt-1">
                                Assigned to {assignment.recipientIds.length} recipient(s) -{' '}
                                {formatCurrency(
                                  (assignment.cardPrice || 0) * assignment.recipientIds.length,
                                  assignment.cardCurrency || 'GHS',
                                )}
                              </Text>
                              {/* Show recipient names and emails */}
                              <div className="mt-2 space-y-1">
                                {assignedRecipients.map((recipient: RecipientRow) => (
                                  <div key={recipient.id} className="text-sm text-gray-700 flex">
                                    <Text variant="span" className="font-medium">
                                      {recipient.name}
                                    </Text>
                                    <Text variant="span" className="text-gray-500 ml-2">
                                      ({recipient.email})
                                    </Text>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => {
                                setCardRecipientAssignments(
                                  (prev: Record<string, CardRecipientAssignment>) => {
                                    const newAssignments = { ...prev }
                                    delete newAssignments[key]
                                    return newAssignments
                                  },
                                )
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Total Amount */}
                {Object.keys(cardRecipientAssignments).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <Text variant="span" weight="semibold" className="text-gray-900">
                        Total Amount:
                      </Text>
                      <Text variant="span" weight="bold" className="text-lg text-primary-600">
                        {formatCurrency(
                          (
                            Object.values(cardRecipientAssignments) as CardRecipientAssignment[]
                          ).reduce(
                            (sum: number, assignment: CardRecipientAssignment) =>
                              sum + (assignment.cardPrice || 0) * assignment.recipientIds.length,
                            0,
                          ),
                          'GHS',
                        )}
                      </Text>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={handleBackToVendors}>
                    Back
                  </Button>
                  {Object.keys(cardRecipientAssignments).length > 0 && (
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        await handleSaveToCart()
                        handleCloseAndNavigate('/checkout')
                      }}
                      disabled={
                        Object.keys(cardRecipientAssignments).length === 0 ||
                        addToCartMutation.isPending
                      }
                      loading={addToCartMutation.isPending}
                    >
                      Save & Checkout
                    </Button>
                  )}
                  {Object.keys(cardRecipientAssignments).length === 0 && hasExistingCartItems && (
                    <Button
                      variant="secondary"
                      onClick={() => handleCloseAndNavigate('/checkout')}
                      disabled={!cartId}
                    >
                      Proceed to Checkout
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Action Buttons - Bottom of Modal (hide while checking for recipients) */}
        {step === 1 && !existingRecipientsLoading && (
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 mt-auto">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {choiceMade === 'add' && (
              <Button variant="outline" onClick={handleProceedToSelectCards}>
                Proceed to select cards
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleUpload}
              disabled={!file || uploadMutation.isPending}
              loading={uploadMutation.isPending}
            >
              {choiceMade === 'add' ? 'Upload & Add more' : 'Upload & Continue'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

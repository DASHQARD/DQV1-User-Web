import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/libs'
import PurchaseModal from '@/components/PurchaseModal/PurchaseModal'
import { ROUTES } from '@/utils/constants'

interface Recipient {
  name: string
  phone: string
  email?: string
  message?: string
  amount: number
}

interface PurchaseProps {
  recipients?: Recipient[]
  onRecipientsUpdated?: (data: {
    totalCount: number
    totalAmount: number
    recipients: Recipient[]
  }) => void
}

export default function Purchase({
  recipients: initialRecipients = [],
  onRecipientsUpdated,
}: PurchaseProps) {
  const [recipients, setRecipients] = useState<Recipient[]>(initialRecipients)
  const [showModal, setShowModal] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null)
  const [editingIndex, setEditingIndex] = useState(-1)
  const [isProcessing, setIsProcessing] = useState(false)

  const openAddModal = () => {
    setEditingRecipient(null)
    setEditingIndex(-1)
    setShowModal(true)
  }

  const editRecipient = (recipient: Recipient, index: number) => {
    setEditingRecipient({ ...recipient })
    setEditingIndex(index)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingRecipient(null)
    setEditingIndex(-1)
  }

  const saveRecipient = (recipientData: Recipient) => {
    const updatedRecipients = [...recipients]

    if (editingIndex >= 0) {
      // Edit existing recipient
      updatedRecipients[editingIndex] = recipientData
    } else {
      // Add new recipient
      if (updatedRecipients.length >= 3) {
        alert('Maximum 3 recipients allowed for single purchase')
        return
      }
      updatedRecipients.push(recipientData)
    }

    // Calculate totals
    const totalCount = updatedRecipients.length
    const totalAmount = updatedRecipients.reduce(
      (sum, recipient) => sum + Number(recipient.amount),
      0,
    )

    setRecipients(updatedRecipients)
    onRecipientsUpdated?.({
      totalCount,
      totalAmount,
      recipients: updatedRecipients,
    })

    closeModal()
  }

  const removeRecipient = (index: number) => {
    if (confirm('Are you sure you want to remove this recipient?')) {
      const updatedRecipients = recipients.filter((_, i) => i !== index)

      const totalCount = updatedRecipients.length
      const totalAmount = updatedRecipients.reduce(
        (sum, recipient) => sum + Number(recipient.amount),
        0,
      )

      setRecipients(updatedRecipients)
      onRecipientsUpdated?.({
        totalCount,
        totalAmount,
        recipients: updatedRecipients,
      })
    }
  }

  const clearAllRecipients = () => {
    if (confirm('Are you sure you want to remove all recipients?')) {
      setRecipients([])
      onRecipientsUpdated?.({
        totalCount: 0,
        totalAmount: 0,
        recipients: [],
      })
    }
  }

  // Calculate summary values
  const recipientCount = recipients.length
  const totalAmount = recipients.reduce((sum, recipient) => sum + Number(recipient.amount), 0)
  const feesAmount = totalAmount * 0.05 // 5% service fee
  const totalAmountPlusFees = totalAmount + feesAmount

  const previewCards = () => {
    // TODO: Implement preview cards functionality
    console.log('Preview cards clicked', recipients)
  }

  const proceedToCheckout = async () => {
    if (recipients.length === 0 || isProcessing) return

    setIsProcessing(true)
    try {
      // TODO: Implement checkout functionality
      console.log('Proceeding to checkout', {
        recipients,
        totalAmount,
        feesAmount,
        totalAmountPlusFees,
      })
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-full">
      {/* Bulk Purchase Navigation */}
      <section className="flex flex-col lg:flex-row justify-between gap-4">
        <div className="max-w-[672px] w-full">
          <div className="mb-6">
            <Link
              to={ROUTES.IN_APP.DASHBOARD.HOME + '/gift/dashpro/bulk'}
              className="inline-flex items-center justify-center w-full px-5 py-3 bg-gradient-to-br from-[rgba(64,45,135,0.08)] to-[rgba(64,45,135,0.05)] text-[#402D87] no-underline rounded-xl font-semibold text-sm transition-all duration-300 border border-[rgba(64,45,135,0.15)] relative overflow-hidden hover:bg-gradient-to-br hover:from-[rgba(64,45,135,0.12)] hover:to-[rgba(64,45,135,0.08)] hover:text-[#402D87] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(64,45,135,0.15)] hover:border-[rgba(64,45,135,0.25)] active:translate-y-0"
            >
              <Icon icon="bi:people-fill" className="mr-2 text-base" />
              Need more than 3 recipients? Try Bulk Purchase
              <Icon
                icon="bi:arrow-right"
                className="ml-2 text-base transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
          {/* Recipients Section */}
          <div className="bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[rgba(64,45,135,0.1)] mb-6 overflow-hidden">
            <div className="bg-gradient-to-br from-[rgba(64,45,135,0.05)] to-[rgba(64,45,135,0.02)] px-8 py-6 border-b border-[rgba(64,45,135,0.1)]">
              <div className="flex justify-between items-center gap-5">
                <div className="flex items-center gap-3 flex-1">
                  <Icon icon="bi:people" className="text-xl text-[#402D87]" />
                  <h4 className="text-xl font-bold text-[#2c3e50] m-0">Recipients Summary</h4>
                  {recipients.length > 0 && (
                    <span className="bg-[rgba(64,45,135,0.1)] text-[#402D87] px-3 py-1 rounded-full text-xs font-semibold">
                      {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 border-none flex items-center bg-gradient-to-br from-[#402D87] to-[#2d1a72] text-white hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(64,45,135,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={openAddModal}
                    disabled={recipients.length >= 3}
                  >
                    <Icon icon="bi:plus-circle" className="mr-2" />
                    Add Recipient
                  </button>
                  {recipients.length > 0 && (
                    <button
                      className="px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 border-none flex items-center bg-[rgba(220,38,38,0.1)] text-[#dc2626] hover:bg-[rgba(220,38,38,0.2)]"
                      onClick={clearAllRecipients}
                    >
                      <Icon icon="bi:trash" className="mr-2" />
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8">
              {recipients.length > 0 ? (
                <div>
                  <div className="flex flex-col gap-4 mb-5">
                    {recipients.map((recipient, index) => (
                      <div
                        key={index}
                        className="bg-[rgba(64,45,135,0.02)] border border-[rgba(64,45,135,0.1)] rounded-2xl p-5 transition-all duration-300 hover:border-[rgba(64,45,135,0.2)] hover:shadow-[0_4px_20px_rgba(64,45,135,0.1)]"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#402D87] to-[#2d1a72] text-white flex items-center justify-center text-lg font-bold shrink-0">
                            {recipient.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-base font-bold text-[#2c3e50] mb-1.5">
                              {recipient.name}
                            </div>
                            <div className="flex flex-col gap-1 mb-2">
                              <span className="text-sm text-[#757575] font-semibold">
                                {recipient.phone}
                              </span>
                              {recipient.email && (
                                <span className="text-sm text-[#757575]">{recipient.email}</span>
                              )}
                            </div>
                            {recipient.message && (
                              <div className="text-[13px] text-[#757575] italic bg-[rgba(64,45,135,0.05)] px-3 py-2 rounded-lg border-l-[3px] border-[#402D87]">
                                "{recipient.message}"
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-lg font-bold text-[#402D87]">
                              GHS {Number(recipient.amount).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2.5 justify-end">
                          <button
                            className="px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 border-none flex items-center bg-[rgba(59,130,246,0.1)] text-[#3b82f6] hover:bg-[rgba(59,130,246,0.2)]"
                            onClick={() => editRecipient(recipient, index)}
                            title="Edit recipient"
                          >
                            <Icon icon="bi:pencil" className="mr-1" />
                            Edit
                          </button>
                          <button
                            className="px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 border-none flex items-center bg-[rgba(220,38,38,0.1)] text-[#dc2626] hover:bg-[rgba(220,38,38,0.2)]"
                            onClick={() => removeRecipient(index)}
                            title="Remove recipient"
                          >
                            <Icon icon="bi:trash" className="mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recipient Limit Warning */}
                  {recipients.length >= 3 && (
                    <div className="bg-[rgba(184,134,11,0.1)] text-[#B8860B] px-4 py-3 rounded-[10px] text-[13px] flex items-center border-l-[4px] border-[#ffc400]">
                      <Icon icon="bi:info-circle" className="mr-2" />
                      You've reached the maximum of 3 recipients for single purchase. Use bulk
                      purchase for more recipients.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 px-5">
                  <div className="w-20 h-20 rounded-[20px] bg-[rgba(64,45,135,0.1)] flex items-center justify-center mx-auto mb-5">
                    <Icon icon="bi:person-plus" className="text-3xl text-[#402D87]" />
                  </div>
                  <h5 className="text-lg font-bold text-[#2c3e50] mb-2">No recipients added yet</h5>
                  <p className="text-sm text-[#757575] mb-6">
                    Click "Add Recipient" to start creating gift cards
                  </p>
                  <button
                    className="bg-gradient-to-br from-[#402D87] to-[#2d1a72] text-white px-6 py-3.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all duration-300 inline-flex items-center hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(64,45,135,0.3)]"
                    onClick={openAddModal}
                  >
                    <Icon icon="bi:plus-circle" className="mr-2" />
                    Add Your First Recipient
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Order Summary Section */}
        <div className="w-full max-w-full lg:max-w-[400px] xl:max-w-[450px] mt-8 lg:mt-0 xl:sticky xl:top-6 xl:self-start">
          <div className="bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[rgba(64,45,135,0.1)] overflow-hidden relative z-10 w-full">
            {/* Section Header */}
            <div className="bg-gradient-to-br from-[rgba(64,45,135,0.05)] to-[rgba(64,45,135,0.02)] px-6 py-5 border-b border-[rgba(64,45,135,0.1)] flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#402D87] to-[#2d2060] rounded-xl flex items-center justify-center shrink-0">
                <Icon icon="bi:receipt" className="text-xl text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-[#2c3e50] m-0 mb-1">Order Summary</h4>
                <p className="text-sm text-[#757575] m-0">Review your purchase details</p>
              </div>
            </div>

            {/* Summary Content */}
            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-[rgba(64,45,135,0.02)] rounded-xl border border-[rgba(64,45,135,0.1)]">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-[rgba(64,45,135,0.1)] text-[#402D87]">
                    <Icon icon="bi:people-fill" className="text-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-[#757575] mb-0.5 uppercase tracking-wider">
                      Recipients
                    </div>
                    <div className="text-base font-bold text-[#2c3e50]">{recipientCount}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[rgba(64,45,135,0.02)] rounded-xl border border-[rgba(64,45,135,0.1)]">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-[rgba(255,199,10,0.2)] text-[#C09600]">
                    <Icon icon="bi:currency-dollar" className="text-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-[#757575] mb-0.5 uppercase tracking-wider">
                      Total Amount
                    </div>
                    <div className="text-base font-bold text-[#2c3e50]">
                      GHS {totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[rgba(64,45,135,0.02)] rounded-xl border border-[rgba(64,45,135,0.1)]">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-[rgba(59,130,246,0.2)] text-[#3b82f6]">
                    <Icon icon="bi:calculator" className="text-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-[#757575] mb-0.5 uppercase tracking-wider">
                      Service Fee (5%)
                    </div>
                    <div className="text-base font-bold text-[#2c3e50]">
                      GHS {feesAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipients Preview */}
              {recipients.length > 0 && (
                <div className="mb-6">
                  <div className="mb-4">
                    <h6 className="text-sm font-semibold text-[#2c3e50] m-0 flex items-center">
                      <Icon icon="bi:eye" className="mr-2" />
                      Recipients Preview
                    </h6>
                  </div>

                  <div className="flex flex-col gap-3">
                    {recipients.slice(0, 3).map((recipient, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-[rgba(64,45,135,0.02)] rounded-[10px] border border-[rgba(64,45,135,0.1)]"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#402D87] to-[#2d2060] text-white flex items-center justify-center text-sm font-semibold">
                          {recipient.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-[#2c3e50] mb-0.5">
                            {recipient.name}
                          </div>
                          <div className="text-xs text-[#757575]">
                            GHS {Number(recipient.amount).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}

                    {recipients.length > 3 && (
                      <div className="flex items-center gap-3 p-3 bg-[rgba(64,45,135,0.02)] rounded-[10px] border border-[rgba(64,45,135,0.1)]">
                        <div className="w-9 h-9 rounded-lg bg-[rgba(117,117,117,0.2)] text-[#757575] flex items-center justify-center text-xs font-semibold">
                          +{recipients.length - 3}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-[#2c3e50] mb-0.5">
                            More recipients
                          </div>
                          <div className="text-xs text-[#757575]">{recipients.length - 3} more</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <div className="bg-[rgba(64,45,135,0.02)] border border-[rgba(64,45,135,0.1)] rounded-xl p-5 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-[#757575] font-medium">Subtotal</span>
                  <span className="text-sm font-semibold text-[#2c3e50]">
                    GHS {totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-[#757575] font-medium">Service Fee (5%)</span>
                  <span className="text-sm font-semibold text-[#2c3e50]">
                    GHS {feesAmount.toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-[rgba(64,45,135,0.1)] my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-[#2c3e50]">Total Amount</span>
                  <span className="text-lg font-bold text-[#402D87]">
                    GHS {totalAmountPlusFees.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  className="w-full px-5 py-4 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 border-none flex items-center justify-center bg-[rgba(117,117,117,0.1)] text-[#757575] border border-[rgba(117,117,117,0.2)] hover:bg-[rgba(117,117,117,0.2)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={previewCards}
                  disabled={recipients.length === 0}
                >
                  <Icon icon="bi:eye" className="mr-2" />
                  Preview Cards
                </button>

                <button
                  className="w-full px-5 py-4 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 border-none flex items-center justify-center bg-gradient-to-br from-[#402D87] to-[#2d2060] text-white relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(64,45,135,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={proceedToCheckout}
                  disabled={recipients.length === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <Icon icon="bi:arrow-clockwise" className="text-base animate-spin" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Icon icon="bi:credit-card" className="mr-2" />
                      Proceed to Checkout
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add/Edit Recipient Modal */}
      <PurchaseModal
        isOpen={showModal}
        initialData={editingRecipient}
        onSave={saveRecipient}
        onClose={closeModal}
        showTrigger={false}
      />
    </div>
  )
}

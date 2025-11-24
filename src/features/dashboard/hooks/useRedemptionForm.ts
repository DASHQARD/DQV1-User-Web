import { useState, useEffect, useMemo } from 'react'

interface RedemptionForm {
  redemptionAmount: number | null
  vendorPhone: string
}

interface UserInfo {
  name?: string
  phone?: string
  email?: string
}

export function useRedemptionForm() {
  const [form, setForm] = useState<RedemptionForm>({
    redemptionAmount: null,
    vendorPhone: '',
  })
  const [rawVendor, setRawVendor] = useState('')
  const [validatingVendor, setValidatingVendor] = useState(false)
  const [vendorError, setVendorError] = useState<string | null>(null)
  const [vendorName, setVendorName] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceCheckComplete, setBalanceCheckComplete] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [showSummaryModal, setShowSummaryModal] = useState(false)

  // Validate vendor phone number
  useEffect(() => {
    if (rawVendor && rawVendor.length >= 10) {
      setValidatingVendor(true)
      setVendorError(null)

      // Simulate vendor validation API call
      const timer = setTimeout(() => {
        // Mock validation - in real app, this would be an API call
        if (rawVendor.includes('233')) {
          setVendorName('Verified Vendor')
          setVendorError(null)
          setForm((prev) => ({ ...prev, vendorPhone: rawVendor }))
        } else {
          setVendorError('Vendor not found. Please check the phone number.')
          setVendorName(null)
        }
        setValidatingVendor(false)
      }, 1500)

      return () => clearTimeout(timer)
    } else if (rawVendor && rawVendor.length > 0) {
      setVendorName(null)
      setVendorError(null)
    }
  }, [rawVendor])

  // Check balance when amount is entered
  useEffect(() => {
    if (form.redemptionAmount && form.redemptionAmount > 0) {
      // Simulate balance check
      setBalanceCheckComplete(false)
      setBalanceError(null)

      const timer = setTimeout(() => {
        // Mock balance - in real app, this would be an API call
        const mockBalance = 1250.75
        setBalance(mockBalance)

        if (mockBalance >= form.redemptionAmount!) {
          setBalanceError(null)
        } else {
          setBalanceError('Insufficient balance')
        }
        setBalanceCheckComplete(true)
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      setBalanceCheckComplete(false)
      setBalanceError(null)
    }
  }, [form.redemptionAmount])

  const isFormValid = useMemo(() => {
    return (
      vendorName !== null &&
      !vendorError &&
      form.redemptionAmount !== null &&
      form.redemptionAmount > 0 &&
      balanceCheckComplete &&
      !balanceError
    )
  }, [vendorName, vendorError, form.redemptionAmount, balanceCheckComplete, balanceError])

  const clearForm = () => {
    setForm({
      redemptionAmount: null,
      vendorPhone: '',
    })
    setRawVendor('')
    setVendorName(null)
    setVendorError(null)
    setBalance(null)
    setBalanceCheckComplete(false)
    setBalanceError(null)
  }

  const submitRedemption = async (userInfo?: UserInfo) => {
    console.log(userInfo)
    if (!isFormValid) return

    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call
      // await api.post('/redemption', { ...form, userInfo })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setShowSummaryModal(true)
    } catch (error) {
      console.error('Redemption submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    rawVendor,
    setRawVendor,
    validatingVendor,
    vendorError,
    vendorName,
    isFormValid,
    isSubmitting,
    submitRedemption,
    clearForm,
    balance,
    balanceCheckComplete,
    balanceError,
    showSummaryModal,
    setShowSummaryModal,
    setForm,
  }
}

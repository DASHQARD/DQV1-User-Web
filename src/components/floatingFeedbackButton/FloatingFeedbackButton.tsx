import { useState, useEffect, useCallback } from 'react'

import { cn, Icon } from '@/libs'
import {
  submitFeedback,
  createFeedbackPayload,
  type FeedbackFormData,
  type FeedbackType,
} from '@/services/feedback'

type AlertType = 'success' | 'danger' | 'warning' | 'info'

const ALERT_CLASSES: Record<AlertType, string> = {
  success: 'bg-[#d1f2eb] text-[#0d7e5b] border-l-4 border-l-green-500',
  danger: 'bg-[#f8d7da] text-[#842029] border-l-4 border-l-red-500',
  warning: 'bg-[#fff3cd] text-[#664d03] border-l-4 border-l-amber-400',
  info: 'bg-[#cff4fc] text-[#055160] border-l-4 border-l-cyan-500',
}

const ALERT_ICONS: Record<AlertType, string> = {
  success: 'bi:check-circle-fill',
  danger: 'bi:exclamation-triangle-fill',
  info: 'bi:info-circle-fill',
  warning: 'bi:exclamation-circle-fill',
}

const TYPE_OPTIONS: { type: FeedbackType; label: string; icon: string }[] = [
  { type: 'bug', label: 'Bug Report', icon: 'bi:bug-fill' },
  { type: 'feature', label: 'Feature Request', icon: 'bi:lightbulb-fill' },
  { type: 'general', label: 'General', icon: 'bi:chat-heart-fill' },
  { type: 'ui', label: 'UI/UX', icon: 'bi:palette-fill' },
]

const initialFormData: FeedbackFormData = {
  rating: 0,
  type: '',
  message: '',
  email: '',
}

export function FloatingFeedbackButton() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [shouldPulse, setShouldPulse] = useState(false)
  const [feedbackData, setFeedbackData] = useState<FeedbackFormData>(initialFormData)
  const [alertData, setAlertData] = useState<{
    show: boolean
    type: AlertType
    message: string
  }>({ show: false, type: 'success', message: '' })

  useEffect(() => {
    const start = window.setTimeout(() => {
      setShouldPulse(true)
      const stop = window.setTimeout(() => setShouldPulse(false), 10000)
      return () => clearTimeout(stop)
    }, 30000)
    return () => clearTimeout(start)
  }, [])

  const openFeedbackModal = useCallback(() => {
    setShowFeedbackModal(true)
    setShouldPulse(false)
  }, [])

  const closeFeedbackModal = useCallback(() => {
    setShowFeedbackModal(false)
    setFeedbackData(initialFormData)
  }, [])

  const setRating = useCallback((rating: number) => {
    setFeedbackData((prev) => ({ ...prev, rating }))
  }, [])

  const showAlert = useCallback((message: string, type: AlertType = 'success', autoHide = true) => {
    setAlertData({ show: true, type, message })
    if (autoHide) {
      setTimeout(() => setAlertData((a) => ({ ...a, show: false })), 4000)
    }
  }, [])

  const hideAlert = useCallback(() => {
    setAlertData((a) => ({ ...a, show: false }))
  }, [])

  const submitFeedbackForm = useCallback(async () => {
    if (!feedbackData.message.trim() || !feedbackData.type) return
    setIsSubmittingFeedback(true)
    try {
      const payload = createFeedbackPayload(feedbackData)
      await submitFeedback(payload)
      showAlert('🎉 Thank you for your feedback! We appreciate your input.', 'success')
      closeFeedbackModal()
    } catch (err: unknown) {
      let errorMessage = 'Sorry, there was an error submitting your feedback. Please try again.'
      const error = err as {
        response?: { status: number; data?: { message?: string } }
        code?: string
      }
      if (error.response) {
        const { status, data } = error.response
        if (status === 400) {
          errorMessage = data?.message ?? 'Please check your input and try again.'
        } else if (status === 429) {
          errorMessage = 'Too many requests. Please wait a moment and try again.'
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        }
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and try again.'
      }
      showAlert(errorMessage, 'danger')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }, [feedbackData, showAlert, closeFeedbackModal])

  const typeOptionBase =
    'flex flex-col items-center py-3 px-2 sm:py-2 sm:px-1 border-2 rounded-lg cursor-pointer transition-all duration-300 bg-white border-gray-200 hover:border-[#e91e63] hover:bg-[#e91e63]/5 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(233,30,99,0.1)]'
  const typeOptionActive =
    'border-[#e91e63] bg-[#e91e63]/10 shadow-[0_4px_12px_rgba(233,30,99,0.15)]'

  return (
    <div className="fixed z-1000 right-[15px] bottom-[130px] sm:right-[20px] sm:bottom-[140px] md:right-[30px] md:bottom-[120px]">
      <button
        type="button"
        className={cn(
          'flex items-center justify-center w-[50px] h-[50px] sm:w-[55px] sm:h-[55px] md:w-[60px] md:h-[60px] rounded-full bg-linear-to-br from-[#e91e63] to-[#ad1457] text-white border-none cursor-pointer text-xl sm:text-[22px] md:text-2xl transition-all duration-300 relative shadow-[0_4px_20px_rgba(233,30,99,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(233,30,99,0.5)] hover:from-[#f06292] hover:to-[#c2185b] active:-translate-y-px active:shadow-[0_3px_15px_rgba(233,30,99,0.4)]',
          shouldPulse && 'feedback-btn-pulse',
        )}
        title="Share your feedback"
        onClick={openFeedbackModal}
      >
        <Icon icon="bi:chat-heart" className="text-2xl text-white" />
      </button>

      {showFeedbackModal && (
        <div
          className="fixed inset-0 z-1060 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeFeedbackModal}
          role="presentation"
        >
          <div
            className="feedback-modal-animate w-[90%] max-w-[500px] max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:w-[95%] sm:m-5"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="flex justify-between items-center px-6 py-6 sm:px-5 sm:py-5 border-b border-gray-200 bg-linear-to-br from-[#e91e63]/5 to-[#ad1457]/5">
              <h5 className="text-[#e91e63] text-xl font-semibold m-0 flex items-center sm:text-lg">
                <Icon icon="bi:chat-heart" className="text-[#e91e63] mr-2 size-5" />
                Share Your Feedback
              </h5>
              <button
                type="button"
                className="bg-transparent border-none text-xl text-gray-500 cursor-pointer p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 hover:text-gray-800"
                onClick={closeFeedbackModal}
                aria-label="Close"
              >
                <Icon icon="bi:x" className="size-5" />
              </button>
            </div>

            {alertData.show && (
              <div className="px-6 pt-5 sm:px-5">
                <div
                  className={cn(
                    'rounded-lg border-none text-sm py-3 px-4 flex items-center justify-between gap-2',
                    ALERT_CLASSES[alertData.type],
                  )}
                  role="alert"
                >
                  <div className="flex items-center min-w-0">
                    <Icon
                      icon={ALERT_ICONS[alertData.type]}
                      className="text-base shrink-0 mr-2 size-4"
                    />
                    <span className="truncate">{alertData.message}</span>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 w-4 h-4 flex items-center justify-center text-inherit opacity-70 hover:opacity-100"
                    aria-label="Close"
                    onClick={hideAlert}
                  >
                    <Icon icon="bi:x-lg" className="size-3" />
                  </button>
                </div>
              </div>
            )}

            <div className="px-6 py-6 max-h-[60vh] overflow-y-auto sm:px-5 sm:py-5">
              <div className="mb-6">
                <label className="block font-semibold text-gray-800 mb-3">
                  How would you rate your experience?
                </label>
                <div className="flex gap-2 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={cn(
                        'bg-transparent border-none p-1 rounded text-[28px] sm:text-2xl text-gray-300 cursor-pointer transition-all duration-200 hover:text-amber-400 hover:scale-110',
                        star <= feedbackData.rating && 'text-amber-400',
                      )}
                      onClick={() => setRating(star)}
                    >
                      <Icon icon="bi:star-fill" className="size-7 sm:size-6" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block font-semibold text-gray-800 mb-2">Feedback Type *</label>
                  <div className="grid grid-cols-4 sm:grid-cols-2 gap-2 mb-5 sm:gap-1.5 sm:mb-5">
                    {TYPE_OPTIONS.map(({ type, label, icon }) => (
                      <div
                        key={type}
                        className={cn(
                          typeOptionBase,
                          feedbackData.type === type && typeOptionActive,
                        )}
                        onClick={() => setFeedbackData((prev) => ({ ...prev, type }))}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setFeedbackData((prev) => ({ ...prev, type }))
                          }
                        }}
                      >
                        <span
                          className={cn(
                            'text-lg sm:text-base text-gray-500 mb-1.5 transition-all duration-300',
                            feedbackData.type === type && 'text-[#e91e63] scale-105',
                          )}
                        >
                          <Icon icon={icon} className="size-5 sm:size-4" />
                        </span>
                        <span
                          className={cn(
                            'text-[10px] sm:text-[9px] font-medium text-gray-600 text-center leading-tight transition-all duration-300',
                            feedbackData.type === type && 'text-[#e91e63] font-semibold',
                          )}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-2">
                    What can we improve?
                  </label>
                  <textarea
                    value={feedbackData.message}
                    onChange={(e) =>
                      setFeedbackData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    rows={4}
                    className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg text-sm transition-all duration-300 resize-y min-h-[100px] placeholder:text-gray-400 focus:outline-none focus:border-[#e91e63] focus:ring-[3px] focus:ring-[#e91e63]/10"
                    placeholder="Tell us about your experience and how we can make it better..."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-2">Email (optional)</label>
                  <input
                    type="email"
                    value={feedbackData.email}
                    onChange={(e) =>
                      setFeedbackData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg text-sm transition-all duration-300 placeholder:text-gray-400 focus:outline-none focus:border-[#e91e63] focus:ring-[3px] focus:ring-[#e91e63]/10"
                    placeholder="your.email@example.com"
                  />
                  <small className="block text-xs text-gray-500 mt-1.5">
                    We'll only use this to follow up on your feedback
                  </small>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:justify-end gap-3 px-6 py-5 sm:px-5 sm:py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg font-semibold text-sm border-none cursor-pointer transition-all duration-300 inline-flex items-center bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed md:order-2 w-full md:w-auto"
                onClick={closeFeedbackModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg font-semibold text-sm border-none cursor-pointer transition-all duration-300 inline-flex items-center bg-linear-to-br from-[#e91e63] to-[#ad1457] text-white shadow-[0_2px_8px_rgba(233,30,99,0.3)] hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(233,30,99,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[0_2px_8px_rgba(233,30,99,0.3)] w-full md:w-auto md:order-1"
                disabled={
                  !feedbackData.message.trim() || !feedbackData.type || isSubmittingFeedback
                }
                onClick={submitFeedbackForm}
              >
                {isSubmittingFeedback ? (
                  <span className="inline-flex items-center">
                    <Icon icon="bi:arrow-clockwise" className="animate-spin mr-1 size-4" />
                    Sending...
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    <Icon icon="bi:send" className="mr-1 size-4" />
                    Send Feedback
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

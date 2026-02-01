import { Modal, Text } from '@/components'
import { Icon } from '@/libs'
import { MODAL_NAMES } from '@/utils/constants'
import { usePersistedModalState } from '@/hooks'

export default function EmailSentModal() {
  const modal = usePersistedModalState<{ email?: string }>({
    paramName: MODAL_NAMES.AUTH.EMAIL_SENT,
  })
  const userEmail = modal.modalData?.email ?? ''

  return (
    <Modal
      isOpen={modal.isModalOpen(MODAL_NAMES.AUTH.EMAIL_SENT)}
      setIsOpen={modal.closeModal}
      panelClass="max-w-md"
    >
      <div className="p-8">
        {/* Success Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Icon icon="bi:check-circle-fill" className="text-4xl text-white" />
          </div>
          <Text as="h2" className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Registration Successful!
          </Text>
          <Text className="text-sm text-gray-600 text-center">
            We've sent a verification link to your email
          </Text>
        </div>

        {/* Email Display Card */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <div className="flex items-start gap-3">
            <Icon icon="bi:envelope-fill" className="size-5 text-primary-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <Text className="text-xs text-gray-500 mb-1">Verification email sent to:</Text>
              <Text className="text-sm font-semibold text-gray-900 break-all">{userEmail}</Text>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
          <div className="flex items-start gap-3">
            <Icon icon="bi:info-circle-fill" className="size-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <Text className="text-sm text-blue-900 font-medium mb-1">Next Steps:</Text>
              <ul className="text-sm text-blue-800 space-y-1.5 list-disc list-inside">
                <li>Check your inbox and click the verification link</li>
                <li>If you don't see the email, check your spam folder</li>
                <li>Once verified, you can log in to your account</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

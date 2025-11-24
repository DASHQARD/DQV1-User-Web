import { Modal } from '@/components'
import { Icon } from '@/libs'
import { Button } from '@/components/Button'

interface RedemptionSummaryProps {
  isOpen: boolean
  onClose: () => void
  isRegisteredUser?: boolean
}

export default function RedemptionSummary({
  isOpen,
  onClose,
  isRegisteredUser = true,
}: RedemptionSummaryProps) {
  return (
    <Modal isOpen={isOpen} setIsOpen={onClose} panelClass="!max-w-[600px]">
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="bi:check-circle-fill" className="text-3xl text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1E293B] mb-2">Redemption Summary</h2>
          <p className="text-[#64748B]">Your redemption request has been submitted successfully</p>
        </div>

        <div className="bg-[#F8FAFC] rounded-xl p-4 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#64748B]">Status</span>
              <span className="text-sm font-semibold text-[#10B981]">Processing</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#64748B]">User Type</span>
              <span className="text-sm font-semibold text-[#1E293B]">
                {isRegisteredUser ? 'Registered User' : 'Guest'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

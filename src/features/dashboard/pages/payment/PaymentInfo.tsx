import { Icon } from '@/libs'
import { PaymentInfoForm } from '../../components'
import { useUserProfile } from '@/hooks'

export default function PaymentInfo() {
  const { data: userProfile } = useUserProfile()
  console.log('userProfile', userProfile)
  return (
    <div className="bg-[#f8f9fa] rounded-[32px] p-4 sm:p-8 min-h-[600px]">
      <div className="max-w-4xl mx-auto bg-white rounded-[32px] shadow-[0_20px_60px_rgba(64,45,135,0.08)] border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-br from-[#f5f1ff] via-white to-[#fdf9ff] px-6 sm:px-10 py-8 border-b border-gray-100">
          <div className="flex flex-wrap gap-5 items-start">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#402D87] to-[#8d3cff] flex items-center justify-center text-white shadow-lg shadow-[#402D87]/25">
              <Icon icon="bi:credit-card-fill" className="text-2xl" />
            </div>

            <div className="flex-1 min-w-[220px]">
              <h2 className="text-3xl font-bold text-[#1f2937] mb-2">Payment Methods</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Keep your payout information up to date.
                <span className="block">
                  We use this data to process vendor and corporate settlements securely.
                </span>
              </p>

              <div className="flex flex-wrap gap-3 mt-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-white text-sm text-[#402D87] font-semibold shadow-sm">
                  <Icon icon="bi:shield-lock" className="text-base" />
                  Bank-level encryption
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-white text-sm text-[#402D87] font-semibold shadow-sm">
                  <Icon icon="bi:clock-history" className="text-base" />
                  Auto-settlement ready
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-4 sm:px-10 py-8 bg-white">
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-5 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <PaymentInfoForm />
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#f3e9ff] flex items-center justify-center text-[#402D87]">
                <Icon icon="bi:info-circle" className="text-lg" />
              </div>
              <p className="leading-relaxed">
                Payments are processed within 1-2 business days once your account is verified.
                <span className="block">Ensure details match your bank records.</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#e3f5ff] flex items-center justify-center text-[#0f6abf]">
                <Icon icon="bi:check-circle" className="text-lg" />
              </div>
              <p className="leading-relaxed">
                Mobile money numbers should be registered to your business name.
                <span className="block">Double-check before saving to avoid payout delays.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

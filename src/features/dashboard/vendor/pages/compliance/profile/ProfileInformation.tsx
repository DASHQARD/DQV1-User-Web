import { Text } from '@/components'
import { OnboardingForm } from '@/features/auth'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'

export default function ProfileInformation() {
  const navigate = useNavigate()

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-start gap-3 flex-col border-b border-[#CDD3D3] pb-4">
        <button
          className="flex gap-1 items-center text-[10px] text-[#95aac9]"
          onClick={() => navigate(-1)}
        >
          <Icon icon="bi:arrow-left-short" className="text-lg" />
          <Text variant="span" weight="medium">
            Compliance
          </Text>
        </button>
        <Text variant="h2" weight="medium">
          Profile Settings
        </Text>
      </div>

      <div className="bg-white border border-[#CDD3D3] rounded-xl p-8">
        <OnboardingForm />
      </div>
    </section>
  )
}

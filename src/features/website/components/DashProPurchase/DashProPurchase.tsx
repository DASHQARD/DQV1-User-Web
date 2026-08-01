import { Button } from '@/components'
import DashProBG from '@/assets/svgs/dashpro_bg.svg'
import { EXAMPLE_PHONE_PLACEHOLDER_E164 } from '@/utils/constants'
import { useDashProPurchase } from '../../hooks/useDashProPurchase'
import {
  AssignToSelfToggle,
  GiftCardAmountSection,
  GiftCardFlipPreview,
  GiftCardRecipientFields,
  GiftCardRecipientFormActions,
  GiftCardRecipientFormHeader,
  getAssignToSelfDescription,
} from '@/components/GiftCardRecipientForm'

export default function DashProPurchase() {
  const {
    control,
    register,
    handleSubmit,
    errors,
    assignToSelf,
    handleAssignToSelf,
    isCardFlipped,
    isMobile,
    toggleCardFlip,
    displayedCardAmount,
    displayedCardRecipient,
    displayedCardMessage,
    onSubmit,
    isSubmitting,
  } = useDashProPurchase()

  return (
    <div className="w-full">
      <div className="w-full max-w-4xl">
        <GiftCardRecipientFormHeader
          title="Create DashPro gift card"
          subtitle="Set the amount, assign a recipient, and add a personal message"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <GiftCardFlipPreview
            cardTypeName="DashPro"
            backgroundImage={DashProBG}
            displayAmount={displayedCardAmount}
            displayRecipient={displayedCardRecipient}
            displayMessage={displayedCardMessage}
            isCardFlipped={isCardFlipped}
            isMobile={isMobile}
            onToggleFlip={toggleCardFlip}
          />

          <AssignToSelfToggle
            checked={assignToSelf}
            onChange={handleAssignToSelf}
            description={getAssignToSelfDescription({ assignToSelf })}
          />

          <GiftCardAmountSection control={control} name="amount" error={errors.amount?.message} />

          <GiftCardRecipientFields
            control={control}
            register={register}
            errors={errors}
            assignToSelf={assignToSelf}
            phonePlaceholder={EXAMPLE_PHONE_PLACEHOLDER_E164}
          />

          <GiftCardRecipientFormActions>
            <Button type="button" variant="outline" className="md:w-auto">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              className="md:w-auto"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Create DashPro Gift Card
            </Button>
          </GiftCardRecipientFormActions>
        </form>
      </div>
    </div>
  )
}

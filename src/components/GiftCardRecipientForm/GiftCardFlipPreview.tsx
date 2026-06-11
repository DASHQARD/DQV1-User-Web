import type { ReactNode } from 'react'
import { Icon } from '@/libs'
import { PURCHASE_WHATSAPP_HI_PROMPT } from '@/utils/constants'

type GiftCardFlipPreviewProps = {
  cardTypeName: string
  backgroundImage: string
  displayAmount: string
  displayRecipient: string
  displayMessage: string
  isCardFlipped: boolean
  isMobile: boolean
  onToggleFlip: () => void
  frontBottomRight?: ReactNode
  showFlipBackHint?: boolean
}

export function GiftCardFlipPreview({
  cardTypeName,
  backgroundImage,
  displayAmount,
  displayRecipient,
  displayMessage,
  isCardFlipped,
  isMobile,
  onToggleFlip,
  frontBottomRight,
  showFlipBackHint = true,
}: GiftCardFlipPreviewProps) {
  return (
    <section className="overflow-hidden border-b border-[#f1f3f4] bg-linear-to-br from-[#f8f9fa] to-[#e9ecef] px-4 py-5 sm:px-6 sm:py-8 md:px-10">
      <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-4 sm:gap-6">
        <h3 className="text-lg font-semibold text-[#212529] sm:text-xl">Card Preview</h3>
        <div className="flex min-w-0 justify-center">
          <div
            className="relative aspect-[16/10] w-full min-w-0 max-w-full overflow-hidden rounded-2xl sm:aspect-auto sm:h-[320px] sm:max-w-[520px] sm:perspective-[1000px]"
            onClick={onToggleFlip}
          >
            <div
              className={`relative h-full w-full min-w-0 transition-transform duration-700 sm:transform-3d ${
                isCardFlipped && !isMobile ? 'sm:transform-[rotateY(180deg)]' : ''
              }`}
            >
              <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-xl sm:backface-hidden">
                <img
                  src={backgroundImage}
                  alt={`${cardTypeName} background`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 grid min-w-0 grid-cols-2 grid-rows-[auto_1fr_auto] text-white">
                  <div className="truncate p-2 text-sm font-black tracking-wide sm:p-4 sm:text-2xl sm:tracking-[0.3em]">
                    {cardTypeName}
                  </div>
                  <div className="truncate p-2 text-right text-sm font-semibold sm:p-4 sm:text-2xl">
                    {displayAmount}
                  </div>
                  <div className="truncate p-2 text-xs font-semibold uppercase sm:p-4 sm:text-lg">
                    {displayRecipient}
                  </div>
                  <div className="flex items-end justify-end p-2 sm:p-4">{frontBottomRight}</div>
                </div>
                {!isMobile && (
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[11px] uppercase text-white">
                    <Icon icon="bi:arrow-repeat" className="size-4" />
                    Click to flip
                  </div>
                )}
              </div>

              <div className="absolute inset-0 hidden overflow-hidden rounded-2xl bg-white p-4 shadow-xl sm:block sm:backface-hidden sm:transform-[rotateY(180deg)] sm:p-6">
                <div className="flex h-full flex-col gap-4 text-sm text-[#333]">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-base font-semibold text-[#d25e8d]">
                      <Icon icon="bi:heart-fill" className="size-4" />
                      Personal Message
                    </div>
                    <p className="rounded-xl border border-yellow-200 bg-white/90 p-4 text-sm italic shadow-sm">
                      {displayMessage}
                    </p>
                    <p className="text-right text-xs text-gray-600">From: Sender Name</p>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2 text-base font-semibold text-green-600">
                      <Icon icon="bi:gift-fill" className="size-4" />
                      How to Redeem
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-green-200 bg-white/90 p-3 shadow-sm">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                          <Icon icon="bi:phone-fill" className="size-4" />
                          USSD Code
                        </div>
                        <p className="text-xs text-gray-600">1. Dial *800*0000#</p>
                        <p className="text-xs text-gray-600">2. Select “Redemption”</p>
                      </div>
                      <div className="rounded-lg border border-green-200 bg-white/90 p-3 shadow-sm">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                          <Icon icon="bi:whatsapp" className="size-4" />
                          WhatsApp
                        </div>
                        <p className="text-xs text-gray-600">1. {PURCHASE_WHATSAPP_HI_PROMPT}</p>
                        <p className="text-xs text-gray-600">2. Follow the prompts</p>
                      </div>
                    </div>
                  </div>

                  {!isMobile && showFlipBackHint && (
                    <div className="mt-auto flex items-center justify-center gap-2 text-[11px] uppercase text-gray-500">
                      <Icon icon="bi:arrow-repeat" className="size-4" />
                      Click to flip back
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

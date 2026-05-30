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
    <section className="border-b border-[#f1f3f4] bg-linear-to-br from-[#f8f9fa] to-[#e9ecef] px-10 py-8">
      <div className="flex flex-col gap-6">
        <h3 className="text-xl font-semibold text-[#212529]">Card Preview</h3>
        <div className="flex justify-center">
          <div
            className="relative h-[320px] w-full max-w-[520px] cursor-pointer perspective-[1000px]"
            onClick={onToggleFlip}
          >
            <div
              className={`relative h-full w-full transition-transform duration-700 transform-3d ${
                isCardFlipped && !isMobile ? 'transform-[rotateY(180deg)]' : ''
              }`}
            >
              <div className="absolute inset-0 rounded-2xl shadow-xl backface-hidden">
                <img
                  src={backgroundImage}
                  alt={`${cardTypeName} background`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-[auto_1fr_auto] text-white">
                  <div className="p-4 text-2xl font-black tracking-[0.3em]">{cardTypeName}</div>
                  <div className="p-4 text-right text-2xl font-semibold">{displayAmount}</div>
                  <div className="p-4 text-lg font-semibold uppercase">{displayRecipient}</div>
                  <div className="flex items-end justify-end p-4">{frontBottomRight}</div>
                </div>
                {!isMobile && (
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[11px] uppercase text-white">
                    <Icon icon="bi:arrow-repeat" className="size-4" />
                    Click to flip
                  </div>
                )}
              </div>

              <div className="absolute inset-0 rounded-2xl bg-white p-6 shadow-xl backface-hidden transform-[rotateY(180deg)]">
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

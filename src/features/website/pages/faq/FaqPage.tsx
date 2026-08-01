import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { FAQ_DATA, FAQ_SUPPORT_LINKS } from '../../data/faqData'

function questionKey(categoryIndex: number, itemIndex: number) {
  return `${categoryIndex}-${itemIndex}`
}

export default function FaqPage() {
  const [openCategoryIndex, setOpenCategoryIndex] = useState<number | null>(null)
  const [openQuestionKey, setOpenQuestionKey] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const toggleCategory = (index: number) => {
    if (openCategoryIndex === index) {
      setOpenCategoryIndex(null)
      setOpenQuestionKey(null)
      return
    }
    setOpenCategoryIndex(index)
    setOpenQuestionKey(null)
  }

  const toggleQuestion = (categoryIndex: number, itemIndex: number) => {
    const key = questionKey(categoryIndex, itemIndex)
    setOpenQuestionKey((prev) => (prev === key ? null : key))
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f8f9ff] to-white relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(64, 45, 135, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(91, 215, 220, 0.03) 0%, transparent 50%)
          `,
        }}
      />

      <section className="wrapper relative py-12 md:py-16" id="faq">
        <div className="text-center mb-10 md:mb-12">
          <div className="mb-4">
            <span className="inline-block rounded-full bg-linear-to-br from-primary-500 to-primary-700 px-6 py-2 text-sm font-semibold text-white shadow-[0_4px_15px_rgba(64,45,135,0.2)]">
              Got Questions?
            </span>
          </div>
          <h1 className="text-[clamp(2rem,5vw,2.5rem)] font-bold text-primary-500 mb-4 relative inline-block">
            Frequently Asked Questions
            <span
              className="absolute left-1/2 -translate-x-1/2 rounded-[2px] bottom-[-10px] w-20 h-1 bg-linear-to-r from-primary-500 to-[#5bd7dc]"
              aria-hidden
            />
          </h1>
          <p className="text-lg text-grey-500 max-w-xl mx-auto mt-6">
            Find answers to common questions about DashQard and our services
          </p>
        </div>

        <div className="max-w-[900px] mx-auto flex flex-col gap-4">
          {FAQ_DATA.map((category, catIndex) => {
            const isCategoryOpen = openCategoryIndex === catIndex
            return (
              <div
                key={category.title}
                className="bg-white rounded-2xl shadow-lg border border-primary-500/10 overflow-hidden transition-shadow hover:shadow-xl"
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(catIndex)}
                  className={`w-full px-6 md:px-8 py-5 flex justify-between items-center gap-4 text-left transition-colors ${
                    isCategoryOpen
                      ? 'bg-linear-to-br from-primary-500 to-primary-700 text-white'
                      : 'bg-linear-to-br from-primary-500/5 to-[#5bd7dc]/5 hover:from-primary-500/10 hover:to-[#5bd7dc]/10'
                  }`}
                  aria-expanded={isCategoryOpen}
                >
                  <div className="flex-1 min-w-0">
                    <h2
                      className={`text-lg md:text-xl font-semibold m-0 ${isCategoryOpen ? 'text-white' : 'text-primary-500'}`}
                    >
                      {category.title}
                    </h2>
                    <span
                      className={`text-sm font-medium ${isCategoryOpen ? 'text-white/80' : 'text-grey-500'}`}
                    >
                      {category.items.length} questions
                    </span>
                  </div>
                  <Icon
                    icon={isCategoryOpen ? 'bi:chevron-up' : 'bi:chevron-down'}
                    className={`size-5 shrink-0 ${isCategoryOpen ? 'text-white' : 'text-primary-500'}`}
                  />
                </button>

                {isCategoryOpen ? (
                  <div className="border-t border-primary-500/10">
                    {category.items.map((item, itemIndex) => {
                      const key = questionKey(catIndex, itemIndex)
                      const isQuestionOpen = openQuestionKey === key
                      return (
                        <div
                          key={key}
                          className="border-b border-primary-500/5 last:border-b-0"
                        >
                          <button
                            type="button"
                            onClick={() => toggleQuestion(catIndex, itemIndex)}
                            className={`w-full px-6 md:px-8 py-4 flex justify-between items-center gap-4 text-left transition-colors ${
                              isQuestionOpen ? 'bg-primary-500/5' : 'hover:bg-primary-500/[0.03]'
                            }`}
                            aria-expanded={isQuestionOpen}
                          >
                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                              <span className="size-8 md:size-9 shrink-0 rounded-full bg-primary-500/10 flex items-center justify-center">
                                <Icon
                                  icon="bi:question-circle-fill"
                                  className="size-4 text-primary-500"
                                />
                              </span>
                              <span className="text-base font-medium text-primary-500 leading-snug">
                                {item.q}
                              </span>
                            </div>
                            <Icon
                              icon={isQuestionOpen ? 'bi:chevron-up' : 'bi:chevron-down'}
                              className="size-4 shrink-0 text-primary-500"
                            />
                          </button>

                          {isQuestionOpen ? (
                            <div className="bg-primary-500/[0.02] border-t border-primary-500/10">
                              <div className="px-6 md:px-8 py-5 flex gap-3 md:gap-4">
                                <span className="size-8 md:size-9 shrink-0 rounded-full bg-green-500/10 flex items-center justify-center">
                                  <Icon
                                    icon="bi:check-circle-fill"
                                    className="size-4 text-green-600"
                                  />
                                </span>
                                <p className="flex-1 text-[0.95rem] text-grey-600 leading-relaxed whitespace-pre-line m-0">
                                  {item.a}
                                </p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        <div className="max-w-[600px] mx-auto mt-12 md:mt-16">
          <div className="bg-white rounded-2xl p-8 md:p-10 text-center shadow-lg border border-primary-500/10">
            <div className="size-20 mx-auto mb-6 rounded-full bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-[0_8px_25px_rgba(64,45,135,0.3)]">
              <Icon icon="bi:headset" className="size-9" />
            </div>
            <h2 className="text-xl font-semibold text-primary-500 mb-2">Still need help?</h2>
            <p className="text-grey-500 mb-6">
              Our support team is ready to assist you with any questions not covered here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
              <a
                href={FAQ_SUPPORT_LINKS.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-br from-primary-500 to-primary-700 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Icon icon="bi:telephone-fill" className="size-4" />
                {FAQ_SUPPORT_LINKS.phoneDisplay}
              </a>
              <Link
                to={ROUTES.IN_APP.CONTACT}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-500 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-all hover:bg-primary-500 hover:text-white hover:-translate-y-0.5"
              >
                <Icon icon="bi:envelope-fill" className="size-4" />
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

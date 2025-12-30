import { useEffect } from 'react'
import { Icon } from '@/libs'
import { Button } from '@/components/Button'

export default function TermsOfService() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // Smooth scroll for table of contents links
  useEffect(() => {
    const handleTocClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement
      if (target.classList.contains('toc-item')) {
        e.preventDefault()
        const targetId = target.getAttribute('href')
        if (targetId) {
          const targetElement = document.querySelector(targetId)
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }
        }
      }
    }

    document.addEventListener('click', handleTocClick)
    return () => {
      document.removeEventListener('click', handleTocClick)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20 lg:py-32 relative overflow-hidden">
        <div className="wrapper">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold inline-block">
                Legal
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Terms of Use & Conditions of Service
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 leading-relaxed">
              Please read these terms carefully as they govern your use of DashQard's services and
              platform.
            </p>
            <div className="bg-white/15 backdrop-blur-md px-5 py-3 rounded-full inline-flex items-center gap-2 font-medium">
              <Icon icon="bi:calendar-check" className="text-lg" />
              <span>Last Updated: Tuesday, 10/06/2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 lg:py-20">
        <div className="wrapper">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Table of Contents */}
              <div
                className="p-8 lg:p-12 border-b border-gray-200"
                style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}
              >
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Icon icon="bi:list-ul" className="text-primary-500 text-2xl" />
                  Table of Contents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { href: '#introduction', label: '1. Introduction' },
                    { href: '#eligibility', label: '2. Eligibility' },
                    { href: '#account-registration', label: '3. Account Registration' },
                    { href: '#use-of-services', label: '4. Use of Services' },
                    { href: '#payments-fees', label: '5. Payments and Fees' },
                    { href: '#gift-card-terms', label: '6. Gift Card Terms' },
                    { href: '#intellectual-property', label: '7. Intellectual Property' },
                    { href: '#data-privacy', label: '8. Data Privacy' },
                    { href: '#termination', label: '9. Termination' },
                    { href: '#disclaimers', label: '10. Disclaimers' },
                    { href: '#limitation-liability', label: '11. Limitation of Liability' },
                    { href: '#governing-law', label: '12. Governing Law' },
                    { href: '#amendments', label: '13. Amendments' },
                    { href: '#contact-us', label: '14. Contact Us' },
                    { href: '#acceptance', label: '15. Acceptance' },
                  ].map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="toc-item text-gray-700 hover:text-primary-500 hover:bg-primary-50 border border-gray-200 bg-white rounded-lg px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md font-medium"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Terms Sections */}
              <div className="p-8 lg:p-12">
                {/* Section 1: Introduction */}
                <div id="introduction" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      1
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Introduction</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      Welcome to DashQard, operated by DashQard Ltd. ("DashQard", "we", "our", or
                      "us"). These Terms of Use ("Terms") govern your access to and use of our
                      platform, including our website, mobile platform, USSD, APIs, and all related
                      services ("Services"). By using DashQard, you agree to be bound by these
                      Terms. If you do not agree, please do not use our Services.
                    </p>
                  </div>
                </div>

                {/* Section 2: Eligibility */}
                <div id="eligibility" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      2
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Eligibility</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      To use our Services, you must be at least 18 years old or the age of majority
                      in your jurisdiction and capable of entering into a binding agreement under
                      applicable law. By using DashQard, you affirm that you meet these eligibility
                      requirements.
                    </p>
                  </div>
                </div>

                {/* Section 3: Account Registration */}
                <div id="account-registration" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      3
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Account Registration</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      To access certain features of DashQard, users may be required to register an
                      account. You agree to provide accurate, current, and complete information
                      during registration and to keep this information updated. You are responsible
                      for maintaining the confidentiality of your login credentials and for all
                      activity under your account.
                    </p>
                  </div>
                </div>

                {/* Section 4: Use of Services */}
                <div id="use-of-services" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      4
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Use of Services</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <p className="text-gray-700 leading-relaxed text-lg mb-4">
                      You agree to use DashQard's Services only for lawful purposes and in a manner
                      consistent with all applicable laws and regulations. You may not:
                    </p>
                    <ul className="list-none space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-primary-500 text-xl font-bold mt-1">•</span>
                        <span className="text-gray-700 leading-relaxed">
                          Engage in fraudulent or misleading activity.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary-500 text-xl font-bold mt-1">•</span>
                        <span className="text-gray-700 leading-relaxed">
                          Violate the rights of others, including privacy and intellectual property
                          rights.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary-500 text-xl font-bold mt-1">•</span>
                        <span className="text-gray-700 leading-relaxed">
                          Use the platform to distribute spam, malware, or unauthorized advertising.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary-500 text-xl font-bold mt-1">•</span>
                        <span className="text-gray-700 leading-relaxed">
                          Attempt to disrupt, damage, or gain unauthorized access to DashQard
                          systems.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Section 5: Payments and Fees */}
                <div id="payments-fees" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      5
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Payments and Fees</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-5 mb-5 flex items-center gap-3">
                      <Icon icon="bi:credit-card" className="text-primary-500 text-xl" />
                      <strong className="text-gray-900">Service Fee:</strong>
                      <span className="text-gray-700">
                        DashQard charges a 5% service fee on all gift card purchases.
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      This fee is added at checkout and is clearly displayed prior to payment.
                      Payments are processed through third-party providers including mobile money
                      aggregators and banks. DashQard is not liable for delays or issues arising
                      from third-party processing.
                    </p>
                  </div>
                </div>

                {/* Section 6: Gift Card Terms */}
                <div id="gift-card-terms" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      6
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Gift Card Terms</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 py-4 border-b border-gray-100">
                        <Icon
                          icon="bi:check-circle"
                          className="text-green-500 text-xl mt-0.5 flex-shrink-0"
                        />
                        <p className="text-gray-700 leading-relaxed">
                          DashPro Gift cards purchased on DashQard are redeemable only at vendors
                          who accept Mobile Money payments across all telecommunication services.
                        </p>
                      </div>
                      <div className="flex items-start gap-3 py-4 border-b border-gray-100">
                        <Icon
                          icon="bi:check-circle"
                          className="text-green-500 text-xl mt-0.5 flex-shrink-0"
                        />
                        <p className="text-gray-700 leading-relaxed">
                          DashPro Gift cards are equatable to monetary value.
                        </p>
                      </div>
                      <div className="flex items-start gap-3 py-4">
                        <Icon
                          icon="bi:x-circle"
                          className="text-yellow-500 text-xl mt-0.5 flex-shrink-0"
                        />
                        <p className="text-gray-700 leading-relaxed">
                          DashPro Cards are non-transferable once sent to a recipient or redeemed
                          and are not exchangeable for cash unless otherwise stated.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 7: Intellectual Property */}
                <div id="intellectual-property" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      7
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Intellectual Property</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      All content on DashQard—including logos, product names, designs, interfaces,
                      and software—is the property of DashQard Ltd. or its licensors and is
                      protected by copyright, trademark, and other laws. You may not reproduce,
                      republish, or reuse content without prior written permission.
                    </p>
                  </div>
                </div>

                {/* Section 8: Data Privacy */}
                <div id="data-privacy" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      8
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Data Privacy</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 mb-5 flex items-center gap-3">
                      <Icon icon="bi:shield-check" className="text-green-500 text-xl" />
                      <span className="text-gray-900 font-medium">
                        Your privacy is important to us
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      Your use of the Services is subject to our Privacy Policy, which governs the
                      collection, use, and sharing of personal data. DashQard complies with the Data
                      Protection Act, 2012 (Act 843) of Ghana, and where applicable, international
                      data protection regulations.
                    </p>
                  </div>
                </div>

                {/* Section 9: Termination */}
                <div id="termination" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      9
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Termination</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      DashQard reserves the right to suspend or terminate your account or access to
                      the Services at any time, without notice, for any breach of these Terms or for
                      suspected illegal activity. Users may also delete their accounts by contacting{' '}
                      <a
                        href="mailto:support@dashqard.com"
                        className="text-primary-500 hover:text-primary-700 font-medium underline"
                      >
                        support@dashqard.com
                      </a>
                      .
                    </p>
                  </div>
                </div>

                {/* Section 10: Disclaimers */}
                <div id="disclaimers" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      10
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Disclaimers</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <p className="text-gray-700 leading-relaxed text-lg mb-4">
                      DashQard provides the platform on an "as-is" and "as-available" basis. We make
                      no warranties or representations, express or implied, regarding the
                      reliability, accuracy, or availability of the Services. We do not guarantee
                      that:
                    </p>
                    <ul className="list-none space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-primary-500 text-xl font-bold mt-1">•</span>
                        <span className="text-gray-700 leading-relaxed">
                          The service will be uninterrupted or error-free.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary-500 text-xl font-bold mt-1">•</span>
                        <span className="text-gray-700 leading-relaxed">
                          The platform is immune from unauthorized access or viruses.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Section 11: Limitation of Liability */}
                <div id="limitation-liability" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      11
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">
                      Limitation of Liability
                    </h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-5 mb-5 flex items-center gap-3">
                      <Icon icon="bi:exclamation-triangle" className="text-yellow-500 text-xl" />
                      <strong className="text-gray-900">Important Notice:</strong>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      To the maximum extent permitted by law, DashQard shall not be liable for any
                      indirect, incidental, special, or consequential damages, or for any loss of
                      data, revenue, or profits arising out of your use or inability to use the
                      Services.
                    </p>
                  </div>
                </div>

                {/* Section 12: Governing Law and Jurisdiction */}
                <div id="governing-law" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      12
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">
                      Governing Law and Jurisdiction
                    </h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-5 flex items-center gap-4">
                      <span className="text-3xl">🇬🇭</span>
                      <div>
                        <strong className="block text-gray-900 text-lg mb-1">
                          Republic of Ghana
                        </strong>
                        <small className="text-gray-600">Governing jurisdiction</small>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      These Terms are governed by and construed in accordance with the laws of the
                      Republic of Ghana. Any disputes arising shall be subject to the exclusive
                      jurisdiction of the courts of Ghana through mediation and arbitration.
                    </p>
                  </div>
                </div>

                {/* Section 13: Amendments */}
                <div id="amendments" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      13
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Amendments</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      DashQard reserves the right to amend or update these Terms at any time. We
                      will provide notice of material changes via email or platform announcements.
                      Continued use after changes are effective constitutes acceptance of the
                      updated Terms.
                    </p>
                  </div>
                </div>

                {/* Section 14: Contact Us */}
                <div id="contact-us" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      14
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Contact Us</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                      <div className="flex items-center gap-3 mb-6">
                        <Icon icon="bi:building" className="text-primary-500 text-xl" />
                        <strong className="text-gray-900 text-lg">DashQard Ltd.</strong>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-700">
                          <Icon
                            icon="bi:geo-alt"
                            className="text-primary-500 text-lg flex-shrink-0"
                          />
                          <span>EJ 798 Odai Ntow Avenue, Accra, Ghana</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <Icon
                            icon="bi:globe"
                            className="text-primary-500 text-lg flex-shrink-0"
                          />
                          <a
                            href="https://www.dashqard.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary-500 hover:underline"
                          >
                            www.dashqard.com
                          </a>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <Icon
                            icon="bi:envelope"
                            className="text-primary-500 text-lg flex-shrink-0"
                          />
                          <a
                            href="mailto:support@dashqard.com"
                            className="hover:text-primary-500 hover:underline"
                          >
                            support@dashqard.com
                          </a>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <Icon
                            icon="bi:telephone"
                            className="text-primary-500 text-lg flex-shrink-0"
                          />
                          <a
                            href="tel:+233542022245"
                            className="hover:text-primary-500 hover:underline"
                          >
                            +233 (0) 542 022 245
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 15: Acceptance */}
                <div id="acceptance" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      15
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Acceptance</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 flex items-start gap-4">
                      <Icon
                        icon="bi:check-circle-fill"
                        className="text-green-500 text-2xl flex-shrink-0 mt-0.5"
                      />
                      <p className="text-gray-900 font-semibold text-lg leading-relaxed">
                        By using DashQard, you confirm that you have read, understood, and agreed to
                        these Terms of Use & Conditions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Back to Top */}
                <div className="text-center pt-8 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={scrollToTop}
                    className="rounded-full px-8 py-3"
                  >
                    <Icon icon="bi:arrow-up" className="mr-2" />
                    Back to Top
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

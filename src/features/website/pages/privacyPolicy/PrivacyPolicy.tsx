import { useEffect } from 'react'
import { Icon } from '@/libs'
import { Button } from '@/components/Button'

export default function PrivacyPolicy() {
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
                Privacy
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              DashQard Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 leading-relaxed">
              Learn how we collect, use, and protect your personal information in accordance with
              Ghanaian and international data protection laws.
            </p>
            <div className="bg-white/15 backdrop-blur-md px-5 py-3 rounded-full inline-flex items-center gap-2 font-medium">
              <Icon icon="bi:calendar-check" className="text-lg" />
              <span>Last Updated: Tuesday, 10/06/2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
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
                    { href: '#information-we-collect', label: '2. Information We Collect' },
                    { href: '#how-we-use-information', label: '3. How We Use Your Information' },
                    { href: '#sharing-information', label: '4. Sharing Your Information' },
                    { href: '#data-retention', label: '5. Data Retention' },
                    { href: '#data-security', label: '6. Data Security' },
                    { href: '#your-rights', label: '7. Your Rights' },
                    { href: '#policy-changes', label: '8. Policy Changes' },
                    { href: '#contact', label: '9. Contact' },
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

              {/* Privacy Sections */}
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
                      This Privacy Policy outlines how DashQard Ltd. ("DashQard", "we", "our", or
                      "us") collects, uses, discloses, and protects your personal information. This
                      policy is aligned with the Data Protection Act, 2012 (Act 843) of Ghana and
                      where applicable, international data protection regulations.
                    </p>
                  </div>
                </div>

                {/* Section 2: Information We Collect */}
                <div id="information-we-collect" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      2
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Information We Collect</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                      We may collect the following types of data:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                        <Icon
                          icon="bi:person-circle"
                          className="text-primary-500 text-2xl flex-shrink-0 mt-1"
                        />
                        <div>
                          <strong className="block text-gray-900 mb-1">Personal Information</strong>
                          <p className="text-gray-700 text-sm">
                            Full name, email address, phone number
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                        <Icon
                          icon="bi:credit-card"
                          className="text-primary-500 text-2xl flex-shrink-0 mt-1"
                        />
                        <div>
                          <strong className="block text-gray-900 mb-1">Payment Data</strong>
                          <p className="text-gray-700 text-sm">
                            Mobile money or payment-related data
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                        <Icon
                          icon="bi:clock-history"
                          className="text-primary-500 text-2xl flex-shrink-0 mt-1"
                        />
                        <div>
                          <strong className="block text-gray-900 mb-1">Transaction History</strong>
                          <p className="text-gray-700 text-sm">Transaction history and logs</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                        <Icon
                          icon="bi:router"
                          className="text-primary-500 text-2xl flex-shrink-0 mt-1"
                        />
                        <div>
                          <strong className="block text-gray-900 mb-1">Technical Data</strong>
                          <p className="text-gray-700 text-sm">
                            IP address and device/browser info
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                        <Icon
                          icon="bi:geo-alt"
                          className="text-primary-500 text-2xl flex-shrink-0 mt-1"
                        />
                        <div>
                          <strong className="block text-gray-900 mb-1">Location Data</strong>
                          <p className="text-gray-700 text-sm">Location data (if enabled)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                        <Icon
                          icon="bi:headset"
                          className="text-primary-500 text-2xl flex-shrink-0 mt-1"
                        />
                        <div>
                          <strong className="block text-gray-900 mb-1">Support Data</strong>
                          <p className="text-gray-700 text-sm">Customer support interactions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: How We Use Your Information */}
                <div id="how-we-use-information" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      3
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">
                      How We Use Your Information
                    </h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <p className="text-gray-700 leading-relaxed text-lg mb-4">
                      Your data is used to:
                    </p>
                    <ul className="list-none space-y-3">
                      <li className="flex items-start gap-3">
                        <Icon
                          icon="bi:check-circle"
                          className="text-green-500 text-xl flex-shrink-0 mt-0.5"
                        />
                        <span className="text-gray-700 leading-relaxed">
                          Deliver, manage, and improve the DashQard platform
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Icon
                          icon="bi:check-circle"
                          className="text-green-500 text-xl flex-shrink-0 mt-0.5"
                        />
                        <span className="text-gray-700 leading-relaxed">
                          Verify identity and secure transactions
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Icon
                          icon="bi:check-circle"
                          className="text-green-500 text-xl flex-shrink-0 mt-0.5"
                        />
                        <span className="text-gray-700 leading-relaxed">
                          Communicate updates, alerts, and offers
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Icon
                          icon="bi:check-circle"
                          className="text-green-500 text-xl flex-shrink-0 mt-0.5"
                        />
                        <span className="text-gray-700 leading-relaxed">
                          Support technical and customer service
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Icon
                          icon="bi:check-circle"
                          className="text-green-500 text-xl flex-shrink-0 mt-0.5"
                        />
                        <span className="text-gray-700 leading-relaxed">
                          Comply with legal obligations
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Section 4: Sharing Your Information */}
                <div id="sharing-information" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      4
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">
                      Sharing Your Information
                    </h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                      We may share your data with:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center transition-all hover:border-primary-500 hover:-translate-y-1 hover:shadow-lg">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon icon="bi:credit-card-2-front" className="text-white text-2xl" />
                        </div>
                        <h4 className="text-gray-900 font-semibold text-lg mb-2">
                          Payment Processors
                        </h4>
                        <p className="text-gray-600 text-sm">Secure payment processing partners</p>
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center transition-all hover:border-primary-500 hover:-translate-y-1 hover:shadow-lg">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon icon="bi:shop" className="text-white text-2xl" />
                        </div>
                        <h4 className="text-gray-900 font-semibold text-lg mb-2">
                          Partner Vendors
                        </h4>
                        <p className="text-gray-600 text-sm">For gift card validation</p>
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center transition-all hover:border-primary-500 hover:-translate-y-1 hover:shadow-lg">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon icon="bi:shield-check" className="text-white text-2xl" />
                        </div>
                        <h4 className="text-gray-900 font-semibold text-lg mb-2">
                          Government & Law Enforcement
                        </h4>
                        <p className="text-gray-600 text-sm">When required by law</p>
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center transition-all hover:border-primary-500 hover:-translate-y-1 hover:shadow-lg">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon icon="bi:people" className="text-white text-2xl" />
                        </div>
                        <h4 className="text-gray-900 font-semibold text-lg mb-2">
                          Third-Party Service Providers
                        </h4>
                        <p className="text-gray-600 text-sm">Approved partners (under NDA)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 5: Data Retention */}
                <div id="data-retention" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      5
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Data Retention</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-l-4 border-primary-500 rounded-xl p-5 mb-5 flex items-center gap-3">
                      <Icon
                        icon="bi:clock-history"
                        className="text-primary-500 text-xl flex-shrink-0"
                      />
                      <div>
                        <strong className="text-gray-900">Retention Policy:</strong>{' '}
                        <span className="text-gray-700">
                          We retain your personal information as long as legally required for
                          business, legal, and regulatory compliance.
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      For any further information about our data retention practices, please
                      contact:{' '}
                      <a
                        href="mailto:support@dashqard.com"
                        className="text-primary-500 hover:text-primary-700 font-medium underline"
                      >
                        support@dashqard.com
                      </a>
                    </p>
                  </div>
                </div>

                {/* Section 6: Data Security */}
                <div id="data-security" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      6
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Data Security</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 mb-5 flex items-center gap-3">
                      <Icon icon="bi:shield-lock" className="text-green-500 text-xl" />
                      <span className="text-gray-900 font-medium">
                        Your data is protected with industry-standard security measures
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg mb-4">
                      We protect your data using:
                    </p>
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
                        <Icon icon="bi:lock-fill" className="text-green-500 text-xl" />
                        <strong className="text-gray-900">AES encryption</strong>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
                        <Icon icon="bi:shield-fill-check" className="text-green-500 text-xl" />
                        <strong className="text-gray-900">SSL/TLS transport layer security</strong>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
                        <Icon icon="bi:eye-fill" className="text-green-500 text-xl" />
                        <strong className="text-gray-900">
                          Access logs, firewalls, and multi-factor authentication
                        </strong>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 flex items-start gap-3">
                      <Icon
                        icon="bi:exclamation-triangle"
                        className="text-yellow-500 text-xl flex-shrink-0 mt-0.5"
                      />
                      <span className="text-yellow-800 text-sm">
                        However, no system is entirely immune from breaches. Users are encouraged to
                        use strong passwords and report suspicious activity.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 7: Your Rights */}
                <div id="your-rights" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      7
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Your Rights</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-l-4 border-primary-500 rounded-xl p-5 mb-5 flex items-center gap-4">
                      <span className="text-3xl">🇬🇭</span>
                      <div>
                        <strong className="block text-gray-900 text-lg">
                          Under Ghanaian and international data laws, you may:
                        </strong>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border-l-3 border-primary-500">
                        <Icon
                          icon="bi:eye"
                          className="text-primary-500 text-xl flex-shrink-0 mt-0.5"
                        />
                        <span className="text-gray-700">Access, correct, or delete your data</span>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border-l-3 border-primary-500">
                        <Icon
                          icon="bi:download"
                          className="text-primary-500 text-xl flex-shrink-0 mt-0.5"
                        />
                        <span className="text-gray-700">
                          Request data portability, where applicable in accordance with the law of
                          jurisdiction
                        </span>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border-l-3 border-primary-500">
                        <Icon
                          icon="bi:pause-circle"
                          className="text-primary-500 text-xl flex-shrink-0 mt-0.5"
                        />
                        <span className="text-gray-700">
                          Restrict processing in specific contexts
                        </span>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border-l-3 border-primary-500">
                        <Icon
                          icon="bi:x-circle"
                          className="text-primary-500 text-xl flex-shrink-0 mt-0.5"
                        />
                        <span className="text-gray-700">
                          Withdraw consent for non-essential processing
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 8: Policy Changes */}
                <div id="policy-changes" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      8
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Policy Changes</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-l-4 border-primary-500 rounded-xl p-5 mb-5 flex items-center gap-3">
                      <Icon icon="bi:bell" className="text-primary-500 text-xl flex-shrink-0" />
                      <span className="text-gray-900">
                        We may update this Privacy Policy to reflect changes in our practices or
                        legal requirements.
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      We will notify you of significant changes via email or dashboard
                      announcements.
                    </p>
                  </div>
                </div>

                {/* Section 9: Contact */}
                <div id="contact" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      9
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">Contact</h2>
                  </div>
                  <div className="ml-0 md:ml-20">
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                      If you have questions about this policy or wish to exercise your data rights:
                    </p>
                    <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl p-8 border border-primary-600">
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/20">
                        <Icon icon="bi:building" className="text-xl" />
                        <h4 className="text-xl font-semibold">DashQard Ltd.</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Icon icon="bi:geo-alt" className="text-lg flex-shrink-0" />
                          <span>Accra, Ghana</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Icon icon="bi:globe" className="text-lg flex-shrink-0" />
                          <a
                            href="https://www.dashqard.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            www.dashqard.com
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <Icon icon="bi:envelope" className="text-lg flex-shrink-0" />
                          <a href="mailto:support@dashqard.com" className="hover:underline">
                            support@dashqard.com
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <Icon icon="bi:telephone" className="text-lg flex-shrink-0" />
                          <a href="tel:+233542022245" className="hover:underline">
                            +233 (0) 542 022 245
                          </a>
                        </div>
                      </div>
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

import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { Button } from '@/components/Button'
import { ROUTES } from '@/utils/constants'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'

export default function AboutUs() {
  const navigate = useNavigate()
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white text-gray-800 relative">
        <div className="wrapper py-8 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            <div className="w-full lg:w-1/2">
              <div className="mb-10">
                <span className="bg-gradient-to-br from-[#402D87] to-[#2d2060] text-white rounded-full px-6 py-2 text-sm font-semibold inline-block shadow-lg">
                  About Us
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-tight mb-6 text-[#2d2060]">
                Transforming Digital Gifting in Ghana
              </h1>
              <p className="text-xl md:text-2xl leading-relaxed mb-8 text-gray-600">
                We're on a mission to revolutionize how people connect, celebrate, and share value
                through innovative digital gifting solutions that bring communities together.
              </p>
            </div>
            <div className="w-full lg:w-1/2 relative">
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative">
                <img
                  src={DashproBg}
                  alt="DashPro background"
                  className="w-full h-[300px] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-8">
                  <h3 className="text-2xl font-bold mb-2">Digital Gift Cards</h3>
                  <p className="opacity-90">Instant delivery, secure transactions</p>
                </div>
              </div>
              <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                <div className="absolute top-[20%] -right-[10%] bg-white rounded-full px-6 py-3 flex items-center gap-2 font-semibold text-[#2d2060] shadow-lg animate-bounce">
                  <Icon icon="bi:lightning-charge" className="text-[#402D87]" />
                  <span>Instant</span>
                </div>
                <div
                  className="absolute top-[35%] -left-[8%] bg-white rounded-full px-6 py-3 flex items-center gap-2 font-semibold text-[#2d2060] shadow-lg animate-bounce"
                  style={{ animationDelay: '2s' }}
                >
                  <Icon icon="bi:shield-check" className="text-[#402D87]" />
                  <span>Secure</span>
                </div>
                <div
                  className="absolute bottom-[20%] -right-[5%] bg-white rounded-full px-6 py-3 flex items-center gap-2 font-semibold text-[#2d2060] shadow-lg animate-bounce"
                  style={{ animationDelay: '4s' }}
                >
                  <Icon icon="bi:heart" className="text-[#402D87]" />
                  <span>Personal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="relative py-12 lg:py-16 bg-gradient-to-br from-[#f8f9ff] to-white">
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(64, 45, 135, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(91, 215, 220, 0.03) 0%, transparent 50%)
          `,
          }}
        ></div>
        <div className="wrapper relative">
          <div className="text-center mb-12">
            <div className="mb-6">
              <span className="bg-gradient-to-br from-[#402D87] to-[#2d2060] text-white rounded-full px-6 py-2 text-sm font-semibold inline-block shadow-lg">
                Our Purpose
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2d2060] mb-4">Mission & Vision</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Driven by purpose, guided by values, and committed to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Mission */}
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-[rgba(64,45,135,0.1)] transition-all hover:-translate-y-2.5 hover:shadow-xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 border-2 border-pink-200 inline-flex items-center justify-center mb-6">
                  <Icon icon="bi:flag-fill" className="text-4xl text-pink-600" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#2d2060] mb-4 text-center">Our Mission</h3>
                <p className="text-lg leading-relaxed text-gray-700 text-center">
                  To redefine how people exchange value everyday through meaningful and impactful
                  digital gifting solutions that strengthen relationships and build communities.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-[rgba(64,45,135,0.1)] transition-all hover:-translate-y-2.5 hover:shadow-xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 border-2 border-cyan-200 inline-flex items-center justify-center mb-6">
                  <Icon icon="bi:eye-fill" className="text-4xl text-cyan-600" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#2d2060] mb-4 text-center">Our Vision</h3>
                <p className="text-lg leading-relaxed text-gray-700 text-center">
                  To become Africa's leading digital gifting ecosystem, connecting people and
                  communities through the universal language of giving and sharing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="bg-white py-12 lg:py-16">
        <div className="wrapper">
          <div className="text-center mb-12">
            <div className="mb-6">
              <span className="bg-gradient-to-br from-[#402D87] to-[#2d2060] text-white rounded-full px-6 py-2 text-sm font-semibold inline-block shadow-lg">
                Our Values
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2d2060] mb-4">What Drives Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white border border-[rgba(64,45,135,0.1)] transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[#402D87] to-[#2d2060] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl shadow-lg">
                <Icon icon="bi:heart-fill" />
              </div>
              <h4 className="text-xl font-semibold text-[#2d2060] mb-4">Customer-Centric</h4>
              <p className="text-gray-600 leading-relaxed">
                Every decision we make is guided by what's best for our customers. Your satisfaction
                and success are our top priorities.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white border border-[rgba(64,45,135,0.1)] transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[#402D87] to-[#2d2060] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl shadow-lg">
                <Icon icon="bi:shield-lock-fill" />
              </div>
              <h4 className="text-xl font-semibold text-[#2d2060] mb-4">Trust & Security</h4>
              <p className="text-gray-600 leading-relaxed">
                We maintain the highest standards of security and transparency, ensuring your data
                and transactions are always protected.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white border border-[rgba(64,45,135,0.1)] transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[#402D87] to-[#2d2060] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl shadow-lg">
                <Icon icon="bi:lightbulb-fill" />
              </div>
              <h4 className="text-xl font-semibold text-[#2d2060] mb-4">Innovation</h4>
              <p className="text-gray-600 leading-relaxed">
                We continuously evolve and improve our platform, embracing new technologies to
                enhance your gifting experience.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white border border-[rgba(64,45,135,0.1)] transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[#402D87] to-[#2d2060] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl shadow-lg">
                <Icon icon="bi:people-fill" />
              </div>
              <h4 className="text-xl font-semibold text-[#2d2060] mb-4">Community</h4>
              <p className="text-gray-600 leading-relaxed">
                We believe in the power of community and gifting to strengthen connections between
                people.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white border border-[rgba(64,45,135,0.1)] transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[#402D87] to-[#2d2060] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl shadow-lg">
                <Icon icon="bi:gem" />
              </div>
              <h4 className="text-xl font-semibold text-[#2d2060] mb-4">Excellence</h4>
              <p className="text-gray-600 leading-relaxed">
                We are committed to excellence in delivering an exceptional digital gifting
                experience.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white border border-[rgba(64,45,135,0.1)] transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[#402D87] to-[#2d2060] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl shadow-lg">
                <Icon icon="bi:globe" />
              </div>
              <h4 className="text-xl font-semibold text-[#2d2060] mb-4">Accessibility</h4>
              <p className="text-gray-600 leading-relaxed">
                We aim to make accessible to everyone the joy of digital gifting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative py-12 lg:py-16 bg-gradient-to-br from-[#f8f9ff] to-white">
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(64, 45, 135, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(91, 215, 220, 0.03) 0%, transparent 50%)
          `,
          }}
        ></div>
        <div className="wrapper relative">
          <div className="text-center mb-12">
            <div className="mb-6">
              <span className="bg-gradient-to-br from-[#402D87] to-[#2d2060] text-white rounded-full px-6 py-2 text-sm font-semibold inline-block shadow-lg">
                Why DashQard
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2d2060] mb-4">
              Why Choose DashQard?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover what makes us Ghana's preferred digital gifting platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl border border-[rgba(64,45,135,0.1)] transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-[#402D87] to-[#2d2060] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl shadow-lg">
                <Icon icon="bi:lightning-charge-fill" />
              </div>
              <h5 className="text-lg font-semibold text-[#2d2060] mb-3">Instant Delivery</h5>
              <p className="text-gray-600 text-sm leading-relaxed">
                Send digital gift cards instantly. No waiting, no delays.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl border border-[rgba(64,45,135,0.1)] transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-[#402D87] to-[#2d2060] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl shadow-lg">
                <Icon icon="bi:phone-fill" />
              </div>
              <h5 className="text-lg font-semibold text-[#2d2060] mb-3">Mobile-First Design</h5>
              <p className="text-gray-600 text-sm leading-relaxed">
                Optimized for mobile devices, making it easy to send gifts on the go.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl border border-[rgba(64,45,135,0.1)] transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-[#402D87] to-[#2d2060] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl shadow-lg">
                <Icon icon="bi:cash-coin" />
              </div>
              <h5 className="text-lg font-semibold text-[#2d2060] mb-3">Flexible Amounts</h5>
              <p className="text-gray-600 text-sm leading-relaxed">
                Choose any amount from GHS 1 to GHS 10,000 for registered users.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl border border-[rgba(64,45,135,0.1)] transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-[#402D87] to-[#2d2060] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl shadow-lg">
                <Icon icon="bi:heart-fill" />
              </div>
              <h5 className="text-lg font-semibold text-[#2d2060] mb-3">Personal Touch</h5>
              <p className="text-gray-600 text-sm leading-relaxed">
                Add personal messages and customize your gift cards for that special touch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#402D87] to-[#2d2060] text-white py-12 lg:py-16">
        <div className="wrapper">
          <div className="bg-white/10 rounded-3xl p-12 backdrop-blur-xl border border-white/20 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Gifting?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of satisfied customers who trust DashQard for their digital gifting
                needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="default"
                  className="rounded-full!"
                  onClick={() => navigate(ROUTES.IN_APP.DASHQARDS)}
                >
                  <Icon icon="bi:cart" className="mr-2" />
                  Purchase Gift Card
                </Button>
                <Link
                  to={ROUTES.IN_APP.CONTACT}
                  className="bg-white/20 hover:bg-white/30 border-2 border-white/30 text-white px-8 py-3 rounded-full font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg inline-flex items-center justify-center"
                >
                  <Icon icon="bi:chat-dots" className="mr-2" />
                  Contact Us
                </Link>
              </div>
            </div>
            <div>
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-5xl text-[#ffc70a]">
                <Icon icon="bi:gift-fill" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '@/components'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants/shared'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/hooks'
import { postMethod } from '@/services/requests'

// Extended schema to include phone and inquiryType
const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  inquiryType: z.string().min(1, 'Feedback type is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
})

type ContactFormData = z.infer<typeof ContactFormSchema>

const contactUsForm = async (payload: { to: string; subject: string; message: string }) => {
  return await postMethod('/contact/send', payload)
}

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const toast = useToast()

  const form = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      inquiryType: '',
      subject: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const payload = {
        to: 'support@dashqard.com',
        subject: `${data.inquiryType ? `[${data.inquiryType.toUpperCase()}] ` : ''}${data.subject}`,
        message: `
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Inquiry Type: ${data.inquiryType || 'Not specified'}
Subject: ${data.subject}

Message:
${data.message}
        `.trim(),
      }

      await contactUsForm(payload)

      setSuccessMessage(
        "Your message has been sent successfully! We'll get back to you within 24 hours.",
      )

      // Reset form
      form.reset()

      toast.success('Message sent successfully!')
    } catch (error: any) {
      console.error('Form submission error:', error)
      const errorMsg =
        error?.response?.data?.message ||
        'There was an issue sending your message. Please try again later or contact us directly.'
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-linear-to-br from-[#f8f9ff] to-[#ffffff] py-12 border-b border-primary-500/10">
        <div className="wrapper">
          <div className="text-center">
            <h1 className="text-[clamp(32px,5vw,48px)] font-bold text-primary-500 mb-2">
              Contact Us
            </h1>
            <p className="text-lg text-grey-500">Get in touch with our support team</p>
          </div>
        </div>
      </div>

      {/* Contact Methods Section */}
      <section className="py-12 bg-[#f8f9ff]">
        <div className="wrapper">
          <div className="text-center mb-12">
            <div className="inline-block py-2 px-6 bg-primary-500 text-white rounded-full text-sm font-bold mb-4">
              Contact Options
            </div>
            <h2 className="text-[clamp(28px,4vw,36px)] font-bold text-primary-500 mb-4">
              Choose Your Preferred Way to Reach Us
            </h2>
            <p className="text-lg text-grey-500 max-w-2xl mx-auto">
              We offer multiple convenient ways to get in touch with our support team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Support Line */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-primary-500/10 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-20 h-20 bg-linear-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon icon="bi:telephone-fill" className="size-10 text-white" />
              </div>
              <h4 className="text-xl font-bold text-primary-500 mb-4 text-center">Support Line</h4>
              <p className="text-grey-600 mb-6 text-center">
                Call us for comprehensive support. Perfect for detailed assistance and technical
                support.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-primary-500/10">
                  <strong className="text-primary-500">Phone:</strong>
                  <a
                    href="tel:+233542022245"
                    className="text-primary-500 font-semibold hover:underline"
                  >
                    +233 (0)542 022 245
                  </a>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-primary-500/10">
                  <strong className="text-primary-500">Hours:</strong>
                  <span className="text-grey-600">Monday - Friday, 9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <strong className="text-primary-500">Response Time:</strong>
                  <span className="text-grey-600">Within 15 minutes</span>
                </div>
              </div>
              <a
                href="tel:+233542022245"
                className="block w-full bg-primary-500 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-full text-center transition-all hover:shadow-lg"
              >
                <Icon icon="bi:telephone" className="size-5 inline mr-2" />
                Call Now
              </a>
            </div>

            {/* Support WhatsApp */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-primary-500/10 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-20 h-20 bg-linear-to-br from-[#25D366] to-[#128C7E] rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon icon="bi:whatsapp" className="size-10 text-white" />
              </div>
              <h4 className="text-xl font-bold text-primary-500 mb-4 text-center">
                Support WhatsApp
              </h4>
              <p className="text-grey-600 mb-6 text-center">
                WhatsApp us for comprehensive support and assistance. Perfect for quick support and
                instant communication.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-primary-500/10">
                  <strong className="text-primary-500">WhatsApp:</strong>
                  <a
                    href="https://wa.me/233542022245"
                    className="text-primary-500 font-semibold hover:underline"
                  >
                    +233 (0)542 022 245
                  </a>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-primary-500/10">
                  <strong className="text-primary-500">Hours:</strong>
                  <span className="text-grey-600">Monday - Friday, 9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <strong className="text-primary-500">Response Time:</strong>
                  <span className="text-grey-600">Within 30 minutes</span>
                </div>
              </div>
              <a
                href="https://wa.me/233542022245"
                className="block w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-3 px-6 rounded-full text-center transition-all hover:shadow-lg"
              >
                <Icon icon="bi:whatsapp" className="size-5 inline mr-2" />
                WhatsApp Now
              </a>
            </div>

            {/* Email Support */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-primary-500/10 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-20 h-20 bg-linear-to-br from-[#EA4335] to-[#D33B2C] rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon icon="bi:envelope-fill" className="size-10 text-white" />
              </div>
              <h4 className="text-xl font-bold text-primary-500 mb-4 text-center">Email Support</h4>
              <p className="text-grey-600 mb-6 text-center">
                Send us detailed inquiries or feedback. Best for complex issues or formal
                communications.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-primary-500/10">
                  <strong className="text-primary-500">Email:</strong>
                  <a
                    href="mailto:support@dashqard.com"
                    className="text-primary-500 font-semibold hover:underline"
                  >
                    support@dashqard.com
                  </a>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-primary-500/10">
                  <strong className="text-primary-500">Hours:</strong>
                  <span className="text-grey-600">24/7 Monitoring</span>
                </div>
                <div className="flex justify-between items-center">
                  <strong className="text-primary-500">Response Time:</strong>
                  <span className="text-grey-600">Within 24 hours</span>
                </div>
              </div>
              <a
                href="mailto:support@dashqard.com"
                className="block w-full bg-white border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-semibold py-3 px-6 rounded-full text-center transition-all"
              >
                <Icon icon="bi:envelope" className="size-5 inline mr-2" />
                Send Email
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12 bg-linear-to-br from-[#f8f9ff] to-[#ffffff] relative">
        <div className="wrapper">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-primary-500/10">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-linear-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon icon="bi:chat-dots-fill" className="size-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-500 mb-2">Send us a Message</h3>
                  <p className="text-grey-600">
                    Fill out the form below and we'll get back to you within 24 hours. For urgent
                    matters, please call or WhatsApp us directly.
                  </p>
                </div>

                {/* Success Alert */}
                {successMessage && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon icon="bi:check-circle-fill" className="size-5 text-green-600 mr-2" />
                      <span className="text-green-800">{successMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSuccessMessage('')}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Icon icon="bi:x-lg" className="size-4" />
                    </button>
                  </div>
                )}

                {/* Error Alert */}
                {errorMessage && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon
                        icon="bi:exclamation-triangle-fill"
                        className="size-5 text-red-600 mr-2"
                      />
                      <span className="text-red-800">{errorMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErrorMessage('')}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Icon icon="bi:x-lg" className="size-4" />
                    </button>
                  </div>
                )}

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-primary-500 mb-2">
                        <Icon icon="bi:person-fill" className="size-4 mr-2" />
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        {...form.register('name')}
                        error={form.formState.errors.name?.message}
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-primary-500 mb-2">
                        <Icon icon="bi:envelope-fill" className="size-4 mr-2" />
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...form.register('email')}
                        error={form.formState.errors.email?.message}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-primary-500 mb-2">
                        <Icon icon="bi:telephone-fill" className="size-4 mr-2" />
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number (optional)"
                        {...form.register('phone')}
                        error={form.formState.errors.phone?.message}
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-primary-500 mb-2">
                        <Icon icon="bi:tag-fill" className="size-4 mr-2" />
                        Feedback Type *
                      </label>
                      <select
                        {...form.register('inquiryType')}
                        className="w-full px-4 py-3 border-2 border-primary-500/10 rounded-lg focus:outline-none focus:border-primary-500"
                      >
                        <option value="">Select feedback type</option>
                        <option value="bug-report">Bug Reports</option>
                        <option value="feature-request">Feature Requests</option>
                        <option value="performance-issue">Performance Issues</option>
                        <option value="ui-ux-issue">UI/UX Issues</option>
                      </select>
                      {form.formState.errors.inquiryType && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.inquiryType.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-primary-500 mb-2">
                      <Icon icon="bi:chat-text-fill" className="size-4 mr-2" />
                      Subject *
                    </label>
                    <Input
                      type="text"
                      placeholder="Brief description of your inquiry"
                      {...form.register('subject')}
                      error={form.formState.errors.subject?.message}
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-primary-500 mb-2">
                      <Icon icon="bi:chat-text-fill" className="size-4 mr-2" />
                      Message *
                    </label>
                    <Input
                      type="textarea"
                      rows={6}
                      placeholder="Please provide detailed information about your inquiry..."
                      {...form.register('message')}
                      error={form.formState.errors.message?.message}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    loading={isLoading}
                    className="w-full bg-primary-500 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-full"
                    icon="bi:send-fill"
                    iconPosition="left"
                  >
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Information Sidebar */}
            <div className="space-y-6">
              {/* Quick Contact */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-primary-500/10">
                <h4 className="text-lg font-bold text-primary-500 mb-4 flex items-center">
                  <Icon icon="bi:lightning-fill" className="size-5 mr-2 text-yellow-500" />
                  Need Immediate Help?
                </h4>
                <p className="text-grey-600 mb-4">
                  For urgent matters or immediate assistance, contact us directly:
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+233542022245"
                    className="flex items-center gap-3 p-3 bg-primary-500/5 rounded-lg hover:bg-primary-500/10 transition-colors"
                  >
                    <Icon icon="bi:telephone-fill" className="size-5 text-primary-500" />
                    <span className="text-primary-500 font-semibold">
                      Support Line: +233 (0)542 022 245
                    </span>
                  </a>
                  <a
                    href="https://wa.me/233542022245"
                    className="flex items-center gap-3 p-3 bg-[#25D366]/5 rounded-lg hover:bg-[#25D366]/10 transition-colors"
                  >
                    <Icon icon="bi:whatsapp" className="size-5 text-[#25D366]" />
                    <span className="text-[#25D366] font-semibold">
                      Support WhatsApp: +233 (0)542 022 245
                    </span>
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-primary-500/10">
                <h4 className="text-lg font-bold text-primary-500 mb-4 flex items-center">
                  <Icon icon="bi:clock-fill" className="size-5 mr-2 text-primary-500" />
                  Business Hours
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-primary-500/10">
                    <span className="font-semibold text-primary-500">Monday - Friday</span>
                    <span className="text-grey-600">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-primary-500/10">
                    <span className="font-semibold text-primary-500">Saturday</span>
                    <span className="text-grey-600">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-primary-500">Sunday</span>
                    <span className="text-grey-600">Closed</span>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-primary-500/10">
                <h4 className="text-lg font-bold text-primary-500 mb-4 flex items-center">
                  <Icon icon="bi:question-circle-fill" className="size-5 mr-2 text-primary-500" />
                  Frequently Asked Questions
                </h4>
                <p className="text-grey-600 mb-4">
                  Check our FAQ section for quick answers to common questions.
                </p>
                <Link
                  to={ROUTES.IN_APP.FAQ}
                  className="inline-flex items-center text-primary-500 hover:text-primary-700 font-semibold"
                >
                  View FAQ
                  <Icon icon="bi:arrow-right" className="size-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bulk/Corporate Section */}
      <section className="py-12 bg-white">
        <div className="wrapper">
          <div className="bg-linear-to-br from-primary-500 to-primary-700 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Icon icon="bi:building-fill" className="size-8 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Bulk & Corporate Gifting Solutions</h3>
                <p className="opacity-90">
                  Perfect for businesses, organizations, and large-scale gifting needs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                'Custom bulk pricing',
                'Dedicated account manager',
                'Custom branding options',
                'Flexible payment terms',
                'API integration available',
                'Detailed reporting & analytics',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Icon icon="bi:check-circle-fill" className="size-5 text-yellow-500" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-white/10 rounded-lg p-6 mb-6">
              <p className="mb-4">
                <strong className="text-yellow-500">Interested in bulk gifting solutions?</strong>{' '}
                Contact our corporate team for a customized quote and consultation.{' '}
                <Link
                  to="/#bulk-gifting"
                  className="text-yellow-500 hover:text-yellow-400 underline"
                >
                  Learn more about bulk gifting
                </Link>
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="tel:+233542022245"
                  className="bg-white text-primary-500 hover:bg-primary-50 font-semibold py-2 px-6 rounded-full transition-all inline-flex items-center"
                >
                  <Icon icon="bi:telephone" className="size-4 mr-2" />
                  Call for Quote
                </a>
                <a
                  href="mailto:corporate@dashqard.com"
                  className="bg-white/10 border-2 border-white text-white hover:bg-white/20 font-semibold py-2 px-6 rounded-full transition-all inline-flex items-center"
                >
                  <Icon icon="bi:envelope" className="size-4 mr-2" />
                  Email Corporate Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Social Section */}
      <section className="py-12 bg-linear-to-br from-[#f8f9ff] to-[#ffffff]">
        <div className="wrapper">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-primary-500/10">
              <h3 className="text-xl font-bold text-primary-500 mb-6 flex items-center">
                <Icon icon="bi:geo-alt-fill" className="size-5 mr-2" />
                Our Location
              </h3>
              <div>
                <p className="text-lg">
                  <strong>DashQard Ghana</strong>
                  <br />
                  Accra, Ghana
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-primary-500/10">
              <h3 className="text-xl font-bold text-primary-500 mb-4 flex items-center">
                <Icon icon="bi:share-fill" className="size-5 mr-2" />
                Follow Us
              </h3>
              <p className="text-grey-600 mb-6">
                Stay updated with the latest news, features, and promotions
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: 'bi:youtube',
                    label: '@dashqard',
                    href: 'https://www.youtube.com/@dashqard',
                    color: 'text-red-600 bg-red-50 border-red-200',
                  },
                  {
                    icon: 'bi:twitter-x',
                    label: '@dashqard',
                    href: 'https://x.com/dashqard',
                    color: 'text-black bg-gray-50 border-gray-200',
                  },
                  {
                    icon: 'bi:instagram',
                    label: '@dashqard',
                    href: 'https://www.instagram.com/dashqard/',
                    color: 'text-pink-600 bg-pink-50 border-pink-200',
                  },
                  {
                    icon: 'bi:linkedin',
                    label: '@dashqard',
                    href: 'https://www.linkedin.com/company/dashqard/?viewAsMember=true',
                    color: 'text-blue-600 bg-blue-50 border-blue-200',
                  },
                  {
                    icon: 'bi:tiktok',
                    label: '@dashqard',
                    href: 'https://www.tiktok.com/@dashqard?lang=en',
                    color: 'text-black bg-gray-50 border-gray-200',
                  },
                ].map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 hover:shadow-md transition-all ${social.color}`}
                  >
                    <Icon icon={social.icon} className="size-5" />
                    <span className="font-semibold text-sm">{social.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

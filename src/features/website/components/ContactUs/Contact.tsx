import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Input, Text } from '@/components'
import { Select } from '@/components/Select'
import { Button } from '@/components/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn, Icon } from '@/libs'
import { createTicket } from '@/services'
import { useToast } from '@/hooks'

import {
  PURCHASE_WHATSAPP_DISPLAY,
  PURCHASE_WHATSAPP_WA_ME,
  SUPPORT_PHONE_DISPLAY_SHORT,
  SUPPORT_PHONE_E164,
} from '@/utils/constants'
import { CONTACT_SUBJECT_OPTIONS, getContactSubjectLabel } from '@/utils/constants/contact'
import { ContactUsSchema } from '@/utils/schemas'
import { z } from 'zod'

const QUICK_CONTACT_LINKS = [
  {
    label: 'Call',
    value: SUPPORT_PHONE_DISPLAY_SHORT,
    href: `tel:${SUPPORT_PHONE_E164}`,
    icon: 'mdi:phone',
    iconClass: 'bg-primary-500',
  },
  {
    label: 'WhatsApp',
    value: 'Chat',
    href: `https://wa.me/${PURCHASE_WHATSAPP_WA_ME}`,
    icon: 'mdi:whatsapp',
    iconClass: 'bg-[#25d366]',
    external: true,
  },
  {
    label: 'Email',
    value: 'Email',
    href: 'mailto:support@dashqard.com',
    icon: 'mdi:email',
    iconClass: 'bg-[#ea4335]',
  },
] as const

export default function Contact() {
  const { success, error } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMobileForm, setShowMobileForm] = useState(false)
  const form = useForm<z.infer<typeof ContactUsSchema>>({
    resolver: zodResolver(ContactUsSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof ContactUsSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await createTicket({
        name: data.name,
        email: data.email,
        subject: getContactSubjectLabel(data.subject),
        message: data.message,
      })
      success(response?.message || "Ticket created successfully. We'll get back to you soon!")
      form.reset({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
      setShowMobileForm(false)
    } catch (err: any) {
      error(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to create ticket. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactForm = (
    <form className="flex flex-col gap-2.5 md:gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-4">
        <Input
          label="Name"
          placeholder="Your name"
          className="max-md:[&_label]:text-xs"
          {...form.register('name')}
          error={form.formState.errors.name?.message}
        />
        <Input
          label="Email"
          placeholder="Your email"
          className="max-md:[&_label]:text-xs"
          {...form.register('email')}
          error={form.formState.errors.email?.message}
        />
      </div>
      <Controller
        control={form.control}
        name="subject"
        render={({ field }) => (
          <Select
            label="Subject"
            placeholder="Select a subject"
            className="max-md:[&_label]:text-xs"
            options={CONTACT_SUBJECT_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={form.formState.errors.subject?.message}
          />
        )}
      />
      <Input
        type="textarea"
        rows={3}
        label="Message"
        className="max-md:[&_label]:text-xs"
        innerClassName="!h-auto !min-h-0 max-md:!py-2"
        inputClassName="!min-h-[4.5rem] md:!min-h-[9rem] max-md:resize-none md:resize-y"
        placeholder="Your message"
        {...form.register('message')}
        error={form.formState.errors.message?.message}
      />

      <Button
        type="submit"
        variant="secondary"
        className="w-full mt-1 md:mt-6"
        icon="bi:send-fill"
        iconPosition="left"
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        Send Message
      </Button>
    </form>
  )

  return (
    <section className="py-8 md:py-12 max-md:pb-10">
      <div className="wrapper flex flex-col gap-4 md:gap-12 max-md:px-2">
        <header className="flex flex-col max-md:items-start md:items-center max-md:text-left md:text-center md:gap-5">
          <div className="hidden md:flex py-2 px-6 items-center gap-1 text-sm font-bold bg-primary-500 text-white rounded-full w-fit mx-auto">
            📞 Get In Touch
          </div>
          <h2 className="text-xl font-semibold text-gray-900 md:text-[40px] md:font-bold md:text-primary-500 md:relative md:inline-block">
            Contact Us
            <span
              className="absolute left-1/2 -translate-x-1/2 rounded-[2px] max-md:hidden"
              style={{
                bottom: '-8px',
                width: '80px',
                height: '4px',
                background: 'linear-gradient(90deg, #402d87, #5bd7dc)',
              }}
            />
          </h2>
          <p className="hidden md:block text-center max-w-[700px] w-full text-grey-500 mx-auto">
            Have questions? Need support? We're here for you! Connect with us and discover how
            DashQard can transform your gifting experience.
          </p>
        </header>

        <div className="md:hidden grid grid-cols-3 gap-2">
          {QUICK_CONTACT_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={'external' in link && link.external ? '_blank' : undefined}
              rel={'external' in link && link.external ? 'noopener noreferrer' : undefined}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-[#402d871a] bg-white p-3 text-center shadow-sm active:scale-[0.98]"
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-white',
                  link.iconClass,
                )}
              >
                <Icon icon={link.icon} className="size-5" />
              </div>
              <span className="text-xs font-semibold text-primary-500">{link.label}</span>
            </a>
          ))}
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
          <div className="hidden md:flex flex-col gap-6">
            <div
              className="p-8 rounded-[20px] flex flex-col gap-8"
              style={{
                boxShadow: '0 10px 20px #00000014',
                border: '1px solid rgba(64, 45, 135, 0.1)',
              }}
            >
              <section className="flex gap-4 pb-4 border-b border-b-[#402d871a]">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-500">
                  <Icon icon="bi:building-fill" className="size-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <Text variant="h2" weight="bold" className="text-primary-500">
                    Bulk/Corporate Gifting
                  </Text>
                  <p className="text-grey-500 text-sm">Perfect for businesses and organizations</p>
                </div>
              </section>
              <div className="flex flex-col gap-4">
                <section className="flex gap-4 p-4 bg-[#402d8708] rounded-[12px]">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-500">
                    <Icon icon="mdi:phone" className="size-6 text-white" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-grey-500 text-xs">Support Line</p>
                    <a
                      href={`tel:${SUPPORT_PHONE_E164}`}
                      className="text-primary-500 font-bold hover:underline"
                    >
                      {SUPPORT_PHONE_DISPLAY_SHORT}
                    </a>
                  </div>
                </section>
                <section className="flex gap-4 p-4 bg-[#402d8708] rounded-[12px]">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#25d366]">
                    <Icon icon="mdi:whatsapp" className="size-6 text-white" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-grey-500 text-xs">Purchase Line (WhatsApp)</p>
                    <a
                      href={`https://wa.me/${PURCHASE_WHATSAPP_WA_ME}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 font-bold hover:underline truncate"
                    >
                      {PURCHASE_WHATSAPP_DISPLAY}
                    </a>
                  </div>
                </section>
                <section className="flex gap-4 p-4 bg-[#402d8708] rounded-[12px]">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#ea4335]">
                    <Icon icon="mdi:email" className="size-6 text-white" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-grey-500 text-xs">Email Support</p>
                    <a
                      href="mailto:support@dashqard.com"
                      className="text-primary-500 font-bold hover:underline"
                    >
                      support@dashqard.com
                    </a>
                  </div>
                </section>
              </div>
            </div>
            <div className="flex flex-col gap-6 border border-[#402d871a] rounded-[12px] p-6 bg-primary-500">
              <div>
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fff3]">
                  <Icon icon="bi:star-fill" className="size-6 text-white" />
                </div>
                <Text variant="h2" weight="bold" className="text-white">
                  Special Services
                </Text>
              </div>

              <ul className="flex flex-col gap-2">
                <li className="flex items-center gap-2">
                  <Icon icon="bi:check-circle-fill" className="size-6 text-yellow-500" />
                  <p className="text-white text-sm">Private gift concierging</p>
                </li>
                <li className="flex items-center gap-2">
                  <Icon icon="bi:check-circle-fill" className="size-6 text-yellow-500" />
                  <p className="text-white text-sm">Employee reward programs</p>
                </li>
                <li className="flex items-center gap-2">
                  <Icon icon="bi:check-circle-fill" className="size-6 text-yellow-500" />
                  <p className="text-white text-sm">Vendor partnership opportunities</p>
                </li>
                <li className="flex items-center gap-2">
                  <Icon icon="bi:check-circle-fill" className="size-6 text-yellow-500" />
                  <p className="text-white text-sm">Custom bulk solutions</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col max-md:gap-3 md:gap-8">
            <div className="md:hidden">
              {!showMobileForm ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-primary-500/20 text-primary-500"
                  icon="bi:chat-dots"
                  iconPosition="left"
                  onClick={() => setShowMobileForm(true)}
                >
                  Send us a message
                </Button>
              ) : (
                <div className="rounded-xl border border-[#402d871a] bg-white p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary-500">Your message</p>
                    <button
                      type="button"
                      onClick={() => setShowMobileForm(false)}
                      className="text-xs font-medium text-grey-500 hover:text-gray-700"
                    >
                      Close
                    </button>
                  </div>
                  {contactForm}
                </div>
              )}
            </div>

            <div
              className="hidden md:flex md:flex-col md:gap-8 md:p-0 md:rounded-[20px]"
              style={{
                boxShadow: '0 10px 20px #00000014',
                border: '1px solid rgba(64, 45, 135, 0.1)',
              }}
            >
              <section className="flex flex-col text-center justify-center items-center gap-4 pb-4 border-b border-b-[#402d871a] px-8 pt-8">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #5bd7dc, #402d87)',
                  }}
                >
                  <Icon icon="bi:chat-dots-fill" className="size-6 text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <Text variant="h2" weight="bold" className="text-primary-500">
                    Send us a Message
                  </Text>
                  <p className="text-grey-500 text-sm">We&apos;ll reply within 24 hours</p>
                </div>
              </section>
              <div className="px-8 pb-8">{contactForm}</div>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}

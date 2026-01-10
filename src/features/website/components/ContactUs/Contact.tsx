import { useState } from 'react'
import { Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import { Icon } from '@/libs'
import { createTicket } from '@/services'
import { useToast } from '@/hooks'

import { ContactUsSchema } from '@/utils/schemas'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export default function Contact() {
  const { success, error } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<z.infer<typeof ContactUsSchema>>({
    resolver: zodResolver(ContactUsSchema),
  })

  const onSubmit = async (data: z.infer<typeof ContactUsSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await createTicket({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      })
      success(response?.message || "Ticket created successfully. We'll get back to you soon!")
      form.reset()
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

  return (
    <section className="py-12">
      <div className="wrapper flex flex-col gap-12">
        <section className="flex flex-col gap-5 justify-center items-center">
          <div className="py-2 px-6 flex items-center gap-1 text-sm font-bold bg-primary-500 text-white rounded-full w-fit">
            📞 Get In Touch
          </div>
          <p className="text-[40px] font-bold text-primary-500 relative inline-block">
            Contact Us
            <span
              className="absolute left-1/2 -translate-x-1/2 rounded-[2px]"
              style={{
                bottom: '-8px',
                width: '80px',
                height: '4px',
                background: 'linear-gradient(90deg, #402d87, #5bd7dc)',
              }}
            ></span>
          </p>
          <p className="text-center max-w-[700px] w-full text-grey-500">
            Have questions? Need support? We're here for you! Connect with us and discover how
            DashQard can transform your gifting experience.
          </p>
        </section>
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div className="flex flex-col gap-6">
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
                  <div className="flex flex-col gap-1">
                    <p className="text-grey-500 text-xs">Support Line</p>
                    <p className="text-primary-500 font-bold">+233 54 202 2245</p>
                  </div>
                </section>
                <section className="flex gap-4 p-4 bg-[#402d8708] rounded-[12px]">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#25d366]">
                    <Icon icon="mdi:phone" className="size-6 text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-grey-500 text-xs">Purchase Line (WhatsApp)</p>
                    <p className="text-primary-500 font-bold">+233 56 608 0362</p>
                  </div>
                </section>
                <section className="flex gap-4 p-4 bg-[#402d8708] rounded-[12px]">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#ea4335]">
                    <Icon icon="mdi:email" className="size-6 text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-grey-500 text-xs">Email Support</p>
                    <p className="text-primary-500 font-bold">support@dashqard.com</p>
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
              <div>
                <p className="text-white font-normal text-sm">Ready to get started?</p>
                <button className="text-yellow-500 hover:text-yellow-500/80 cursor-pointer !rounded-4xl font-bold">
                  Get a DashQard!
                </button>
              </div>
            </div>
          </div>
          <div
            className="p-8 rounded-[20px] flex flex-col gap-8"
            style={{
              boxShadow: '0 10px 20px #00000014',
              border: '1px solid rgba(64, 45, 135, 0.1)',
            }}
          >
            <section className="flex flex-col text-center justify-center items-center gap-4 pb-4 border-b border-b-[#402d871a]">
              <div
                className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-500"
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
                <p className="text-grey-500 text-sm">We'll get back to you within 24 hours</p>
              </div>
            </section>
            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <Input
                label="Name"
                placeholder="Enter your name"
                {...form.register('name')}
                error={form.formState.errors.name?.message}
              />
              <Input
                label="Email"
                placeholder="Enter your email"
                {...form.register('email')}
                error={form.formState.errors.email?.message}
              />
              <Input
                label="Subject"
                placeholder="Enter your subject"
                {...form.register('subject')}
                error={form.formState.errors.subject?.message}
              />
              <Input
                type="textarea"
                rows={6}
                label="Message"
                innerClassName="!h-auto min-h-[200px]"
                placeholder="Tell us more about your inquiry"
                {...form.register('message')}
                error={form.formState.errors.message?.message}
              />

              <Button
                type="submit"
                className="w-full mt-6"
                variant="secondary"
                icon="bi:send-fill"
                iconPosition="left"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Send Message
              </Button>
            </form>
          </div>
        </section>
      </div>
    </section>
  )
}

import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { ROUTES } from '@/utils/constants'
import { BusinessDetailsSchema } from '@/utils/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../../auth/hooks'
import { useNavigate } from 'react-router-dom'
import { BasePhoneInput, RadioGroup, RadioGroupItem, Text } from '@/components'
import { useCountriesData, useUserProfile } from '@/hooks'
import React from 'react'

export default function BusinessDetailsForm() {
  const { useBusinessDetailsService } = useAuth()
  const { data: userProfile } = useUserProfile()
  const { mutate, isPending } = useBusinessDetailsService()
  const { countries } = useCountriesData()
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof BusinessDetailsSchema>>({
    resolver: zodResolver(BusinessDetailsSchema),
  })

  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile?.business_details[0]?.name,
        type: userProfile?.business_details[0]?.type,
        phone: userProfile?.business_details[0]?.phone,
        email: userProfile?.business_details[0]?.email,
        street_address: userProfile?.business_details[0]?.street_address,
        digital_address: userProfile?.business_details[0]?.digital_address,
        registration_number: userProfile?.business_details[0]?.registration_number,
      })
    }
  }, [userProfile])

  const onSubmit = (data: z.infer<typeof BusinessDetailsSchema>) => {
    mutate(data, {
      onSuccess: () => {
        navigate(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.BUSINESS_IDENTIFICATION_CARDS)
      },
    })
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <section className="flex sm:flex-row flex-col gap-10 border-b border-[#CDD3D3] pb-16">
        <div className="flex flex-col gap-2 max-w-[271px] w-full">
          <Text variant="h6" weight="normal" className="text-[#151819]">
            Business Details
          </Text>
          <p className="text-sm text-gray-500">Complete your business information</p>
        </div>
        <section className="flex flex-col gap-4 flex-1">
          <Input
            label="Business Name"
            placeholder="Provide your business name"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <Controller
            control={form.control}
            name="type"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <div className="flex flex-col gap-1">
                <Text as="h2" className="text-2xl font-bold">
                  Business Type
                </Text>
                <RadioGroup value={value} onValueChange={onChange}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="llc" id="r1" />
                    <Text as="label" htmlFor="r1" className="cursor-pointer">
                      LLC
                    </Text>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="sole_proprietor" id="r2" />
                    <Text as="label" htmlFor="r2" className="cursor-pointer">
                      Sole Proprietorship
                    </Text>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="partnership" id="r3" />
                    <Text as="label" htmlFor="r3" className="cursor-pointer">
                      Partnership
                    </Text>
                  </div>
                </RadioGroup>
                {error && <p className="text-sm text-red-500">{error.message}</p>}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="phone"
            render={({ field: { value, onChange } }) => {
              return (
                <BasePhoneInput
                  placeholder="Enter number eg. 5512345678"
                  options={countries}
                  selectedVal={value}
                  maxLength={10}
                  handleChange={onChange}
                  label="Business Phone Number"
                  error={form.formState.errors.phone?.message}
                />
              )
            }}
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            {...form.register('email')}
            type="email"
            error={form.formState.errors.email?.message}
          />

          <Input
            label="Street Address"
            placeholder="Enter your business street address"
            {...form.register('street_address')}
            error={form.formState.errors.street_address?.message}
          />

          <Input
            label="Ghana Post Digital Address"
            placeholder="Enter your Ghana Post Digital Address"
            {...form.register('digital_address')}
            error={form.formState.errors.digital_address?.message}
          />

          <Input
            label="Business Registration Number"
            placeholder="Enter your business registration number"
            {...form.register('registration_number')}
            error={form.formState.errors.registration_number?.message}
            maxLength={10}
          />
        </section>
      </section>

      <div className="flex gap-4">
        <Button type="button" variant="outline" className="w-fit" onClick={() => navigate(-1)}>
          Discard
        </Button>
        <Button
          disabled={!form.formState.isValid || isPending}
          loading={isPending}
          type="submit"
          variant="secondary"
          className="w-fit"
        >
          Next
        </Button>
      </div>
    </form>
  )
}

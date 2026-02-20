import React, { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, Input, DateInput } from '@/components'
import { useUserProfile } from '@/hooks'
import { UpdateUserInfoSchema } from '@/utils/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUserInfo } from '../../hooks'
import { z } from 'zod'

export default function UpdateUserProfile() {
  const { useUpdateUserInfoService } = useUserInfo()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { mutate: updateUserInfo, isPending: isUpdatingUserInfo } = useUpdateUserInfoService()
  const form = useForm<z.infer<typeof UpdateUserInfoSchema>>({
    resolver: zodResolver(UpdateUserInfoSchema),
  })

  React.useEffect(() => {
    if (userProfileData) {
      form.reset({
        fullname: userProfileData?.fullname || '',
        dob: userProfileData?.dob || '',
      })
    }
  }, [userProfileData, form])

  const dobMaxDate = useMemo(() => {
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    return maxDate.toISOString().split('T')[0]
  }, [])

  const onSubmit = (data: z.infer<typeof UpdateUserInfoSchema>) => {
    const payload = {
      full_name: data.fullname,
      dob: data.dob,
    }
    updateUserInfo(payload)
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <h6 className="text-base font-semibold text-gray-700 mb-5 pb-2 border-b-2 border-gray-200 flex items-center">
          <span className="w-1 h-4 bg-[#402D87] mr-2"></span>
          Basic Information
        </h6>

        <Input
          {...form.register('fullname')}
          placeholder="Enter your full name"
          className="w-full"
        />

        <Input
          type="email"
          value={userProfileData?.email || ''}
          disabled
          readOnly
          placeholder="Enter your email"
          className="w-full"
          innerClassName="pr-12"
        />

        <Controller
          name="dob"
          control={form.control}
          render={({ field }) => {
            const dobError = form.formState.errors.dob?.message
            const normalizedValue = (() => {
              if (!field.value || !field.value.trim()) return undefined
              const d = new Date(field.value.trim() + 'T12:00:00')
              if (Number.isNaN(d.getTime())) return undefined
              return d
            })()
            return (
              <DateInput
                label="Date of Birth"
                id="dob"
                placeholder="Select or type date (dd/mm/yyyy)"
                dateFormat="dd/MM/yyyy"
                value={normalizedValue}
                maxDate={new Date(dobMaxDate + 'T12:00:00')}
                strictParsing
                onChange={(date: Date | null) => {
                  if (!date) {
                    field.onChange('')
                    requestAnimationFrame(() => form.trigger('dob'))
                    return
                  }
                  const y = date.getFullYear()
                  const fixedDate =
                    y >= 0 && y <= 99
                      ? new Date(y <= 50 ? 2000 + y : 1900 + y, date.getMonth(), date.getDate())
                      : date
                  const next = fixedDate.toISOString().split('T')[0]
                  field.onChange(next)
                  requestAnimationFrame(() => form.trigger('dob'))
                }}
                error={dobError}
              />
            )
          }}
        />
      </div>
      <div className="flex gap-2 py-4 border-t border-gray-200">
        <Button type="submit" variant="secondary" loading={isUpdatingUserInfo}>
          Save
        </Button>
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

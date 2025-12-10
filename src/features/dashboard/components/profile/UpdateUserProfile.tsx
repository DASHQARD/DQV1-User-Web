import { Button, Input } from '@/components'
import { useUserProfile } from '@/hooks'
import { UpdateUserInfoSchema } from '@/utils/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useUserInfo } from '../../hooks'
import { z } from 'zod'

export default function UpdateUserProfile() {
  const { useUpdateUserInfoService } = useUserInfo()
  const { data: userProfile } = useUserProfile()
  const { mutate: updateUserInfo, isPending: isUpdatingUserInfo } = useUpdateUserInfoService()
  const form = useForm<z.infer<typeof UpdateUserInfoSchema>>({
    resolver: zodResolver(UpdateUserInfoSchema),
  })

  console.log('userProfile', userProfile)

  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        fullname: userProfile?.fullname || '',
        dob: userProfile?.dob || '',
        email: userProfile?.email || '',
      })
    }
  }, [userProfile, form])

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
          value={userProfile?.email || ''}
          disabled
          readOnly
          placeholder="Enter your email"
          className="w-full"
          innerClassName="pr-12"
        />

        <Input
          type="date"
          {...form.register('dob')}
          placeholder="Enter your date of birth"
          className="w-full"
          error={form.formState.errors.dob?.message}
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

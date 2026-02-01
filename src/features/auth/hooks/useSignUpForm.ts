import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreateAccountSchema } from '@/utils/schemas'
import { MODAL_NAMES } from '@/utils/constants'
import { useAuth } from './auth'
import { useCountriesData, usePersistedModalState } from '@/hooks'

export function useSignUpForm() {
  const { useSignUpMutation, useGetCountriesService } = useAuth()
  const { mutate, isPending } = useSignUpMutation()
  const { data: countries } = useGetCountriesService()
  const { countries: phoneCountries } = useCountriesData()
  const emailSentModal = usePersistedModalState<{ email?: string }>({
    paramName: MODAL_NAMES.AUTH.EMAIL_SENT,
  })

  const form = useForm<z.infer<typeof CreateAccountSchema>>({
    resolver: zodResolver(CreateAccountSchema),
    defaultValues: {
      country: 'Ghana',
      country_code: '01',
      user_type: 'user',
    },
  })

  useEffect(() => {
    if (countries && !form.getValues('country')) {
      const ghana = countries.find(
        (country: any) =>
          country.id === 1 || country.name === 'Ghana' || country.name?.toLowerCase() === 'ghana',
      )
      if (ghana) {
        form.setValue('country', String(ghana.id))
      }
    }
  }, [countries, form])

  const onSubmit = (data: z.infer<typeof CreateAccountSchema>) => {
    const transformedData = {
      ...data,
      phone_number: data.phone_number?.replace(/-/g, '') || data.phone_number,
    }
    mutate(transformedData, {
      onSuccess: () => {
        emailSentModal.openModal(MODAL_NAMES.AUTH.EMAIL_SENT, { email: data.email })
      },
    })
  }

  return {
    form,
    onSubmit,
    isPending,
    phoneCountries,
  }
}

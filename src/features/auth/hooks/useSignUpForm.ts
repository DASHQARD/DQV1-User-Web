import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { parsePhoneNumber } from 'react-phone-number-input'
import { CreateAccountSchema } from '@/utils/schemas'
import { MODAL_NAMES } from '@/utils/constants'
import { useAuth } from './auth'
import { useCountriesData, usePersistedModalState } from '@/hooks'

export type SignUpFormValues = z.infer<typeof CreateAccountSchema>

/** Empty sign-up form; reused for init and post-submit reset. */
export const SIGN_UP_FORM_DEFAULT_VALUES: SignUpFormValues = {
  email: '',
  phone_number: '',
  password: '',
  country: 'Ghana',
  country_code: '01',
  user_type: 'user',
}

function normalizeSignUpPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return ''

  const value = phoneNumber.trim()

  if (!value.startsWith('+')) {
    const digits = value.replace(/\D/g, '')
    return digits ? `+${digits}` : ''
  }

  try {
    const parsed = parsePhoneNumber(value)
    const e164 = parsed?.number
    if (e164) return e164
    return value.replace(/[^\d+]/g, '')
  } catch {
    return value.replace(/[^\d+]/g, '')
  }
}

export function useSignUpForm() {
  const { useSignUpMutation, useGetCountriesService } = useAuth()
  const { mutate, isPending } = useSignUpMutation()
  const { data: countries } = useGetCountriesService()
  const { countries: phoneCountries } = useCountriesData()
  const emailSentModal = usePersistedModalState<{ email?: string }>({
    paramName: MODAL_NAMES.AUTH.EMAIL_SENT,
  })

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(CreateAccountSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: SIGN_UP_FORM_DEFAULT_VALUES,
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

  const onSubmit = (data: SignUpFormValues) => {
    const transformedData = {
      ...data,
      phone_number: normalizeSignUpPhoneNumber(data.phone_number),
    }
    mutate(transformedData, {
      onSuccess: () => {
        emailSentModal.openModal(MODAL_NAMES.AUTH.EMAIL_SENT, { email: data.email })
        form.reset(SIGN_UP_FORM_DEFAULT_VALUES, {
          keepErrors: false,
          keepDirty: false,
          keepTouched: false,
          keepIsSubmitted: false,
          keepSubmitCount: false,
        })
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

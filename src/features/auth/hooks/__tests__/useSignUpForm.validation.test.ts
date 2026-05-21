import { describe, expect, it } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreateAccountSchema } from '@/utils/schemas'
import { EXAMPLE_PHONE_E164 } from '@/utils/constants'
import { SIGN_UP_FORM_DEFAULT_VALUES } from '../useSignUpForm'

const validValues = {
  email: 'user@example.com',
  phone_number: EXAMPLE_PHONE_E164,
  password: 'Test123!',
  user_type: 'user' as const,
  country: 'Ghana',
  country_code: '+233',
}

/** Mirrors useSignUpForm resolver + validation mode settings. */
function useSignUpFormValidationHarness() {
  const form = useForm<z.infer<typeof CreateAccountSchema>>({
    resolver: zodResolver(CreateAccountSchema),
    mode: 'onTouched' as const,
    reValidateMode: 'onChange' as const,
    defaultValues: SIGN_UP_FORM_DEFAULT_VALUES,
  })
  const { isValid, errors } = form.formState
  return { form, isValid, errors }
}

describe('sign-up form validation (email edit)', () => {
  it('SIGN_UP_FORM_DEFAULT_VALUES clears user-entered fields', () => {
    expect(SIGN_UP_FORM_DEFAULT_VALUES).toEqual({
      email: '',
      phone_number: '',
      password: '',
      country: 'Ghana',
      country_code: '01',
      user_type: 'user',
    })
  })

  it('reset restores empty defaults after a filled form', async () => {
    const { result } = renderHook(() => useSignUpFormValidationHarness())

    await act(async () => {
      await result.current.form.trigger()
    })

    await act(async () => {
      result.current.form.reset(SIGN_UP_FORM_DEFAULT_VALUES, {
        keepErrors: false,
        keepDirty: false,
        keepTouched: false,
        keepIsSubmitted: false,
        keepSubmitCount: false,
      })
    })

    expect(result.current.form.getValues()).toEqual(SIGN_UP_FORM_DEFAULT_VALUES)
    await waitFor(() => {
      expect(result.current.isValid).toBe(false)
    })
  })

  it('CreateAccountSchema accepts harness values', () => {
    expect(CreateAccountSchema.safeParse(validValues).success).toBe(true)
  })

  async function fillValidSignUpForm(form: ReturnType<typeof useSignUpFormValidationHarness>['form']) {
    await act(async () => {
      form.setValue('email', validValues.email, { shouldTouch: true })
      form.setValue('phone_number', validValues.phone_number, { shouldTouch: true })
      form.setValue('password', validValues.password, { shouldTouch: true })
      await form.trigger()
    })
  }

  it('keeps isValid true after email is changed post-touch', async () => {
    const { result } = renderHook(() => useSignUpFormValidationHarness())

    await fillValidSignUpForm(result.current.form)

    await waitFor(() => {
      expect(result.current.isValid).toBe(true)
    })

    await act(async () => {
      result.current.form.setValue('email', 'updated.user@example.com', { shouldTouch: true })
      await result.current.form.trigger('email')
    })

    await waitFor(() => {
      expect(result.current.isValid).toBe(true)
    })
  })

  it('disables isValid while email is invalid, then re-enables after fix', async () => {
    const { result } = renderHook(() => useSignUpFormValidationHarness())

    await fillValidSignUpForm(result.current.form)

    await waitFor(() => {
      expect(result.current.isValid).toBe(true)
    })

    await act(async () => {
      result.current.form.setValue('email', 'not-an-email', { shouldTouch: true })
      await result.current.form.trigger('email')
    })

    await waitFor(() => {
      expect(result.current.isValid).toBe(false)
    })

    await act(async () => {
      result.current.form.setValue('email', 'fixed@example.com', { shouldTouch: true })
      await result.current.form.trigger('email')
    })

    await waitFor(() => {
      expect(result.current.isValid).toBe(true)
    })
  })
})

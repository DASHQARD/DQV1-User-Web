import React from 'react'
import {
  type FieldValues,
  useForm as useReactHookForm,
  type UseFormProps,
  useFormState,
  useWatch,
} from 'react-hook-form'

import { defu } from 'defu'

import { getTarget } from '../utils/helpers'

export function useCustomForm<T extends FieldValues>(formOptions: UseFormProps<T>) {
  const defaultOptions = { mode: 'all' } as UseFormProps<T>
  const formMethods = useReactHookForm<T>(defu(formOptions, defaultOptions))
  const formState = useFormState({ control: formMethods.control })
  const values = useWatch({ control: formMethods.control })

  const register = React.useCallback(
    (...args: Parameters<typeof formMethods.register>) => ({
      ...formMethods.register(...args),
      error: getTarget(formState.errors, args[0])?.message,
      value: getTarget(values, args[0]),
      defaultValue: getTarget(values, args[0]),
    }),
    [formMethods, formState.errors, values],
  )

  /** use case: where initial value for select component is used, or reset */
  const registerKeyed = React.useCallback(
    (...args: Parameters<typeof formMethods.register>) => ({
      ...register(...args),
      key: getTarget(values, args[0]),
    }),
    [formMethods, register, values],
  )

  return {
    ...formMethods,
    register,
    registerKeyed,
  }
}

import type { FieldValues, UseFormReturn } from 'react-hook-form'

/** Only surface field errors after blur or a submit attempt (avoids errors on initial page load). */
export function shouldShowFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: keyof T & string,
): boolean {
  const { touchedFields, submitCount } = form.formState
  return Boolean(touchedFields[name as keyof typeof touchedFields] || submitCount > 0)
}

export function getVisibleFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: keyof T & string,
): string | undefined {
  if (!shouldShowFieldError(form, name)) return undefined
  const message = form.formState.errors[name]?.message
  return typeof message === 'string' ? message : undefined
}

export function getVisibleControllerError<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: keyof T & string,
  message?: string,
): string | undefined {
  if (!shouldShowFieldError(form, name)) return undefined
  return message
}

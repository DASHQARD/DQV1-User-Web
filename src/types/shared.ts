import isEmail from 'validator/es/lib/isEmail'
import z from 'zod'

export function getOptionalStringSchema() {
  return z.string().optional().nullable()
}

export function getRequiredStringSchema(label: string = 'Field', message?: string) {
  return z.string().min(1, message || `${label} is required`)
}
export function getRequiredNumberSchema(label: string = 'Field') {
  return z.number().min(1, `${label} is required`)
}

export function getRequiredEmailSchema(label: string = 'Email') {
  return getRequiredStringSchema(label).refine((val) => isEmail(val), 'Invalid email')
}

export function getRequiredAlphaNumericStringSchema(label: string = 'Field') {
  return z
    .string()
    .min(8, { message: `${label} must be at least 8 characters long.` })
    .refine((val) => /\d/.test(val), {
      message: `${label} must include at least one number.`,
    })
    .refine((val) => /[a-zA-Z]/.test(val), {
      message: `${label} must include at least one letter.`,
    })
    .refine((val) => /[!@#$%^&*]/.test(val), {
      message: `${label} must contain at least one symbol.`,
    })
}

export function getRequiredOTPSchema(label: string = 'OTP') {
  return z.string().min(6, `${label} must be 6 digits`)
}

const nigerianPhoneRegex =
  /^(?:\+234|0)(?:070|080|081|090|091|70[1-9]|80[2-9]|81[0-9]|90[1-9]|91[0-2])\d{7}$/

export function getOptionalNigerianPhoneSchema() {
  return z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || nigerianPhoneRegex.test(val), 'Invalid Nigerian phone number format')
}

export function getFullNameSchema() {
  return z.string().refine(
    (value) => {
      const names = value.trim().split(/\s+/)
      return names.length >= 2 && names[0] && names[names.length - 1]
    },
    {
      message: 'Please provide both first name and last name.',
    },
  )
}

export function getValidNigerianPhoneNumber() {
  return z.string().regex(/^(\+?234|0)?[789]\d{9}$/, { message: 'Invalid phone number' })
}

export const getDigitSchema = (field = 'Field', minLength = 1) => {
  return z.string().refine((val) => /^\d+$/.test(val) && val.length >= minLength, {
    message: `The ${field} must be at least ${minLength} digits long`,
  })
}

export const freezeWalletSchema = z.object({
  frozen: z.boolean(),
  reason: getRequiredStringSchema('Reason'),
})
export const dailyLimitSchema = z.object({
  approved: z.boolean(),
  reason: getRequiredStringSchema('Reason'),
})

export const toggleCustomerStatusSchema = z.object({
  status: getRequiredStringSchema('Status'),
  reason: getRequiredStringSchema('Reason'),
})
export const deleteCustomerSchema = z.object({
  reason: getRequiredStringSchema('Reason'),
})

export const toggleSavingsStatusSchema = z.object({
  status: getRequiredStringSchema('Status'),
})

export type TierType = '1' | '2' | '3' | 'M1' | 'M2' | 'M3' | 'A1' | 'A2' | 'A3'

export type DropdownOption = {
  label: string
  value: string
}

export type TableCellProps<T extends Record<string, any> = { id: string }> = Readonly<{
  getValue: () => any
  row: {
    original: {
      id: string
      [key: string]: any
    } & T
  }
}>

export type CsvHeader = {
  name: string
  accessor: string
  transform?: (v: any) => string
}

export type QueryType = {
  page: number
  limit: number
  search: string
  status: string
  vendor_id: string
  branch_type: string
  is_single_branch: string
  parent_branch_id: string
  card_type: string
  card_id: string
  date_from: string
  date_to: string
  min_amount: string
  max_amount: string
  [key: string]: string | number
}

export type NativeEventHandler = (event: React.ChangeEvent<HTMLInputElement>) => void

export type PersistedModalStateOptions = {
  paramName?: string
  defaultValue?: string | null
  resetOnRouteChange?: boolean
}

export type PersistedModalStateReturn<TModalData = unknown> = {
  modalState: string | null
  modalData: TModalData | null
  openModal: (modalName: string, data?: TModalData) => void
  closeModal: () => void
  isModalOpen: (modalName?: string) => boolean
}

export type generateCsvParams = {
  headers: CsvHeader[]
  data: Record<string, any>[]
  fileName: string
  separator?: string
}

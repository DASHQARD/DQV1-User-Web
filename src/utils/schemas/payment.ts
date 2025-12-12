import { z } from 'zod'
import { getRequiredStringSchema } from './shared'

export const PaymentInfoSchema = z
  .object({
    payment_method: getRequiredStringSchema('Payment Method'),
    mobile_money_provider: z.string().optional(),
    mobile_money_number: z.string().optional(),
    bank_name: z.string().optional(),
    account_number: z.string().optional(),
    branch: z.string().optional(),
    account_name: z.string().optional(),
    sort_swift_code: z.string().optional(),
    become_vendor: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.payment_method === 'mobile_money') {
        return !!(data.mobile_money_provider && data.mobile_money_number)
      }
      return true
    },
    {
      message: 'Mobile Money Provider and Mobile Money Number are required',
      path: ['mobile_money_provider'],
    },
  )
  .refine(
    (data) => {
      if (data.payment_method === 'mobile_money') {
        return !!(data.mobile_money_provider && data.mobile_money_number)
      }
      return true
    },
    {
      message: 'Mobile Money Provider and Mobile Money Number are required',
      path: ['mobile_money_number'],
    },
  )
  .refine(
    (data) => {
      if (data.payment_method === 'bank') {
        return !!(
          data.bank_name &&
          data.account_number &&
          data.branch &&
          data.account_name &&
          data.sort_swift_code
        )
      }
      return true
    },
    {
      message:
        'All bank details are required (Bank Name, Account Number, Branch, Account Name, Sort/Swift Code)',
      path: ['bank_name'],
    },
  )

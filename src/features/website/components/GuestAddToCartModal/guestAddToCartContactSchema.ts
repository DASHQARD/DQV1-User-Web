import { z } from 'zod'
import { getRequiredInternationalPhoneSchema } from '@/utils/schemas/shared'

export const guestAddToCartContactSchema = z.object({
  guest_phone: getRequiredInternationalPhoneSchema('Phone number'),
})

export type GuestAddToCartContactFormData = z.infer<typeof guestAddToCartContactSchema>

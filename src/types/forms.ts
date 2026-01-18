import type z from 'zod'
import type {
  InviteAdminSchema,
  AcceptCorporateAdminInvitationSchema,
  ToggleCustomerStatusSchema,
} from '@/utils/schemas'

export type ToggleCustomerStatusSchemaType = z.infer<typeof ToggleCustomerStatusSchema>
export type InviteAdminPayload = z.infer<typeof InviteAdminSchema>
export type AcceptCorporateAdminInvitationPayload = z.infer<
  typeof AcceptCorporateAdminInvitationSchema
>

export interface CreateVendorPayload {
  vendor_name_details: {
    use_corporate_info: boolean
    vendor_name: string
  }
  personal_details: {
    use_corporate_info: boolean
    first_name: string
    last_name: string
    dob: string
    street_address: string
    id_type: string
    id_number: string
    id_front_image_url: string
    id_back_image_url: string
  }
  business_details: {
    use_corporate_info: boolean
    type: 'llc' | 'sole_proprietor' | 'partnership'
    phone_number: string
    email: string
    street_address: string
    digital_address: string
    registration_number: string
    industry: string
    country: string
    country_code: string
    employer_identification_number: string
    logo: string
  }
  business_documents: {
    use_corporate_info: boolean
    employer_identification_number: string
    business_industry: string
    files: Array<{
      type: string
      file_url: string
      file_name: string
    }>
  }
}

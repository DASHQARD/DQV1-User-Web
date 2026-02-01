import { z } from 'zod'
import { ProfileAndIdentitySchema, BusinessDetailsSchema, UploadBusinessIDSchema } from '../auth'

const vendorNameSchema = z.object({
  vendor_name: z.string().min(1, 'Vendor name is required'),
  use_corporate_info: z.boolean().optional(),
  checkbox_profile_same_as_corporate: z.boolean().optional(),
  checkbox_vendor_details_same_as_corporate: z.boolean().optional(),
})

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')

const optionalFileSchema = z.union([fileSchema, z.undefined(), z.null(), z.literal('')]).optional()

const conditionalProfileSchema = z
  .object({
    checkbox_profile_same_as_corporate: z.boolean().optional(),
    front_id: optionalFileSchema,
    back_id: optionalFileSchema,
  })
  .superRefine((data, ctx) => {
    if (data.checkbox_profile_same_as_corporate) {
      return
    }
    if (!data.front_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Front ID photo is required',
        path: ['front_id'],
      })
    }
  })

const conditionalBusinessDocsSchema = z
  .object({
    checkbox_vendor_details_same_as_corporate: z.boolean().optional(),
    logo: optionalFileSchema,
    certificate_of_incorporation: optionalFileSchema,
    business_license: optionalFileSchema,
  })
  .superRefine((data, ctx) => {
    if (data.checkbox_vendor_details_same_as_corporate) {
      return
    }
    if (!data.logo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Business logo is required',
        path: ['logo'],
      })
    }
    if (!data.certificate_of_incorporation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Certificate of Incorporation is required',
        path: ['certificate_of_incorporation'],
      })
    }
    if (!data.business_license) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Business License is required',
        path: ['business_license'],
      })
    }
  })

const businessDetailsSchemaWithoutName = BusinessDetailsSchema.omit({ name: true })

const uploadBusinessIDSchemaWithoutFiles = UploadBusinessIDSchema.omit({
  certificate_of_incorporation: true,
  business_license: true,
  utility_bill: true,
})

export const CreateVendorFormSchema = vendorNameSchema
  .merge(ProfileAndIdentitySchema.omit({ front_id: true, back_id: true }))
  .merge(conditionalProfileSchema)
  .merge(businessDetailsSchemaWithoutName)
  .merge(uploadBusinessIDSchemaWithoutFiles)
  .merge(conditionalBusinessDocsSchema)

export type CreateVendorFormData = z.infer<typeof CreateVendorFormSchema>

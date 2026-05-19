import { z } from 'zod'

import { CORPORATE_ONBOARDING_ID_TYPE_OPTIONS } from '@/utils/constants/idType'
import {
  ID_TYPE_VALUES,
  isValidDateOfBirth,
  isValidStreetAddress,
  validatePersonalInformationIdNumber,
} from '@/utils/validation/personalInformation'

const CORPORATE_ONBOARDING_ID_TYPE_VALUES = CORPORATE_ONBOARDING_ID_TYPE_OPTIONS.map(
  (option) => option.value,
)

import { getRequiredStringSchema } from './shared'

const idTypeEnum = z.enum(ID_TYPE_VALUES as [string, ...string[]], {
  message: 'Select a valid ID type',
})

export const personalInformationFullNameSchema = getRequiredStringSchema('Full Name').refine(
  (value) => {
    const names = value.trim().split(/\s+/)
    return names.length >= 2 && Boolean(names[0]) && Boolean(names[names.length - 1])
  },
  { message: 'Please provide both first name and last name.' },
)

export const personalInformationStreetAddressSchema = getRequiredStringSchema(
  'Street Address',
).refine(isValidStreetAddress, {
  message: 'Enter a complete street address (e.g. house number and street name).',
})

export const personalInformationDobSchema = getRequiredStringSchema('Date of Birth').refine(
  isValidDateOfBirth,
  { message: 'You must be at least 18 years old with a valid date of birth.' },
)

export const personalInformationIdTypeSchema = idTypeEnum

export const corporateOnboardingIdTypeSchema = z.enum(
  CORPORATE_ONBOARDING_ID_TYPE_VALUES as [string, ...string[]],
  { message: 'Select a valid ID type' },
)

export const personalInformationIdNumberSchema = getRequiredStringSchema('ID Number')

export const personalInformationFieldsSchema = z
  .object({
    full_name: personalInformationFullNameSchema,
    street_address: personalInformationStreetAddressSchema,
    dob: personalInformationDobSchema,
    id_type: personalInformationIdTypeSchema,
    id_number: personalInformationIdNumberSchema,
  })
  .superRefine(validatePersonalInformationIdNumber)

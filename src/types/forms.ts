import type z from 'zod'
import type { toggleSavingsStatusSchema } from './shared'

export type ToggleSavingsStatusSchemaType = z.infer<typeof toggleSavingsStatusSchema>

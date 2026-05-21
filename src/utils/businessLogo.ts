export type BusinessLogoProfile = {
  business_documents?: Array<{ type?: string; file_url?: string | null }> | null
  business_details?: Array<Record<string, unknown>> | null
  avatar?: string | null
}

/** Storage key for a business logo from profile API (documents first, then business_details.logo). */
export function getBusinessLogoFileKey(profile?: BusinessLogoProfile | null): string | null {
  if (!profile) return null

  const fromDocument = profile.business_documents?.find((doc) => doc.type === 'logo')?.file_url
  if (fromDocument) return fromDocument

  const fromDetails = profile.business_details?.[0]?.logo
  return typeof fromDetails === 'string' ? fromDetails : null
}

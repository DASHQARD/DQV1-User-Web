type BranchUserProfileLike = {
  id_images?: Array<{ file_url?: string | null }> | null
}

/** Branch managers use the first ID image from GET /users/info as their profile photo. */
export function getBranchUserAvatarUrl(profile?: BranchUserProfileLike | null): string | null {
  const url = profile?.id_images?.[0]?.file_url?.trim()
  return url || null
}

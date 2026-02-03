import React from 'react'
import { useUserProfile, useUploadFiles, usePresignedURL, useToast } from '@/hooks'
import { useVendorMutations } from '../useVendorMutations'

export function useBusinessLogoSettings() {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useUpdateBusinessLogoService } = useVendorMutations()
  const { mutateAsync: updateBusinessLogo, isPending } = useUpdateBusinessLogoService()
  const { mutateAsync: uploadFiles } = useUploadFiles()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const toast = useToast()

  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    const logoDoc = userProfileData?.business_documents?.find(
      (doc: { type?: string }) => doc.type === 'logo',
    )
    if (!logoDoc?.file_url) {
      setLogoUrl(null)
      return
    }

    let cancelled = false
    const loadLogo = async () => {
      try {
        const url = await fetchPresignedURL(logoDoc.file_url)
        if (!cancelled) setLogoUrl(url)
      } catch (error) {
        console.error('Failed to fetch logo', error)
        if (!cancelled) setLogoUrl(null)
      }
    }
    loadLogo()
    return () => {
      cancelled = true
    }
  }, [userProfileData?.business_documents, fetchPresignedURL])

  const handleFileChange = React.useCallback(
    async (file: File | null) => {
      if (!file) return

      try {
        const uploadedFiles = await uploadFiles([file])
        if (uploadedFiles && uploadedFiles.length > 0) {
          const first = uploadedFiles[0] as { file_url?: string; file_key?: string }
          const fileUrl = first.file_url ?? first.file_key
          if (fileUrl) {
            setUploadedFileUrl(fileUrl)
            toast.success('Logo uploaded successfully. Click Save to update.')
          }
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to upload logo'
        toast.error(message)
      }
    },
    [uploadFiles, toast],
  )

  const handleSave = React.useCallback(async () => {
    if (!uploadedFileUrl) {
      toast.error('Please upload a logo first')
      return
    }

    try {
      await updateBusinessLogo({ file_url: uploadedFileUrl })
      setUploadedFileUrl(null)
    } catch (error) {
      console.error('Failed to update logo:', error)
    }
  }, [uploadedFileUrl, updateBusinessLogo, toast])

  const businessName = userProfileData?.business_details?.[0]?.name || 'Business'

  return {
    logoUrl,
    uploadedFileUrl,
    businessName,
    handleFileChange,
    handleSave,
    isPending,
  }
}

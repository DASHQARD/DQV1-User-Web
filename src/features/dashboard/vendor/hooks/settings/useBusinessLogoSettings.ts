import React from 'react'
import { useUserProfile, useUploadFiles, useToast } from '@/hooks'
import { useVendorMutations } from '../useVendorMutations'

export function useBusinessLogoSettings() {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useUpdateBusinessLogoService } = useVendorMutations()
  const { mutateAsync: updateBusinessLogo, isPending } = useUpdateBusinessLogoService()
  const { mutateAsync: uploadFiles } = useUploadFiles()
  const toast = useToast()

  const [uploadedFileUrl, setUploadedFileUrl] = React.useState<string | null>(null)

  const logoUrl = React.useMemo(() => {
    const logoDoc = userProfileData?.business_documents?.find(
      (doc: { type?: string }) => doc.type === 'logo',
    )
    return logoDoc?.file_url || null
  }, [userProfileData?.business_documents])

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

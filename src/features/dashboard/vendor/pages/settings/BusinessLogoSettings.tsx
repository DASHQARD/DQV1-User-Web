import React from 'react'
import { FileUploader, Text, Button, Avatar } from '@/components'
import { useVendorMutations } from '../../hooks/useVendorMutations'
import { useUserProfile, useUploadFiles, usePresignedURL } from '@/hooks'
import { useToast } from '@/hooks'

export function BusinessLogoSettings() {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useUpdateBusinessLogoService } = useVendorMutations()
  const { mutateAsync: updateBusinessLogo, isPending } = useUpdateBusinessLogoService()
  const { mutateAsync: uploadFiles } = useUploadFiles()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const toast = useToast()
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = React.useState<string | null>(null)

  // Fetch current logo
  React.useEffect(() => {
    const logoDoc = userProfileData?.business_documents?.find((doc: any) => doc.type === 'logo')
    if (!logoDoc?.file_url) {
      setLogoUrl(null)
      return
    }

    let cancelled = false
    const loadLogo = async () => {
      try {
        const url = await fetchPresignedURL(logoDoc.file_url)
        if (!cancelled) {
          setLogoUrl(url)
        }
      } catch (error) {
        console.error('Failed to fetch logo', error)
        if (!cancelled) {
          setLogoUrl(null)
        }
      }
    }
    loadLogo()
    return () => {
      cancelled = true
    }
  }, [userProfileData?.business_documents, fetchPresignedURL])

  const handleFileChange = async (file: File | null) => {
    if (!file) return

    try {
      const uploadedFiles = await uploadFiles([file])
      if (uploadedFiles && uploadedFiles.length > 0) {
        const fileUrl = (uploadedFiles[0] as any).file_url || (uploadedFiles[0] as any).file_key
        setUploadedFileUrl(fileUrl)
        toast.success('Logo uploaded successfully. Click Save to update.')
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload logo')
    }
  }

  const handleSave = async () => {
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
  }

  const businessName = userProfileData?.business_details?.[0]?.name || 'Business'

  return (
    <div className="space-y-6">
      <div>
        <Text variant="h6" weight="medium" className="mb-2">
          Current Logo
        </Text>
        <div className="flex items-center gap-4">
          <Avatar size="lg" src={logoUrl} name={businessName} />
          <div>
            <Text variant="span" className="text-sm text-gray-600">
              {logoUrl ? 'Logo is set' : 'No logo uploaded'}
            </Text>
          </div>
        </div>
      </div>

      <div>
        <Text variant="h6" weight="medium" className="mb-2">
          Upload New Logo
        </Text>
        <FileUploader onChange={handleFileChange} accept="image/*" />
        <Text variant="span" className="text-xs text-gray-500 mt-2 block">
          Recommended: Square image, at least 200x200px, max 5MB
        </Text>
      </div>

      {uploadedFileUrl && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={handleSave} loading={isPending}>
            Save Logo
          </Button>
        </div>
      )}
    </div>
  )
}

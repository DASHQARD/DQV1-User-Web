import { FileUploader, Text, Button, Avatar } from '@/components'
import { useBusinessLogoSettings } from '@/features/dashboard/vendor/hooks'

export function BusinessLogoSettings() {
  const { logoUrl, uploadedFileUrl, businessName, handleFileChange, handleSave, isPending } =
    useBusinessLogoSettings()

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

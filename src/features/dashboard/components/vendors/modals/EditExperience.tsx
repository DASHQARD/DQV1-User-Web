import { useState, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileUploader, Input, Combobox, Button, Modal, Text } from '@/components'
import { useUploadFiles, usePersistedModalState, usePresignedURL, useUserProfile } from '@/hooks'
import { useToast } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { useVendorMutations, vendorQueries } from '@/features'
import { CreateExperienceSchema } from '@/utils/schemas'
import { Icon } from '@/libs'
import { useBranchMutations } from '@/features/dashboard/branch/hooks'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'

type FormData = z.infer<typeof CreateExperienceSchema> & { id: number }

export function EditExperience() {
  const modal = usePersistedModalState({
    paramName: MODALS.EXPERIENCE.ROOT,
  })

  const card = modal.modalData as any

  const { useUpdateCardService } = useVendorMutations()
  const { mutateAsync: updateCard, isPending: isUpdating } = useUpdateCardService()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const { useBranchesService } = vendorQueries()
  const { data: branches } = useBranchesService()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = userProfileData?.user_type
  const isBranch = userType === 'branch'
  const isCorporateSuperAdmin = userType === 'corporate super admin'
  const { useUpdateBranchExperienceService } = useBranchMutations()
  const { mutateAsync: updateBranchExperience, isPending: isUpdatingBranchExperience } =
    useUpdateBranchExperienceService()
  const { useUpdateCorporateSuperAdminCardService } = corporateMutations()
  const { mutateAsync: updateCorporateCard, isPending: isUpdatingCorporateCard } =
    useUpdateCorporateSuperAdminCardService()

  const toast = useToast()

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [termsFiles, setTermsFiles] = useState<File[]>([])
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([])
  const [existingTermsUrls, setExistingTermsUrls] = useState<string[]>([])
  const [selectedBranches, setSelectedBranches] = useState<number[]>([])
  const [selectedBranchOptions, setSelectedBranchOptions] = useState<
    Array<{ label: string; value: string }>
  >([])

  const cardTypes = ['DashX', 'DashPass']

  const form = useForm<FormData>({
    resolver: zodResolver(CreateExperienceSchema) as any,
    defaultValues: {
      id: card?.id || 0,
      product: card?.product || '',
      description: card?.description || '',
      type: card?.type || '',
      price: card?.price ? parseFloat(card.price) : 0,
      currency: card?.currency || 'GHS',
      issue_date: card?.issue_date ? card.issue_date.split('T')[0] : '',
      expiry_date: card?.expiry_date ? card.expiry_date.split('T')[0] : '',
      images: [],
      terms_and_conditions: [],
      redemption_branches: [],
    },
  })

  const isModalOpen = modal.isModalOpen(MODALS.EXPERIENCE.EDIT)

  useEffect(() => {
    if (!isModalOpen || !card) return
    form.reset({
      id: card.id,
      product: card.product,
      description: card.description,
      type: card.type,
      price: card.price ? parseFloat(card.price) : 0,
      currency: card.currency || 'GHS',
      issue_date: card.issue_date ? card.issue_date.split('T')[0] : '',
      expiry_date: card.expiry_date ? card.expiry_date.split('T')[0] : '',
      images: [],
      terms_and_conditions: [],
      redemption_branches: [],
    })
  }, [isModalOpen, card])
  // Load existing images and terms
  useEffect(() => {
    if (!isModalOpen || !card) return

    const loadExistingFiles = async () => {
      if (card.images && card.images.length > 0) {
        const imagePromises = card.images.map((img: any) =>
          fetchPresignedURL(img.file_url).catch(() => null),
        )
        const imageResults = await Promise.all(imagePromises)
        setExistingImageUrls(imageResults.filter(Boolean) as string[])
      }

      if (card.terms_and_conditions && card.terms_and_conditions.length > 0) {
        const termsPromises = card.terms_and_conditions.map((term: any) =>
          fetchPresignedURL(term.file_url).catch(() => null),
        )
        const termsResults = await Promise.all(termsPromises)
        setExistingTermsUrls(termsResults.filter(Boolean) as string[])
      }
    }

    loadExistingFiles()
  }, [isModalOpen, card, fetchPresignedURL])

  useEffect(() => {
    if (!isModalOpen) {
      form.reset()
      setImageFiles([])
      setTermsFiles([])
      setExistingImageUrls([])
      setExistingTermsUrls([])
      setSelectedBranches([])
      setSelectedBranchOptions([])
    }
  }, [isModalOpen, form])

  const handleImageChange = (index: number, file: File | null) => {
    const newFiles = [...imageFiles]
    if (file) {
      newFiles[index] = file
    } else {
      newFiles.splice(index, 1)
    }
    setImageFiles(newFiles.filter(Boolean) as File[])
  }

  const handleTermsChange = (index: number, file: File | null) => {
    const newFiles = [...termsFiles]
    if (file) {
      newFiles[index] = file
    } else {
      newFiles.splice(index, 1)
    }
    setTermsFiles(newFiles.filter(Boolean) as File[])
  }

  const branchesArray = Array.isArray(branches) ? branches : branches?.data || []
  const branchOptions =
    branchesArray.length > 0
      ? [
          { label: 'All Branches', value: 'all' },
          ...branchesArray.map((branch: any) => ({
            label: `${branch.branch_name} - ${branch.branch_location}`,
            value: String(branch.id),
          })),
        ]
      : [{ label: 'All Branches', value: 'all' }]

  const handleBranchOptionChange = (
    selectedOptions: Array<{ label: string; value: string }> | null,
  ) => {
    const options = selectedOptions || []
    setSelectedBranchOptions(options)

    const hasAllBranches = options.some((opt) => opt.value === 'all')

    if (hasAllBranches) {
      setSelectedBranches(branchesArray.map((branch: any) => Number(branch.id)))
    } else {
      const branchIds = options.filter((opt) => opt.value !== 'all').map((opt) => Number(opt.value))
      setSelectedBranches(branchIds)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      let uploadedImages = card.images || []
      let uploadedTerms = card.terms_and_conditions || []

      // Upload new images if any
      if (imageFiles.length > 0) {
        const imageUploadPromises = imageFiles.map((file) => uploadFiles([file]))
        const imageResponses = await Promise.all(imageUploadPromises)
        const newImages = imageResponses.map((response: any[], index: number) => ({
          file_url: response[0].file_key,
          file_name: imageFiles[index].name,
        }))
        uploadedImages = [...uploadedImages, ...newImages]
      }

      // Upload new terms if any
      if (termsFiles.length > 0) {
        const termsUploadPromises = termsFiles.map((file) => uploadFiles([file]))
        const termsResponses = await Promise.all(termsUploadPromises)
        const newTerms = termsResponses.map((response: any[], index: number) => ({
          file_url: response[0].file_key,
          file_name: termsFiles[index].name,
        }))
        uploadedTerms = [...uploadedTerms, ...newTerms]
      }

      const branchIds = selectedBranches

      const payload: any = {
        id: card.id,
        product: data.product,
        description: data.description,
        type: data.type,
        price: data.price,
        currency: data.currency,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date,
        images: uploadedImages,
        terms_and_conditions: uploadedTerms,
        redemption_branches: branchIds.length > 0 ? branchIds.map((id) => ({ branch_id: id })) : [],
      }

      const branchPayload: any = {
        card_id: card.id,
        product: data.product,
        description: data.description,
        type: data.type,
        price: data.price,
        currency: data.currency,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date,
        images: uploadedImages.map((img: any) => ({
          file_url: img.file_url,
          file_name: img.file_name,
        })),
        terms_and_conditions: uploadedTerms.map((img: any) => ({
          file_url: img.file_url,
          file_name: img.file_name,
        })),
        redemption_branches: [
          {
            branch_id: userProfileData?.branches?.[0]?.id,
          },
        ],
      }

      if (isCorporateSuperAdmin) {
        await updateCorporateCard({ id: card.id, data: payload })
      } else if (isBranch) {
        await updateBranchExperience(branchPayload)
      } else {
        await updateCard(payload)
      }

      modal.closeModal()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update experience. Please try again.')
    }
  }

  if (!card) return null

  const isPending =
    isUpdating || isUploading || isUpdatingBranchExperience || isUpdatingCorporateCard

  return (
    <Modal
      title="Edit Experience"
      position="side"
      isOpen={isModalOpen}
      setIsOpen={modal.closeModal}
      panelClass="!w-[864px] p-8"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Gift Card Name"
            className="col-span-full"
            placeholder="Enter product name"
            {...form.register('product')}
            error={form.formState.errors.product?.message}
          />

          <Controller
            control={form.control}
            name="type"
            render={({ field, fieldState: { error } }) => (
              <Combobox
                className="col-span-full"
                label="Type"
                options={cardTypes.map((type) => ({ label: type, value: type }))}
                {...field}
                error={error?.message}
                placeholder="Select card type"
              />
            )}
          />
        </div>

        <Input
          label="Description"
          placeholder="Enter product description"
          type="textarea"
          innerClassName="min-h-[100px]"
          rows={10}
          {...form.register('description')}
          error={form.formState.errors.description?.message}
        />

        <Input
          iconBefore={<span className="text-gray-400 font-medium">₵</span>}
          label="Price"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...form.register('price', { valueAsNumber: true })}
          error={form.formState.errors.price?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Issue Date"
            type="date"
            {...form.register('issue_date')}
            error={form.formState.errors.issue_date?.message}
          />
          <Input
            label="Expiry Date"
            type="date"
            {...form.register('expiry_date')}
            error={form.formState.errors.expiry_date?.message}
          />
        </div>

        {/* Existing Images */}
        {existingImageUrls.length > 0 && (
          <div>
            <Text variant="span" className="text-sm font-medium text-gray-700 mb-2">
              Existing Images
            </Text>
            <div className="grid grid-cols-3 gap-4">
              {existingImageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border"
                >
                  <img
                    src={url}
                    alt={`Existing ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Add New Images</label>
          <div className="space-y-3 grid grid-cols-2 gap-4">
            {[0, 1, 2].map((index) => (
              <FileUploader
                key={`image-${index}`}
                label={`Upload Image ${index + 1}`}
                value={imageFiles[index] || null}
                onChange={(file) => handleImageChange(index, file)}
                accept="image/*"
                id={`image-${index}`}
              />
            ))}
          </div>
        </div>

        {/* Existing Terms */}
        {existingTermsUrls.length > 0 && (
          <div>
            <Text variant="span" className="text-sm font-medium text-gray-700 mb-2">
              Existing Terms and Conditions
            </Text>
            <div className="flex flex-col gap-2">
              {existingTermsUrls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Icon icon="bi:file-earmark-pdf" className="text-lg" />
                  <span>
                    {card.terms_and_conditions?.[index]?.file_name || `Terms ${index + 1}`}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* New Terms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add New Terms and Conditions
          </label>
          <FileUploader
            label="Upload Terms and Conditions"
            value={termsFiles[0] || null}
            onChange={(file) => handleTermsChange(0, file)}
            accept=".pdf,.doc,.docx"
            id="terms"
          />
        </div>

        {/* Branch Selection */}
        {branchesArray.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <Combobox
              label="Select Branches"
              options={branchOptions}
              value={selectedBranchOptions}
              onChange={handleBranchOptionChange}
              placeholder="Select branches"
              isMulti
              isSearchable
            />
          </div>
        )}

        <div className="flex gap-4 border-t border-gray-200 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => modal.closeModal()}
            className="flex-1"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="secondary" className="flex-1" loading={isPending}>
            Update Experience
          </Button>
        </div>
      </form>
    </Modal>
  )
}

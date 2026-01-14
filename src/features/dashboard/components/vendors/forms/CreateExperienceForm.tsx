import { useState, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileUploader, Input, Combobox, Button, Text } from '@/components'
import { useUploadFiles } from '@/hooks'
import { useToast } from '@/hooks'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { MODALS, ROUTES } from '@/utils/constants'
import { useAuthStore } from '@/stores'
import { useVendorMutations, vendorQueries } from '@/features'
import { CreateExperienceSchema } from '@/utils/schemas'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'

type FormData = z.infer<typeof CreateExperienceSchema>

export default function CreateExperienceForm() {
  const navigate = useNavigate()
  const { useCreateExperienceService } = useVendorMutations()
  const { mutateAsync: createExperience, isPending: isCreating } = useCreateExperienceService()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()
  const { user } = useAuthStore()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useBranchesService } = vendorQueries()
  const { data: branches, isLoading: isLoadingBranches } = useBranchesService()
  const { useCreateBranchExperienceService } = useVendorMutations()
  const { mutateAsync: createBranchExperience, isPending: isCreatingBranchExperience } =
    useCreateBranchExperienceService()

  const toast = useToast()

  const modal = usePersistedModalState({
    paramName: MODALS.EXPERIENCE.CREATE,
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [termsFiles, setTermsFiles] = useState<File[]>([])
  const [imageErrors, setImageErrors] = useState<string>('')
  const [termsErrors, setTermsErrors] = useState<string>('')
  const [selectedBranches, setSelectedBranches] = useState<number[]>([])
  const [selectedBranchOptions, setSelectedBranchOptions] = useState<
    Array<{ label: string; value: string }>
  >([])

  const userType = (user as any)?.user_type
  const isBranchManager = userType === 'branch'

  const cardTypes = ['DashX', 'DashPass']

  const form = useForm<FormData>({
    resolver: zodResolver(CreateExperienceSchema) as any,
    defaultValues: {
      product: '',
      description: '',
      type: '',
      price: 0,
      currency: 'GHS',
      issue_date: '',
      expiry_date: '',
      images: [],
      terms_and_conditions: [],
      redemption_branches: [],
    },
  })

  const isPending = isCreating || isUploading || isCreatingBranchExperience

  const isModalOpen = modal.isModalOpen(MODALS.EXPERIENCE.CREATE)

  // Auto-select branch for branch managers
  useEffect(() => {
    if (isBranchManager && userProfileData?.branches?.[0]?.id && isModalOpen) {
      const branchId = Number(userProfileData.branches[0].id)
      setSelectedBranches([branchId])
      setSelectedBranchOptions([
        {
          label: `${userProfileData.branches[0].branch_name} - ${userProfileData.branches[0].branch_location}`,
          value: String(branchId),
        },
      ])
    }
  }, [isBranchManager, userProfileData?.branches, isModalOpen])

  useEffect(() => {
    if (!isModalOpen) {
      form.reset()
      // Use setTimeout to defer state updates
      setTimeout(() => {
        setImageFiles([])
        setTermsFiles([])
        setImageErrors('')
        setTermsErrors('')
        setSelectedBranches([])
        setSelectedBranchOptions([])
      }, 0)
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
    setImageErrors('')
  }

  const handleTermsChange = (index: number, file: File | null) => {
    const newFiles = [...termsFiles]
    if (file) {
      newFiles[index] = file
    } else {
      newFiles.splice(index, 1)
    }
    setTermsFiles(newFiles.filter(Boolean) as File[])
    setTermsErrors('')
  }

  // Handle branch selection change (for multi-select)
  const handleBranchOptionChange = (
    selectedOptions: Array<{ label: string; value: string }> | null,
  ) => {
    const options = selectedOptions || []
    setSelectedBranchOptions(options)

    // Check if "All Branches" is selected
    const hasAllBranches = options.some((opt) => opt.value === 'all')

    if (hasAllBranches) {
      // If "All Branches" is selected, select all branch IDs
      const branchesArray = Array.isArray(branches) ? branches : branches?.data || []
      if (branchesArray.length > 0) {
        setSelectedBranches(branchesArray.map((branch: any) => Number(branch.id)))
      }
    } else {
      // Otherwise, use the selected branch IDs (excluding "all")
      const branchIds = options.filter((opt) => opt.value !== 'all').map((opt) => Number(opt.value))
      setSelectedBranches(branchIds)
    }
  }

  // Build branch options for the select
  // Handle both array response and wrapped response with data property
  const branchesArray = Array.isArray(branches) ? branches : branches?.data || []

  // Check if branches are available for vendors (not branch managers)
  const hasNoBranches = !isBranchManager && branchesArray.length === 0 && !isLoadingBranches

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

  const addAccountParam = (path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=vendor`
  }

  const onSubmit = async (data: FormData) => {
    console.log('data', data)
    try {
      // Validate files
      if (imageFiles.length === 0) {
        setImageErrors('At least one image is required')
        return
      }
      if (termsFiles.length === 0) {
        setTermsErrors('Terms and conditions file is required')
        return
      }

      // Upload images
      const imageUploadPromises = imageFiles.map((file) => uploadFiles([file]))
      const imageResponses = await Promise.all(imageUploadPromises)
      const uploadedImages = imageResponses.map((response: any[], index: number) => ({
        file_url: response[0].file_key,
        file_name: imageFiles[index].name,
      }))

      // Upload terms and conditions
      const termsUploadPromises = termsFiles.map((file) => uploadFiles([file]))
      const termsResponses = await Promise.all(termsUploadPromises)
      const uploadedTerms = termsResponses.map((response: any[], index: number) => ({
        file_url: response[0].file_key,
        file_name: termsFiles[index].name,
      }))

      // Use selected branches (already determined in handleBranchOptionChange)
      const branchIds = selectedBranches

      const payload: any = {
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

      if (isBranchManager) {
        await createBranchExperience(payload)
      } else {
        await createExperience(payload)
      }

      form.reset()
      setImageFiles([])
      setTermsFiles([])
      setSelectedBranches([])
      setSelectedBranchOptions([])
      modal.closeModal()
    } catch (error: any) {
      console.error('Error submitting experience:', error)
      toast.error(error?.message || 'Failed to create experience. Please try again.')
    }
  }

  // Show message if no branches available for vendors
  if (hasNoBranches) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Icon icon="bi:exclamation-triangle-fill" className="text-amber-600 text-xl" />
            </div>
            <div className="flex-1">
              <Text variant="h6" weight="semibold" className="text-amber-900 mb-2">
                No Branches Available
              </Text>
              <Text variant="p" className="text-amber-800 mb-4">
                You need to create at least one branch before you can create an experience. Please
                create a branch first.
              </Text>
              <Button
                variant="secondary"
                onClick={() => {
                  modal.closeModal()
                  navigate(addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.INVITE_BRANCH_MANAGER))
                }}
              >
                <Icon icon="bi:building-add" className="mr-2" />
                Create Branch
              </Button>
            </div>
          </div>
        </div>
        <div className="flex gap-4 border-t border-gray-200 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => modal.closeModal()}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
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
          min={new Date().toISOString().split('T')[0]}
          {...form.register('issue_date')}
          error={form.formState.errors.issue_date?.message}
        />
        <Input
          label="Expiry Date"
          type="date"
          min={new Date().toISOString().split('T')[0]}
          {...form.register('expiry_date')}
          error={form.formState.errors.expiry_date?.message}
        />
      </div>

      {/* Images Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images <span className="text-red-500">*</span>
        </label>
        {imageErrors && <p className="text-sm text-red-500 mb-2">{imageErrors}</p>}
        <div className="space-y-3 grid grid-cols-2 gap-4">
          {[0, 1, 2].map((index) => (
            <FileUploader
              key={`image-${index}`}
              label={`Upload Image ${index + 1}${index === 0 ? ' (Required)' : ''}`}
              value={imageFiles[index] || null}
              onChange={(file) => handleImageChange(index, file)}
              accept="image/*"
              id={`image-${index}`}
              error={index === 0 && imageErrors ? imageErrors : undefined}
            />
          ))}
        </div>
      </div>

      {/* Terms and Conditions Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Terms and Conditions <span className="text-red-500">*</span>
        </label>
        {termsErrors && <p className="text-sm text-red-500 mb-2">{termsErrors}</p>}
        <FileUploader
          label="Upload Terms and Conditions (Required)"
          value={termsFiles[0] || null}
          onChange={(file) => handleTermsChange(0, file)}
          accept=".pdf,.doc,.docx"
          id="terms"
          error={termsErrors || undefined}
        />
      </div>

      {/* Branch Selection */}
      {branchesArray.length > 0 && !isBranchManager && (
        <div className="border-t border-gray-200 pt-4">
          <Combobox
            label="Select Branches"
            options={branchOptions}
            value={selectedBranchOptions}
            onChange={handleBranchOptionChange}
            placeholder="Select branches (e.g., All Branches or Accra Main Branch - Airport Road)"
            isMulti
            isSearchable
          />
          {selectedBranchOptions.length > 0 && (
            <Text as="p" className="text-sm text-gray-600 mt-2">
              {selectedBranchOptions.some((opt) => opt.value === 'all')
                ? `All ${branchesArray.length} branches selected`
                : `${selectedBranchOptions.length} branch${selectedBranchOptions.length !== 1 ? 'es' : ''} selected`}
            </Text>
          )}
        </div>
      )}

      {/* Branch info for branch managers */}
      {isBranchManager && userProfileData?.branches?.[0] && (
        <div className="border-t border-gray-200 pt-4">
          <Text as="p" className="text-sm font-medium text-gray-700 mb-2">
            Branch
          </Text>
          <Text as="p" className="text-sm text-gray-600">
            {userProfileData.branches[0].branch_name} -{' '}
            {userProfileData.branches[0].branch_location}
          </Text>
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
            <strong>Note:</strong> Experiences created by branch managers require vendor admin
            approval before they become active.
          </p>
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
          Create Experience
        </Button>
      </div>
    </form>
  )
}

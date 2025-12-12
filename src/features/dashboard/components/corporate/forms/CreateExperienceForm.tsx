import { useState, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileUploader, Input, Combobox, Button, Checkbox, Text } from '@/components'
import { CreateCardSchema } from '@/utils/schemas/cards'
import { useCreateCard } from '@/features/dashboard/hooks'
import { useBranches } from '@/features/dashboard/hooks/useBranches'
import { useUploadFiles } from '@/hooks'
import { useToast } from '@/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { useAuthStore } from '@/stores'

type FormData = z.infer<typeof CreateCardSchema> & {
  branch_ids?: number[]
  select_all_branches?: boolean
}

export default function CreateExperienceForm() {
  const { mutateAsync: createCard, isPending: isCreating } = useCreateCard()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()
  const { data: branches } = useBranches()
  const { user } = useAuthStore()
  const toast = useToast()
  const queryClient = useQueryClient()
  const modal = usePersistedModalState({
    paramName: MODALS.EXPERIENCE.CREATE,
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [termsFiles, setTermsFiles] = useState<File[]>([])
  const [imageErrors, setImageErrors] = useState<string>('')
  const [termsErrors, setTermsErrors] = useState<string>('')
  const [selectedBranches, setSelectedBranches] = useState<number[]>([])
  const [selectAllBranches, setSelectAllBranches] = useState(false)

  const userType = (user as any)?.user_type
  const isBranchManager = userType === 'branch_manager'
  const isVendor = userType === 'vendor' || userType === 'corporate_vendor'

  const cardTypes = ['DashX', 'DashPass']

  const form = useForm<FormData>({
    resolver: zodResolver(CreateCardSchema) as any,
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
    },
  })

  const isPending = isCreating || isUploading

  const isModalOpen = modal.isModalOpen(MODALS.EXPERIENCE.CREATE)

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
        setSelectAllBranches(false)
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

  // Handle select all branches
  useEffect(() => {
    if (selectAllBranches && branches?.data) {
      const branchIds = branches.data.map((branch) => Number(branch.id))
      // Use setTimeout to defer state update
      setTimeout(() => setSelectedBranches(branchIds), 0)
    } else if (!selectAllBranches) {
      setTimeout(() => setSelectedBranches([]), 0)
    }
  }, [selectAllBranches, branches])

  const handleBranchToggle = (branchId: number) => {
    setSelectedBranches((prev) =>
      prev.includes(branchId) ? prev.filter((id) => id !== branchId) : [...prev, branchId],
    )
    if (selectAllBranches) {
      setSelectAllBranches(false)
    }
  }

  const onSubmit = async (data: FormData) => {
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

      // Determine branch IDs - if select all, use all branch IDs, otherwise use selected
      const branchIds =
        selectAllBranches && branches?.data
          ? branches.data.map((branch) => Number(branch.id))
          : selectedBranches

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
      }

      // Add branch IDs if vendor or branch manager
      if (isVendor || isBranchManager) {
        payload.branch_ids = branchIds
      }

      // If branch manager creates experience, it needs approval
      if (isBranchManager) {
        payload.requires_approval = true
        payload.status = 'pending'
      }

      await createCard(payload)
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success(
        isBranchManager ? 'Experience submitted for approval' : 'Experience created successfully',
      )
      form.reset()
      setImageFiles([])
      setTermsFiles([])
      setSelectedBranches([])
      setSelectAllBranches(false)
      modal.closeModal()
    } catch (error: any) {
      console.error('Error submitting experience:', error)
      toast.error(error?.message || 'Failed to create experience. Please try again.')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Product Name"
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

      {/* Branch Selection - Only for vendors and branch managers */}
      {(isVendor || isBranchManager) && branches?.data && branches.data.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <Text as="h3" className="text-lg font-semibold text-gray-900 mb-4">
            Available Branches
          </Text>
          <div className="space-y-3">
            <Checkbox
              id="select-all-branches"
              checked={selectAllBranches}
              onChange={(e) => setSelectAllBranches(e.target.checked)}
              label="Select all branches"
            />
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {branches.data.map((branch) => {
                const branchId = Number(branch.id)
                return (
                  <Checkbox
                    key={branch.id}
                    id={`branch-${branch.id}`}
                    checked={selectedBranches.includes(branchId)}
                    onChange={() => handleBranchToggle(branchId)}
                    label={`${branch.branch_name} - ${branch.branch_location}`}
                  />
                )
              })}
            </div>
            {isBranchManager && (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <strong>Note:</strong> Experiences created by branch managers require vendor admin
                approval before they become active.
              </p>
            )}
          </div>
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

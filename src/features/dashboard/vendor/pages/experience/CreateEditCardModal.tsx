import { useState, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, FileUploader, Input, Combobox } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { CreateCardSchema, UpdateCardSchema } from '@/utils/schemas/cards'
import { useCreateCard, useUpdateCard } from '@/features/dashboard/hooks'
import { useUploadFiles } from '@/hooks'
import { useToast } from '@/hooks'
import type { CardResponse } from '@/types/cards'

interface CreateEditCardModalProps {
  isOpen: boolean
  onClose: () => void
  editingCard?: CardResponse | null
}

export function CreateEditCardModal({ isOpen, onClose, editingCard }: CreateEditCardModalProps) {
  const isEditing = !!editingCard
  const { mutateAsync: createCard, isPending: isCreating } = useCreateCard()
  const { mutateAsync: updateCard, isPending: isUpdating } = useUpdateCard()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()
  const toast = useToast()
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [termsFiles, setTermsFiles] = useState<File[]>([])
  const [imageErrors, setImageErrors] = useState<string>('')
  const [termsErrors, setTermsErrors] = useState<string>('')

  const cardTypes = ['DashX', 'DashPass']

  type FormData = z.infer<typeof CreateCardSchema> | z.infer<typeof UpdateCardSchema>

  const form = useForm<FormData>({
    resolver: zodResolver(isEditing ? UpdateCardSchema : CreateCardSchema) as any,
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

  const isPending = isCreating || isUpdating || isUploading

  // Load editing card data
  useEffect(() => {
    if (!isOpen) return

    if (editingCard) {
      form.reset({
        product: editingCard.product,
        description: editingCard.description,
        type: editingCard.type,
        price: parseFloat(editingCard.price),
        currency: editingCard.currency,
        issue_date: editingCard.issue_date.split('T')[0],
        expiry_date: editingCard.expiry_date.split('T')[0],
        images: editingCard.images.map((img) => ({
          file_url: img.file_url,
          file_name: img.file_name,
        })),
        terms_and_conditions: editingCard.terms_and_conditions.map((tc) => ({
          file_url: tc.file_url,
          file_name: tc.file_name,
        })),
      })
    } else {
      form.reset({
        product: '',
        description: '',
        type: '',
        price: 0,
        currency: 'GHS',
        issue_date: '',
        expiry_date: '',
        images: [],
        terms_and_conditions: [],
      })
    }

    // Reset file states in a separate effect or use a ref to avoid cascading renders
    // Using setTimeout to defer state updates
    const timeoutId = setTimeout(() => {
      setImageFiles([])
      setTermsFiles([])
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [editingCard, isOpen, form])

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

  const onSubmit = async (data: FormData) => {
    try {
      setImageErrors('')
      setTermsErrors('')

      // Upload new image files
      const existingImages =
        editingCard?.images.map((img) => ({
          file_url: img.file_url,
          file_name: img.file_name,
        })) || []
      const newImageFiles = imageFiles.filter((f) => f)
      let uploadedImages: Array<{ file_url: string; file_name: string }> = []

      if (isEditing) {
        // When editing, combine existing with new
        uploadedImages = [...existingImages]
        if (newImageFiles.length > 0) {
          const imageUploadPromises = newImageFiles.map((file) => uploadFiles([file]))
          const imageResponses = await Promise.all(imageUploadPromises)
          const newUploadedImages = imageResponses.map((response: any[], index: number) => ({
            file_url: response[0].file_key,
            file_name: newImageFiles[index].name,
          }))
          uploadedImages = [...uploadedImages, ...newUploadedImages]
        }
      } else {
        // When creating, upload all new files
        if (newImageFiles.length === 0) {
          setImageErrors('At least one image is required')
          return
        }
        const imageUploadPromises = newImageFiles.map((file) => uploadFiles([file]))
        const imageResponses = await Promise.all(imageUploadPromises)
        uploadedImages = imageResponses.map((response: any[], index: number) => ({
          file_url: response[0].file_key,
          file_name: newImageFiles[index].name,
        }))
      }

      // Upload new terms files
      const existingTerms =
        editingCard?.terms_and_conditions.map((tc) => ({
          file_url: tc.file_url,
          file_name: tc.file_name,
        })) || []
      const newTermsFiles = termsFiles.filter((f) => f)
      let uploadedTerms: Array<{ file_url: string; file_name: string }> = []

      if (isEditing) {
        // When editing, combine existing with new
        uploadedTerms = [...existingTerms]
        if (newTermsFiles.length > 0) {
          const termsUploadPromises = newTermsFiles.map((file) => uploadFiles([file]))
          const termsResponses = await Promise.all(termsUploadPromises)
          const newUploadedTerms = termsResponses.map((response: any[], index: number) => ({
            file_url: response[0].file_key,
            file_name: newTermsFiles[index].name,
          }))
          uploadedTerms = [...uploadedTerms, ...newUploadedTerms]
        }
        // Ensure at least one terms file exists when editing
        if (uploadedTerms.length === 0) {
          setTermsErrors('At least one terms and conditions file is required')
          return
        }
      } else {
        // When creating, upload new files
        if (newTermsFiles.length === 0) {
          setTermsErrors('At least one terms and conditions file is required')
          return
        }
        const termsUploadPromises = newTermsFiles.map((file) => uploadFiles([file]))
        const termsResponses = await Promise.all(termsUploadPromises)
        uploadedTerms = termsResponses.map((response: any[], index: number) => ({
          file_url: response[0].file_key,
          file_name: newTermsFiles[index].name,
        }))
      }

      const payload = {
        ...data,
        images: uploadedImages,
        terms_and_conditions: uploadedTerms,
        ...(isEditing && { card_id: editingCard.id }),
      }

      if (isEditing) {
        await updateCard(payload as any)
      } else {
        await createCard(payload)
      }

      onClose()
    } catch (error: any) {
      console.error('Error submitting card:', error)
      toast.error(error?.message || 'Failed to submit card. Please try again.')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={(open) => !open && onClose()}
      showClose
      position="side"
      panelClass="md:w-[728px] w-full  overflow-y-auto"
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Experience' : 'Add Experience'}
        </h2>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...form.register('price', { valueAsNumber: true })}
              error={form.formState.errors.price?.message}
            />

            <Input
              label="Currency"
              placeholder="GHS"
              {...form.register('currency')}
              error={form.formState.errors.currency?.message}
            />
          </div>
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

          {/* Images Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images {!isEditing && <span className="text-red-500">*</span>}
            </label>
            {imageErrors && <p className="text-sm text-red-500 mb-2">{imageErrors}</p>}
            <div className="space-y-3">
              {/* Existing images */}
              {editingCard?.images.map((img, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <img
                    src={img.file_url}
                    alt={img.file_name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <span className="flex-1 text-sm text-gray-600">{img.file_name}</span>
                </div>
              ))}

              {/* New image uploaders */}
              {[0, 1, 2].map((index) => (
                <FileUploader
                  key={`new-image-${index}`}
                  label={`Upload Image ${index + 1}${index === 0 && !editingCard ? ' (Required)' : ''}`}
                  value={imageFiles[index] || null}
                  onChange={(file) => {
                    handleImageChange(index, file)
                    setImageErrors('')
                  }}
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
              Terms and Conditions {!isEditing && <span className="text-red-500">*</span>}
            </label>
            {termsErrors && <p className="text-sm text-red-500 mb-2">{termsErrors}</p>}
            <div className="space-y-3">
              {/* Existing terms */}
              {editingCard?.terms_and_conditions.map((tc, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <Icon icon="bi:file-earmark-pdf" className="w-6 h-6 text-red-500" />
                  <span className="flex-1 text-sm text-gray-600">{tc.file_name}</span>
                  <a
                    href={tc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#402D87] hover:underline"
                  >
                    View
                  </a>
                </div>
              ))}

              {/* New terms uploader */}
              <FileUploader
                label={`Upload Terms and Conditions${!editingCard ? ' (Required)' : ''}`}
                value={termsFiles[0] || null}
                onChange={(file) => {
                  handleTermsChange(0, file)
                  setTermsErrors('')
                }}
                accept=".pdf,.doc,.docx"
                id="terms"
                error={termsErrors || undefined}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="secondary" className="flex-1" loading={isPending}>
              {isEditing ? 'Update Experience' : 'Create Experience'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

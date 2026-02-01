import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/hooks'
import {
  useCountriesData,
  useUserProfile,
  useUploadFiles,
  usePresignedURL,
  useToast,
} from '@/hooks'
import { BusinessDetailsSchema, UploadBusinessIDSchema } from '@/utils/schemas'
import { ROUTES } from '@/utils/constants'

const CombinedBusinessSchema = BusinessDetailsSchema.merge(
  UploadBusinessIDSchema.omit({ utility_bill: true }),
)

const DRAFT_STORAGE_KEY = 'business_details_form_draft'

export type BusinessDetailsFormData = z.infer<typeof CombinedBusinessSchema>

export function useBusinessDetailsForm() {
  const navigate = useNavigate()
  const { useBusinessDetailsWithDocumentsService } = useAuth()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { mutateAsync: submitBusinessDetails, isPending: isSubmittingDetails } =
    useBusinessDetailsWithDocumentsService()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()
  const { mutateAsync: fetchPresignedURL, isPending: isFetchingPresignedURL } = usePresignedURL()
  const toast = useToast()
  const { countries: phoneCountries } = useCountriesData()

  const [documentUrls, setDocumentUrls] = useState<Record<string, string | null>>({})
  const [isSavingProgress, setIsSavingProgress] = useState(false)

  const form = useForm<BusinessDetailsFormData>({
    resolver: zodResolver(CombinedBusinessSchema),
    mode: 'onChange',
  })

  const saveProgress = useCallback(async () => {
    try {
      const draftData: Record<string, unknown> = {}
      const formValues = form.getValues()

      const nonFileFields: (keyof BusinessDetailsFormData)[] = [
        'name',
        'type',
        'phone',
        'email',
        'street_address',
        'digital_address',
        'registration_number',
        'employer_identification_number',
        'business_industry',
      ]

      nonFileFields.forEach((field) => {
        const val = formValues[field]
        if (val !== undefined && val !== null && val !== '') {
          draftData[field] = val
        }
      })

      const fileFields: (keyof BusinessDetailsFormData)[] = [
        'certificate_of_incorporation',
        'business_license',
        'articles_of_incorporation',
        'logo',
      ]

      for (const field of fileFields) {
        const file = formValues[field] as File | undefined
        if (file) {
          try {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
            draftData[`${field}_name`] = file.name
            draftData[`${field}_size`] = file.size
            draftData[`${field}_type`] = file.type
            draftData[`${field}_data`] = base64
          } catch (fileError) {
            console.error(`Failed to convert ${field} to base64:`, fileError)
            draftData[`${field}_name`] = file.name
            draftData[`${field}_size`] = file.size
            draftData[`${field}_type`] = file.type
          }
        }
      }

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData))
      return true
    } catch (error) {
      console.error('Failed to save progress:', error)
      return false
    }
  }, [form])

  const loadProgress = useCallback((): Record<string, unknown> | null => {
    try {
      const savedData = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (!savedData) return null

      const draftData = JSON.parse(savedData) as Record<string, unknown>
      const fileFields = [
        'certificate_of_incorporation',
        'business_license',
        'articles_of_incorporation',
        'logo',
      ]

      fileFields.forEach((field) => {
        const data = draftData[`${field}_data`]
        const name = draftData[`${field}_name`]
        const type = draftData[`${field}_type`]
        if (data && name && type) {
          try {
            const base64Data = String(data)
            const byteString = atob(base64Data.split(',')[1])
            const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0]
            const ab = new ArrayBuffer(byteString.length)
            const ia = new Uint8Array(ab)
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i)
            }
            const blob = new Blob([ab], { type: mimeString })
            const file = new File([blob], String(name), {
              type: String(type),
              lastModified: Date.now(),
            })
            draftData[field] = file
          } catch (fileError) {
            console.error(`Failed to convert ${field} from base64:`, fileError)
          }
        }
      })

      return draftData
    } catch (error) {
      console.error('Failed to load progress:', error)
      return null
    }
  }, [])

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear progress:', error)
    }
  }, [])

  const handleSaveProgress = useCallback(async () => {
    setIsSavingProgress(true)
    try {
      const success = await saveProgress()
      if (success) {
        toast.success('Progress saved successfully. You can continue later.')
      } else {
        toast.error('Failed to save progress. Please try again.')
      }
    } catch (error) {
      console.error('Error saving progress:', error)
      toast.error('Failed to save progress. Please try again.')
    } finally {
      setTimeout(() => setIsSavingProgress(false), 500)
    }
  }, [saveProgress, toast])

  useEffect(() => {
    if (!userProfileData?.business_documents?.length) return

    let cancelled = false

    const loadDocuments = async () => {
      try {
        const documentPromises = userProfileData.business_documents.map(async (doc) => {
          const url = await fetchPresignedURL(doc.file_url)
          return { type: doc.type, url }
        })
        const results = await Promise.all(documentPromises)
        if (cancelled) return

        const urlsMap: Record<string, string | null> = {}
        results.forEach(({ type, url }) => {
          urlsMap[type] = url
        })
        setDocumentUrls(urlsMap)
      } catch (error) {
        console.error('Failed to fetch business documents', error)
        if (!cancelled) toast.error('Unable to fetch existing business documents.')
      }
    }

    loadDocuments()
    return () => {
      cancelled = true
    }
  }, [fetchPresignedURL, toast, userProfileData])

  const isPending = isSubmittingDetails || isUploading || isFetchingPresignedURL

  useEffect(() => {
    const hasExistingData =
      userProfileData?.business_details &&
      Array.isArray(userProfileData.business_details) &&
      userProfileData.business_details.length > 0

    if (!hasExistingData) {
      const savedProgress = loadProgress()
      if (savedProgress) {
        form.reset({
          name: (savedProgress.name as string) || '',
          type: savedProgress.type as BusinessDetailsFormData['type'],
          phone: (savedProgress.phone as string) || '',
          email: (savedProgress.email as string) || '',
          street_address: (savedProgress.street_address as string) || '',
          digital_address: (savedProgress.digital_address as string) || '',
          registration_number: (savedProgress.registration_number as string) || '',
          employer_identification_number:
            (savedProgress.employer_identification_number as string) || '',
          business_industry: (savedProgress.business_industry as string) || '',
          certificate_of_incorporation: savedProgress.certificate_of_incorporation as
            | File
            | undefined,
          business_license: savedProgress.business_license as File | undefined,
          articles_of_incorporation: savedProgress.articles_of_incorporation as File | undefined,
          logo: savedProgress.logo as File | undefined,
        })
        setTimeout(() => {
          void form.trigger()
        }, 200)
        toast.success('Saved progress loaded. Continue where you left off.')
      }
    }
    // Only run on mount: load draft if user has no existing business details
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (
      !userProfileData?.business_details ||
      !Array.isArray(userProfileData.business_details) ||
      userProfileData.business_details.length === 0
    ) {
      return
    }
    const businessDetail = userProfileData.business_details[0]
    const firstDoc = userProfileData.business_documents?.[0]
    form.reset({
      name: businessDetail?.name || '',
      type: businessDetail?.type,
      phone: businessDetail?.phone || '',
      email: businessDetail?.email || '',
      street_address: businessDetail?.street_address || '',
      digital_address: businessDetail?.digital_address || '',
      registration_number: businessDetail?.registration_number || '',
      employer_identification_number: firstDoc?.employer_identification_number || '',
      business_industry: firstDoc?.business_industry || '',
    })
  }, [userProfileData, form])

  const onSubmit = useCallback(
    async (data: BusinessDetailsFormData) => {
      try {
        type DocumentType =
          | 'certificate_of_incorporation'
          | 'business_license'
          | 'articles_of_incorporation'
          | 'logo'

        const documentTypes: Array<{ file: File; type: DocumentType }> = [
          { file: data.logo, type: 'logo' },
          { file: data.certificate_of_incorporation, type: 'certificate_of_incorporation' },
          { file: data.business_license, type: 'business_license' },
          ...(data.articles_of_incorporation
            ? [{ file: data.articles_of_incorporation, type: 'articles_of_incorporation' as const }]
            : []),
        ]

        const uploadPromises = documentTypes.map((doc) => uploadFiles([doc.file]))
        const responses = await Promise.all(uploadPromises)

        const files = responses.map(
          (response: { file_name: string; file_key: string }[], index: number) => ({
            type: documentTypes[index].type,
            file_url: response[0].file_key,
            file_name: documentTypes[index].file.name,
          }),
        )

        await submitBusinessDetails(
          {
            name: data.name,
            type: data.type,
            phone: data.phone,
            email: data.email,
            street_address: data.street_address,
            digital_address: data.digital_address,
            registration_number: data.registration_number,
            country: 'Ghana',
            country_code: '01',
            employer_identification_number: data.employer_identification_number,
            business_industry: data.business_industry,
            files,
          },
          {
            onSuccess: () => {
              clearProgress()
              navigate(`${ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME}?account=corporate`)
            },
          },
        )
      } catch (error) {
        console.error('Submission failed:', error)
      }
    },
    [uploadFiles, submitBusinessDetails, clearProgress, navigate],
  )

  const handleDiscard = useCallback(() => {
    navigate(-1)
  }, [navigate])

  return {
    form,
    documentUrls,
    userProfileData,
    phoneCountries,
    isPending,
    isSavingProgress,
    onSubmit,
    handleSaveProgress,
    handleDiscard,
  }
}

import { Button } from '@/components/Button'
import { Input, FileUploader, CreatableCombobox, Text, Modal, ImageUpload } from '@/components'
import { BasePhoneInput, RadioGroup, RadioGroupItem } from '@/components'
import { BUSINESS_INDUSTRY_OPTIONS } from '@/utils/constants'
import { Controller } from 'react-hook-form'
import { cn } from '@/libs'
import LoaderGif from '@/assets/gifs/loader.gif'
import { useBusinessDetailsForm } from '../hooks/useBusinessDetailsForm'
import { BUSINESS_TYPE_OPTIONS } from '@/utils/constants'

export default function BusinessDetailsForm() {
  const {
    form,
    documentUrls,
    userProfileData,
    phoneCountries,
    isPending,
    isSavingProgress,
    onSubmit,
    handleSaveProgress,
    handleDiscard,
  } = useBusinessDetailsForm()

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <Text variant="h3" weight="semibold">
            Business Details
          </Text>
          <Text variant="span" className="text-[#A0AEC0]">
            Complete your business information
          </Text>
        </div>

        <hr className="border-[#F1F2F4]" />

        <section className="flex flex-col gap-4 flex-1">
          <Controller
            control={form.control}
            name="logo"
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              const existingUrl = documentUrls['logo']
              return (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <Text as="label" className="text-[#151819] text-sm font-medium">
                      Business Logo
                    </Text>
                    <span className="text-error">*</span>
                  </div>
                  <ImageUpload
                    file={value ?? null}
                    onFileChange={(f) => onChange(f ?? null)}
                    onUpload={() => {}}
                    isUploading={isPending}
                    currentImageUrl={existingUrl && !value ? existingUrl : undefined}
                    className="h-[120px]! w-[120px]!"
                  />
                  {error && <p className="text-sm text-red-500">{error.message}</p>}
                </div>
              )
            }}
          />
          <Controller
            control={form.control}
            name="type"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <div className="flex flex-col gap-2">
                <Text variant="h3" weight="semibold">
                  Business Type
                </Text>
                <RadioGroup value={value} onValueChange={onChange} className="flex flex-col gap-3">
                  {BUSINESS_TYPE_OPTIONS.map((opt) => {
                    const isSelected = value === opt.value
                    const id = `business-type-${opt.value}`
                    return (
                      <label
                        key={opt.value}
                        htmlFor={id}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors',
                          'bg-gray-50 hover:bg-gray-100',
                          isSelected ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200',
                        )}
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold text-gray-900">{opt.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{opt.description}</p>
                        </div>
                        <RadioGroupItem
                          value={opt.value}
                          id={id}
                          className={cn(
                            'shrink-0 size-5',
                            isSelected
                              ? 'border-primary-500 data-[state=checked]:border-primary-500'
                              : '',
                          )}
                        />
                      </label>
                    )
                  })}
                </RadioGroup>
                {error && <p className="text-sm text-red-500">{error.message}</p>}
              </div>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Name"
              isRequired
              placeholder="Provide your business name"
              {...form.register('name')}
              error={form.formState.errors.name?.message}
            />
            <Controller
              control={form.control}
              name="phone"
              render={({ field: { onChange } }) => (
                <BasePhoneInput
                  placeholder="Enter number eg. 5512345678"
                  options={phoneCountries}
                  isRequired
                  maxLength={14}
                  handleChange={onChange}
                  label="Phone Number"
                  error={form.formState.errors.phone?.message}
                  hint={
                    <>
                      Please enter your number in the format:{' '}
                      <span className="font-medium">5512345678</span>
                    </>
                  }
                />
              )}
            />
          </div>

          <Input
            label="Business Email"
            isRequired
            placeholder="Enter your email"
            {...form.register('email')}
            type="email"
            error={form.formState.errors.email?.message}
          />

          <Input
            label="Business Registration Number (VAT)"
            isRequired
            placeholder="Enter your business registration number (VAT)"
            {...form.register('registration_number')}
            error={form.formState.errors.registration_number?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Taxpayer Identification Number (TIN)"
              isRequired
              placeholder="Enter your Taxpayer Identification Number (TIN)"
              {...form.register('employer_identification_number')}
              error={form.formState.errors.employer_identification_number?.message}
            />
            <Controller
              control={form.control}
              name="business_industry"
              render={({ field: { onChange, value, name }, fieldState: { error } }) => (
                <CreatableCombobox
                  label="Business Industry"
                  isRequired
                  placeholder="Select or create your business industry"
                  options={BUSINESS_INDUSTRY_OPTIONS}
                  name={name}
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Street Address"
              isRequired
              placeholder="Enter your business street address"
              {...form.register('street_address')}
              error={form.formState.errors.street_address?.message}
            />
            <Input
              label="Business Ghana Post Digital Address"
              isRequired
              placeholder="Enter your Ghana Post Digital Address"
              {...form.register('digital_address')}
              error={form.formState.errors.digital_address?.message}
            />
          </div>
        </section>
      </section>

      {/* Business Documents Section */}
      <section className="flex flex-col gap-4 border-b border-[#CDD3D3] pb-16">
        <div className="flex flex-col gap-2 w-full">
          <Text variant="h6" weight="normal" className="text-[#151819]">
            Business Documents
          </Text>
          <p className="text-sm text-gray-500">Upload required business documents</p>
        </div>
        <section className="flex flex-col gap-4 flex-1">
          <div className="p-4 bg-[#EAEBEF]">
            <p className="text-sm text-gray-500 mb-2">
              Submit the following documents to help us verify your business.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Certificate of Incorporation (Required)</li>
              <li>Business License (Required)</li>
              <li>Articles of Incorporation (Optional)</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="certificate_of_incorporation"
              render={({ field: { onChange, value }, fieldState: { error } }) => {
                const existingUrl = documentUrls['certificate_of_incorporation']
                const existingDoc = userProfileData?.business_documents?.find(
                  (doc) => doc.type === 'certificate_of_incorporation',
                )
                return (
                  <div className="space-y-2">
                    {existingUrl && !value && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-48">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Current Document</p>
                        </div>
                        <img
                          src={existingUrl}
                          alt={existingDoc?.file_name || 'Certificate of Incorporation'}
                          className="max-h-48 w-full object-contain rounded border border-gray-200"
                        />
                      </div>
                    )}
                    <FileUploader
                      label={
                        existingUrl && !value
                          ? 'Replace Certificate of Incorporation'
                          : 'Upload Certificate of Incorporation'
                      }
                      value={value}
                      onChange={onChange}
                      error={error?.message}
                      id="certificate_of_incorporation"
                    />
                  </div>
                )
              }}
            />

            <Controller
              control={form.control}
              name="business_license"
              render={({ field: { onChange, value }, fieldState: { error } }) => {
                const existingUrl = documentUrls['business_license']
                const existingDoc = userProfileData?.business_documents?.find(
                  (doc) => doc.type === 'business_license',
                )
                return (
                  <div className="space-y-2">
                    {existingUrl && !value && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-48">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Current Document</p>
                        </div>
                        <img
                          src={existingUrl}
                          alt={existingDoc?.file_name || 'Business License'}
                          className="max-h-48 w-full object-contain rounded border border-gray-200"
                        />
                      </div>
                    )}
                    <FileUploader
                      label={
                        existingUrl && !value
                          ? 'Replace Business License'
                          : 'Upload Business License'
                      }
                      value={value}
                      onChange={onChange}
                      error={error?.message}
                      id="business_license"
                    />
                  </div>
                )
              }}
            />

            <Controller
              control={form.control}
              name="articles_of_incorporation"
              render={({ field: { onChange, value }, fieldState: { error } }) => {
                const existingUrl = documentUrls['articles_of_incorporation']
                const existingDoc = userProfileData?.business_documents?.find(
                  (doc) => doc.type === 'articles_of_incorporation',
                )
                return (
                  <div className="space-y-2">
                    {existingUrl && !value && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-48">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Current Document</p>
                        </div>
                        <img
                          src={existingUrl}
                          alt={existingDoc?.file_name || 'Articles of Incorporation'}
                          className="max-h-48 w-full object-contain rounded border border-gray-200"
                        />
                      </div>
                    )}
                    <FileUploader
                      label={
                        existingUrl && !value
                          ? 'Replace Articles of Incorporation (Optional)'
                          : 'Upload Articles of Incorporation (Optional)'
                      }
                      value={value || null}
                      onChange={onChange}
                      error={error?.message}
                      id="articles_of_incorporation"
                    />
                  </div>
                )
              }}
            />
          </div>
        </section>
      </section>

      <div className="flex gap-4">
        <Button type="button" variant="outline" className="w-fit" onClick={handleDiscard}>
          Discard
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={handleSaveProgress}
          disabled={isSavingProgress || isPending}
        >
          {isSavingProgress ? 'Saving...' : 'Save Progress'}
        </Button>
        <Button
          disabled={!form.formState.isValid || isPending}
          type="submit"
          variant="secondary"
          className="w-fit"
        >
          Submit
        </Button>
      </div>

      {/* Submission Modal with Loader */}
      <Modal
        isOpen={isPending}
        setIsOpen={() => {}}
        title="Saving Business Details"
        showClose={false}
        position="center"
      >
        <div className="flex flex-col items-center justify-center py-12 px-6 min-h-[200px]">
          <div className="flex justify-center items-center mb-6">
            <img src={LoaderGif} alt="Loading..." className="w-20 h-auto" />
          </div>
          <Text variant="p" className="text-center text-gray-600">
            Please wait while we save your business details and upload your documents...
          </Text>
        </div>
      </Modal>
    </form>
  )
}

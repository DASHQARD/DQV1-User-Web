import { Controller } from 'react-hook-form'
import { Combobox, Input, Text, FileUploader, Loader, Modal } from '@/components'
import { Button } from '@/components/Button'
import { cn } from '@/libs'
import { SuccessImage } from '@/assets/images'
import { useOnboardingForm } from '../hooks/useOnboardingForm'

export default function OnboardingForm() {
  const {
    form,
    frontOfIdentification,
    backOfIdentification,
    showSuccessModal,
    setShowSuccessModal,
    isPassport,
    isNationalId,
    needsOnlyFront,
    isPending,
    isLoading,
    isFetchingPresignedURL,
    userProfileData,
    onSubmit,
    handleSuccessContinue,
    handleDiscard,
    dobMaxDate,
    submitButtonLabel,
  } = useOnboardingForm()

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <Text variant="h3" weight="semibold">
            Key Person Details
          </Text>
          <Text variant="span" className="text-[#A0AEC0]">
            Update your personal details and contact information
          </Text>
        </div>

        <hr className="border-[#F1F2F4]" />

        <section className="grid grid-cols-2 gap-4 flex-1">
          <Input
            label="First Name"
            isRequired
            placeholder="Enter your first name"
            className="col-span-full sm:col-span-1"
            {...form.register('first_name')}
            error={form.formState.errors.first_name?.message}
          />
          <Input
            label="Last Name"
            isRequired
            placeholder="Enter your last name"
            className="col-span-full sm:col-span-1"
            {...form.register('last_name')}
            error={form.formState.errors.last_name?.message}
          />
          <Input
            type="date"
            label="Date of Birth"
            isRequired
            placeholder="Enter your date of birth"
            className="col-span-full"
            max={dobMaxDate}
            {...form.register('dob')}
            error={form.formState.errors.dob?.message}
          />

          <Input
            label="Street Address"
            isRequired
            placeholder="Enter your street address"
            className="col-span-full"
            {...form.register('street_address')}
            error={form.formState.errors.street_address?.message}
          />

          <Controller
            name="id_type"
            control={form.control}
            render={({ field }) => (
              <Combobox
                label="ID Type"
                isRequired
                className="col-span-full sm:col-span-1"
                placeholder="Enter your ID type"
                {...field}
                error={form.formState.errors.id_type?.message}
                options={[
                  { label: 'National ID', value: 'national_id' },
                  { label: 'Passport', value: 'passport' },
                ]}
              />
            )}
          />

          <Input
            label="ID Number"
            isRequired
            placeholder="Enter your ID number"
            className="col-span-full sm:col-span-1"
            {...form.register('id_number')}
            error={form.formState.errors.id_number?.message}
          />
        </section>
        <section className="flex flex-col gap-10 pb-16">
          <div className="flex flex-col gap-1 w-full">
            <Text variant="h3" weight="semibold">
              Identity Documents
            </Text>
            <Text variant="span" className="text-[#A0AEC0]">
              {isPassport
                ? 'Upload a picture of your passport page'
                : isNationalId
                  ? 'Upload a picture of the front of your National ID'
                  : 'Upload pictures of your identification (front and back)'}
            </Text>
          </div>

          <hr className="border-[#F1F2F4]" />

          {isLoading || isFetchingPresignedURL ? (
            <div className="flex justify-center items-center h-full bg-white">
              <Loader />
            </div>
          ) : userProfileData?.id_images?.length && userProfileData?.id_images?.length > 0 ? (
            <section
              className={cn(
                'grid gap-4 flex-1 max-w-[554px]',
                needsOnlyFront ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2',
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {isPassport
                    ? 'Passport Page'
                    : isNationalId
                      ? 'Front of National ID'
                      : 'Front of Identification'}
                </p>
                <div
                  className={cn(
                    'border-2 border-dashed rounded-lg p-4 transition-colors min-h-48 flex items-center justify-center min-w-0',
                  )}
                >
                  {frontOfIdentification ? (
                    <img
                      src={frontOfIdentification}
                      alt={isPassport ? 'Passport Page' : 'Front of Identification'}
                      className="max-h-48 w-full object-contain"
                    />
                  ) : null}
                </div>
              </div>
              {!needsOnlyFront && backOfIdentification && (
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 mb-2">Back of Identification</p>
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-lg p-4 transition-colors min-h-48 flex items-center justify-center min-w-0',
                    )}
                  >
                    {backOfIdentification ? (
                      <img
                        src={backOfIdentification}
                        alt="Back of Identification"
                        className="max-h-48 w-full object-contain"
                      />
                    ) : null}
                  </div>
                </div>
              )}
            </section>
          ) : (
            <section
              className={cn(
                'grid gap-4 flex-1',
                needsOnlyFront ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2',
              )}
            >
              <Controller
                control={form.control}
                name="front_id"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <FileUploader
                    label={
                      isPassport
                        ? 'Upload Passport Page'
                        : isNationalId
                          ? 'Upload Picture of Front of National ID'
                          : 'Upload Picture of Front of Identification'
                    }
                    value={value}
                    onChange={onChange}
                    error={error?.message}
                    id="front_id"
                  />
                )}
              />

              {!needsOnlyFront && (
                <Controller
                  control={form.control}
                  name="back_id"
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <FileUploader
                      label="Upload Picture of Back of Identification"
                      value={value}
                      onChange={onChange}
                      error={error?.message}
                      id="back_id"
                    />
                  )}
                />
              )}
            </section>
          )}
        </section>
      </section>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" className="w-fit" onClick={handleDiscard}>
          Discard
        </Button>
        <Button
          disabled={!form.formState.isValid || isPending}
          loading={isPending}
          type="submit"
          variant="secondary"
          className="w-fit"
        >
          {submitButtonLabel}
        </Button>
      </div>

      {/* Loading Modal */}
      <Modal
        isOpen={form.formState.isSubmitting}
        setIsOpen={() => {}}
        panelClass="max-w-sm p-8"
        showClose={false}
      >
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <Loader />
          <Text as="p" className="text-base font-medium text-gray-700">
            Submitting...
          </Text>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} setIsOpen={setShowSuccessModal} panelClass="max-w-md p-8">
        <div className="flex flex-col items-center text-center">
          <img src={SuccessImage} alt="Success" className="w-24 h-24 object-contain mb-4" />
          <Text as="h2" className="text-xl font-bold text-gray-900 mb-2">
            Profile updated successfully!
          </Text>
          <Text className="text-sm text-gray-600 mb-6">
            Your identification details have been saved.
          </Text>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleSuccessContinue}
          >
            Continue
          </Button>
        </div>
      </Modal>
    </form>
  )
}

import type { Control, FieldErrors, FieldPath, FieldValues, UseFormRegister } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { BasePhoneInput, Input } from '@/components'
import { EXAMPLE_PHONE_PLACEHOLDER } from '@/utils/constants'
import type { RecipientFieldNames } from './recipientFieldNames'
import { STANDARD_RECIPIENT_FIELDS } from './recipientFieldNames'

type GiftCardRecipientFieldsProps<T extends FieldValues> = {
  control: Control<T>
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  assignToSelf: boolean
  usesAccountAssignToSelf?: boolean
  isLocalGuest?: boolean
  fieldNames?: RecipientFieldNames
  /** Use design-system Input components (PurchaseModal) vs native inputs (purchase pages). */
  variant?: 'design-system' | 'native'
  phonePlaceholder?: string
  messageRequired?: boolean
  messageRows?: number
  className?: string
}

export function GiftCardRecipientFields<T extends FieldValues>({
  control,
  register,
  errors,
  assignToSelf,
  usesAccountAssignToSelf = assignToSelf,
  isLocalGuest = false,
  fieldNames = STANDARD_RECIPIENT_FIELDS,
  variant = 'native',
  phonePlaceholder = EXAMPLE_PHONE_PLACEHOLDER,
  messageRequired = false,
  messageRows = 3,
  className,
}: GiftCardRecipientFieldsProps<T>) {
  const firstNamePath = fieldNames.firstName as FieldPath<T>
  const lastNamePath = fieldNames.lastName as FieldPath<T>
  const phonePath = fieldNames.phone as FieldPath<T>
  const emailPath = fieldNames.email as FieldPath<T>
  const messagePath = fieldNames.message as FieldPath<T>

  const firstNameError = errors[fieldNames.firstName]?.message as string | undefined
  const lastNameError = errors[fieldNames.lastName]?.message as string | undefined
  const phoneError = errors[fieldNames.phone]?.message as string | undefined
  const emailError = errors[fieldNames.email]?.message as string | undefined
  const messageError = errors[fieldNames.message]?.message as string | undefined

  const showOptionalContact = !assignToSelf || isLocalGuest
  const disabled = usesAccountAssignToSelf || assignToSelf

  const firstNamePlaceholder = usesAccountAssignToSelf
    ? 'Will use your account information'
    : assignToSelf
      ? 'Your first name'
      : 'First name'

  const lastNamePlaceholder = usesAccountAssignToSelf
    ? 'Will use your account information'
    : assignToSelf
      ? 'Your last name'
      : 'Last name'

  const phoneFieldPlaceholder = usesAccountAssignToSelf
    ? 'Will use your account phone'
    : assignToSelf
      ? 'Will use your account phone'
      : phonePlaceholder

  const emailPlaceholder = usesAccountAssignToSelf
    ? 'Will use your account email'
    : assignToSelf
      ? 'Your email (optional)'
      : 'Enter email address'

  return (
    <section className={`border-b border-gray-100 px-10 py-8 ${className ?? ''}`}>
      <div className="mb-6 space-y-1">
        <h3 className="text-xl font-semibold text-[#212529]">Recipient Details</h3>
        <p className="text-sm text-gray-500">Who will receive this gift card?</p>
      </div>
      <div className="grid max-w-2xl gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              First Name {!assignToSelf && '*'}
            </label>
            {variant === 'design-system' ? (
              <Input
                type="text"
                {...register(firstNamePath)}
                error={firstNameError}
                disabled={disabled}
                placeholder={firstNamePlaceholder}
              />
            ) : (
              <>
                <input
                  type="text"
                  {...register(firstNamePath)}
                  disabled={disabled}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
                    disabled ? 'cursor-not-allowed bg-gray-100' : ''
                  }`}
                  placeholder={
                    assignToSelf && variant === 'native'
                      ? 'Will use your account information'
                      : firstNamePlaceholder
                  }
                />
                {firstNameError ? (
                  <p className="mt-1 text-xs text-red-500">{firstNameError}</p>
                ) : null}
              </>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Last Name {!assignToSelf && '*'}
            </label>
            {variant === 'design-system' ? (
              <Input
                type="text"
                {...register(lastNamePath)}
                error={lastNameError}
                disabled={disabled}
                placeholder={lastNamePlaceholder}
              />
            ) : (
              <>
                <input
                  type="text"
                  {...register(lastNamePath)}
                  disabled={disabled}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
                    disabled ? 'cursor-not-allowed bg-gray-100' : ''
                  }`}
                  placeholder={
                    assignToSelf && variant === 'native'
                      ? 'Will use your account information'
                      : lastNamePlaceholder
                  }
                />
                {lastNameError ? (
                  <p className="mt-1 text-xs text-red-500">{lastNameError}</p>
                ) : null}
              </>
            )}
          </div>
        </div>
        {assignToSelf && variant === 'native' ? (
          <p className="-mt-2 text-xs text-gray-500">Will use your account name</p>
        ) : null}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Phone Number
            {showOptionalContact ? (
              <span className="font-normal text-gray-400"> (optional)</span>
            ) : null}
          </label>
          <Controller
            control={control}
            name={phonePath}
            render={({ field }) => (
              <BasePhoneInput
                selectedVal={field.value || ''}
                handleChange={field.onChange}
                disabled={disabled}
                placeholder={phoneFieldPlaceholder}
                error={phoneError}
              />
            )}
          />
          {assignToSelf && variant === 'native' ? (
            <p className="mt-1 text-xs text-gray-500">Will use your account phone number</p>
          ) : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Email Address
            {showOptionalContact ? (
              <span className="font-normal text-gray-400"> (optional)</span>
            ) : null}
          </label>
          {variant === 'design-system' ? (
            <Input
              type="email"
              {...register(emailPath)}
              error={emailError}
              disabled={disabled}
              placeholder={emailPlaceholder}
            />
          ) : (
            <>
              <input
                type="email"
                {...register(emailPath)}
                disabled={disabled}
                className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
                  disabled ? 'cursor-not-allowed bg-gray-100' : ''
                }`}
                placeholder={emailPlaceholder}
              />
              {emailError ? <p className="mt-1 text-xs text-red-500">{emailError}</p> : null}
            </>
          )}
          {assignToSelf && variant === 'native' ? (
            <p className="mt-1 text-xs text-gray-500">Will use your account email</p>
          ) : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Personal Message{messageRequired ? ' *' : ' (optional)'}
          </label>
          {variant === 'design-system' ? (
            <Input
              type="textarea"
              innerClassName="!h-auto min-h-[200px]"
              inputClassName="resize-none"
              {...register(messagePath)}
              error={messageError}
              placeholder="Write a personal message for the recipient..."
              isRequired={messageRequired}
            />
          ) : (
            <>
              <textarea
                rows={messageRows}
                {...register(messagePath)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder="Write a personal message for the recipient..."
              />
              {messageError ? <p className="mt-1 text-xs text-red-500">{messageError}</p> : null}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

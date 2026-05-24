import { Controller } from 'react-hook-form'
import {
  Button,
  Input,
  Text,
  Combobox,
  RadioGroup,
  RadioGroupItem,
  BasePhoneInput,
  Modal,
} from '@/components'
import { usePersistedModalState } from '@/hooks'
import { EXAMPLE_PHONE_PLACEHOLDER, MODALS } from '@/utils/constants'
import { useRequestBranchPaymentDetailsUpdateModal } from '../hooks/useRequestBranchPaymentDetailsUpdateModal'
import { branchQueries } from '../hooks/useBranchQueries'
import type { BranchInfoResponse } from '../services'

export function RequestBranchPaymentDetailsUpdateModal() {
  const modal = usePersistedModalState({
    paramName: MODALS.REQUEST_BRANCH_PAYMENT_DETAILS_UPDATE.PARAM_NAME,
  })
  const isOpen = modal.isModalOpen(MODALS.REQUEST_BRANCH_PAYMENT_DETAILS_UPDATE.ROOT)
  const onClose = modal.closeModal

  const { useGetBranchInfoService } = branchQueries()
  const { data: branchInfoData } = useGetBranchInfoService()
  const branchInfo =
    (branchInfoData as { data?: BranchInfoResponse['data'] } | undefined)?.data ??
    (branchInfoData as BranchInfoResponse['data'] | undefined)

  const {
    form,
    paymentMethod,
    isRequesting,
    countries,
    bankOptions,
    mobileMoneyProviders,
    hasPaymentDetails,
    handleClose,
    handleSetIsOpen,
    handleRequestUpdate,
  } = useRequestBranchPaymentDetailsUpdateModal(isOpen, onClose, branchInfo)

  if (!hasPaymentDetails) return null

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={handleSetIsOpen}
      showClose
      title="Request payment details update"
      panelClass="!w-[800px] p-0 overflow-hidden flex flex-col max-h-[90vh]"
    >
      <header className="shrink-0 border-b border-gray-100 px-6 pt-6 pb-5 pr-14">
        <h2 className="text-lg font-semibold text-gray-900">Request payment details update</h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Propose new payment details below. Your vendor admin and platform admin will review the
          request before changes are applied.
        </p>
      </header>

      <form
        onSubmit={form.handleSubmit(handleRequestUpdate)}
        className="flex flex-col flex-1 min-h-0"
      >
        <BranchPaymentRequestFormFields
          form={form}
          paymentMethod={paymentMethod}
          countries={countries}
          bankOptions={bankOptions}
          mobileMoneyProviders={mobileMoneyProviders}
        />

        <footer className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-6 py-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" loading={isRequesting}>
            Submit request
          </Button>
        </footer>
      </form>
    </Modal>
  )
}

function BranchPaymentRequestFormFields({
  form,
  paymentMethod,
  countries,
  bankOptions,
  mobileMoneyProviders,
}: {
  form: ReturnType<typeof useRequestBranchPaymentDetailsUpdateModal>['form']
  paymentMethod: ReturnType<typeof useRequestBranchPaymentDetailsUpdateModal>['paymentMethod']
  countries: ReturnType<typeof useRequestBranchPaymentDetailsUpdateModal>['countries']
  bankOptions: ReturnType<typeof useRequestBranchPaymentDetailsUpdateModal>['bankOptions']
  mobileMoneyProviders: ReturnType<
    typeof useRequestBranchPaymentDetailsUpdateModal
  >['mobileMoneyProviders']
}) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
      <div>
        <Text variant="h6" weight="medium" className="mb-4">
          Payment method
        </Text>
        <Controller
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="mobile_money" id="branch-req-mobile-money" />
                  <label htmlFor="branch-req-mobile-money" className="cursor-pointer text-sm">
                    Mobile money
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="bank" id="branch-req-bank" />
                  <label htmlFor="branch-req-bank" className="cursor-pointer text-sm">
                    Bank account
                  </label>
                </div>
              </div>
            </RadioGroup>
          )}
        />
      </div>

      {paymentMethod === 'mobile_money' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            control={form.control}
            name="mobile_money_provider"
            render={({ field, fieldState: { error } }) => (
              <Combobox
                label="Mobile money provider"
                options={mobileMoneyProviders}
                value={field.value}
                onChange={(e: unknown) => {
                  const ev = e as { target?: { value?: string }; value?: string }
                  field.onChange(ev?.target?.value ?? ev?.value ?? '')
                }}
                error={error?.message}
                placeholder="Select provider"
              />
            )}
          />
          <Controller
            control={form.control}
            name="mobile_money_number"
            render={({ field: { value, onChange } }) => (
              <BasePhoneInput
                placeholder={EXAMPLE_PHONE_PLACEHOLDER}
                options={countries}
                selectedVal={value}
                handleChange={onChange}
                label="Mobile money number"
                error={form.formState.errors.mobile_money_number?.message}
              />
            )}
          />
        </div>
      )}

      {paymentMethod === 'bank' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            control={form.control}
            name="bank_name"
            render={({ field, fieldState: { error } }) => (
              <Combobox
                label="Bank name"
                options={bankOptions}
                value={field.value}
                onChange={(e: unknown) => {
                  const ev = e as { target?: { value?: string }; value?: string }
                  field.onChange(ev?.target?.value ?? ev?.value ?? '')
                }}
                error={error?.message}
                placeholder="Select bank"
                isSearchable
              />
            )}
          />
          <Controller
            control={form.control}
            name="bank_branch"
            render={({ field, fieldState: { error } }) => (
              <Input label="Bank branch" {...field} error={error?.message} />
            )}
          />
          <Controller
            control={form.control}
            name="account_holder_name"
            render={({ field, fieldState: { error } }) => (
              <Input label="Account holder name" {...field} error={error?.message} />
            )}
          />
          <Controller
            control={form.control}
            name="account_number"
            render={({ field, fieldState: { error } }) => (
              <Input label="Account number" {...field} error={error?.message} />
            )}
          />
          <Controller
            control={form.control}
            name="swift_code"
            render={({ field, fieldState: { error } }) => (
              <Input label="SWIFT code" {...field} error={error?.message} />
            )}
          />
          <Controller
            control={form.control}
            name="sort_code"
            render={({ field, fieldState: { error } }) => (
              <Input label="Sort code" {...field} error={error?.message} />
            )}
          />
        </div>
      )}
    </div>
  )
}

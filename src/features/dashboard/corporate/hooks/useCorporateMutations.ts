import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  acceptCorporateAdminInvitation,
  createVendor,
  deleteCorporateAdminInvitation,
  inviteAdmin,
  addRecipient,
  deleteRecipient,
  uploadBulkRecipients,
  assignRecipientToCart,
  assignCardToRecipients,
  createDashGoAndAssign,
  createDashProAndAssign,
  addToCart,
  addPaymentDetails,
  updateBusinessDetails,
  updateBusinessLogo,
  updatePaymentDetails,
  deletePaymentDetails,
  checkout,
} from '../services'
import { useToast } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { useNavigate } from 'react-router-dom'
import type {
  CreateRecipientPayload,
  AssignRecipientPayload,
  AddToCartPayload,
} from '@/types/responses'

export function corporateMutations() {
  function useInviteAdminForCorporateService() {
    const { success, error } = useToast()
    return useMutation({
      mutationFn: inviteAdmin,
      onSuccess: () => {
        success('Admin invited successfully')
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to invite admin. Please try again.')
      },
    })
  }

  function useCreateVendorService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: createVendor,
      onSuccess: (response: any) => {
        success(response?.message || 'Vendor created successfully')
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      },

      onError: (err: any) => {
        error(err?.message || 'Failed to create vendor. Please try again.')
      },
    })
  }

  function useAcceptCorporateAdminInvitationService() {
    const { success, error } = useToast()
    const navigate = useNavigate()
    return useMutation({
      mutationFn: acceptCorporateAdminInvitation,
      onSuccess: () => {
        success('Password set successfully. You can now login.')
        navigate(ROUTES.IN_APP.AUTH.LOGIN)
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to accept invitation. Please try again.')
      },
    })
  }

  function useDeleteCorporateAdminInvitationService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (id: string | number) => deleteCorporateAdminInvitation(id),
      onSuccess: () => {
        success('Invitation deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['invited-corporate-admins'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to delete invitation. Please try again.')
      },
    })
  }

  function useAddRecipientService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: CreateRecipientPayload) => addRecipient(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Recipient added successfully')
        queryClient.invalidateQueries({ queryKey: ['all-corporate-recipients'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to add recipient. Please try again.')
      },
    })
  }

  function useDeleteRecipientService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (id: string | number) => deleteRecipient(id),
      onSuccess: (response: any) => {
        success(response?.message || 'Recipient deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['all-corporate-recipients'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to delete recipient. Please try again.')
      },
    })
  }

  function useUploadBulkRecipientsService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (file: File) => uploadBulkRecipients(file),
      onSuccess: (response: any) => {
        success(response?.message || 'Recipients uploaded successfully')
        queryClient.invalidateQueries({ queryKey: ['all-corporate-recipients'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to upload recipients. Please try again.')
      },
    })
  }

  function useAssignRecipientService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: AssignRecipientPayload) => assignRecipientToCart(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Recipient assigned successfully')
        queryClient.invalidateQueries({ queryKey: ['corporate-carts'] })
        queryClient.invalidateQueries({ queryKey: ['all-corporate-recipients'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to assign recipient. Please try again.')
      },
    })
  }

  function useAssignCardToRecipientsService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: { card_id: number; recipient_ids: number[] }) =>
        assignCardToRecipients(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Card assigned to recipients successfully')
        queryClient.invalidateQueries({ queryKey: ['corporate-carts'] })
        queryClient.invalidateQueries({ queryKey: ['all-corporate-recipients'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to assign card to recipients. Please try again.')
      },
    })
  }

  function useCreateDashGoAndAssignService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: createDashGoAndAssign,
      onSuccess: (response: any) => {
        success(response?.message || 'DashGo card created and assigned successfully')
        queryClient.invalidateQueries({ queryKey: ['corporate-carts'] })
        queryClient.invalidateQueries({ queryKey: ['all-corporate-recipients'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to create and assign DashGo card. Please try again.')
      },
    })
  }

  function useCreateDashProAndAssignService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: createDashProAndAssign,
      onSuccess: (response: any) => {
        success(response?.message || 'DashPro card created and assigned successfully')
        queryClient.invalidateQueries({ queryKey: ['corporate-carts'] })
        queryClient.invalidateQueries({ queryKey: ['all-corporate-recipients'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to create and assign DashPro card. Please try again.')
      },
    })
  }

  function useAddToCartService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: AddToCartPayload) => addToCart(data),
      onSuccess: (response: any) => {
        console.log('addToCartResponse', response)
        success(response?.message || 'Item added to cart successfully')
        queryClient.invalidateQueries({ queryKey: ['corporate-carts'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to add item to cart. Please try again.')
      },
    })
  }

  function useAddPaymentDetailsService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: {
        payment_method: 'mobile_money' | 'bank'
        mobile_money_provider?: string
        mobile_money_number?: string
        bank_name?: string
        branch?: string
        account_name?: string
        account_number?: string
        swift_code?: string
        sort_code?: string
      }) => addPaymentDetails(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Payment details added successfully')
        queryClient.invalidateQueries({ queryKey: ['corporate-payment-details'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to add payment details. Please try again.')
      },
    })
  }

  function useCheckoutService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: {
        cart_id: number
        full_name: string
        email: string
        phone_number: string
        amount_due: number
        user_id: number
      }) => checkout(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Checkout successful')
        queryClient.invalidateQueries({ queryKey: ['corporate-carts'] })
        // Optionally open payment URL if provided
        if (response?.data?.payment_url) {
          window.open(response.data.payment_url, '_blank', 'noopener,noreferrer')
        }
      },
      onError: (err: any) => {
        error(err?.message || 'Checkout failed. Please try again.')
      },
    })
  }

  function useUpdateBusinessDetailsService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: {
        id: number
        name: string
        type: string
        phone: string
        email: string
        street_address: string
        digital_address: string
        registration_number: string
      }) => updateBusinessDetails(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Business details updated successfully')
        queryClient.invalidateQueries()
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to update business details. Please try again.')
      },
    })
  }

  function useUpdateBusinessLogoService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: { file_url: string }) => updateBusinessLogo(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Business logo updated successfully')
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to update business logo. Please try again.')
      },
    })
  }

  function useUpdatePaymentDetailsService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: {
        payment_method: 'mobile_money' | 'bank'
        mobile_money_provider?: string
        mobile_money_number?: string
        bank_name?: string
        branch?: string
        account_name?: string
        account_number?: string
        swift_code?: string
        sort_code?: string
      }) => updatePaymentDetails(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Payment details updated successfully')
        queryClient.invalidateQueries({ queryKey: ['corporate-payment-details'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to update payment details. Please try again.')
      },
    })
  }

  function useDeletePaymentDetailsService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: () => deletePaymentDetails(),
      onSuccess: (response: any) => {
        success(response?.message || 'Payment details deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['corporate-payment-details'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to delete payment details. Please try again.')
      },
    })
  }

  return {
    useInviteAdminForCorporateService,
    useAcceptCorporateAdminInvitationService,
    useDeleteCorporateAdminInvitationService,
    useCreateVendorService,
    useAddRecipientService,
    useDeleteRecipientService,
    useUploadBulkRecipientsService,
    useAssignRecipientService,
    useAssignCardToRecipientsService,
    useCreateDashGoAndAssignService,
    useCreateDashProAndAssignService,
    useAddToCartService,
    useAddPaymentDetailsService,
    useUpdateBusinessDetailsService,
    useUpdateBusinessLogoService,
    useUpdatePaymentDetailsService,
    useDeletePaymentDetailsService,
    useCheckoutService,
  }
}

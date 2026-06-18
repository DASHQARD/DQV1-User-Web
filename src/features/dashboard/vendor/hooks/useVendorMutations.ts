import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  acceptVendorInvitation,
  addBranch,
  cancelVendorInvitation,
  createVendor,
  deleteBranch,
  deleteBranchByVendor,
  removeVendorAdmin,
  VendorInvite,
  createExperience,
  updateBusinessDetails,
  updateBusinessLogo,
  addPaymentDetails,
  updateBranchPaymentDetails,
  addBranchPaymentDetails,
  deleteBranchPaymentDetails,
  updateCard,
  deleteCard,
  updateRequestStatus,
  deleteRequestVendor,
  updatePaymentPreferences,
  cancelBranchManagerInvitation,
  deleteBranchManagerInvitation,
  removeBranchManager,
  updateBranchManagerDetails,
  updateBranchStatus,
  updateVendorBranchDetails,
  createVendorPayment,
  updateVendorPayment,
} from '../services'
import type {
  UpdateBranchPaymentDetailsPayload,
  AddBranchPaymentDetailsPayload,
  RemoveBranchManagerPayload,
  UpdateBranchStatusPayload,
  UpdateBranchDetailsPayload,
} from '@/types'
import { useToast } from '@/hooks'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import { getRequestApiErrorMessage } from '@/utils/requestApiError'
import { useRequestInitiatorNavigation } from '@/features/dashboard/hooks/useRequestInitiatorNavigation'

export function useVendorMutations() {
  const { success, error } = useToast()

  function useCreateExperienceService() {
    const queryClient = useQueryClient()
    const { goToSubmittedRequest } = useRequestInitiatorNavigation()
    return useMutation({
      mutationFn: createExperience,
      onSuccess: (response: any) => {
        success(response?.message || 'Experience created successfully')
        queryClient.invalidateQueries({ queryKey: ['cards-by-vendor-id'] })
        goToSubmittedRequest(response)
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to create experience. Please try again.')
      },
    })
  }

  function useUpdateCardService() {
    const queryClient = useQueryClient()
    const { goToSubmittedRequest } = useRequestInitiatorNavigation()
    return useMutation({
      mutationFn: updateCard,
      onSuccess: (response: any) => {
        success(response?.message || 'Experience updated successfully')
        queryClient.invalidateQueries({ queryKey: ['cards-by-vendor-id'] })
        queryClient.invalidateQueries({ queryKey: ['card-by-id'] })
        goToSubmittedRequest(response)
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to update experience. Please try again.')
      },
    })
  }

  function useDeleteCardService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (id: string | number) => deleteCard(id),
      onSuccess: (response: any) => {
        success(response?.message || 'Experience deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['cards-by-vendor-id'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to delete experience. Please try again.')
      },
    })
  }
  function useCreateVendorService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: createVendor,
      onSuccess: () => {
        success('Vendor created successfully')
        queryClient.invalidateQueries()
      },
    })
  }

  function useVendorInviteService() {
    return useMutation({
      mutationFn: VendorInvite,
      onSuccess: () => {
        success('Vendor invited successfully')
      },
    })
  }

  function useCancelVendorInvitationService() {
    return useMutation({
      mutationFn: cancelVendorInvitation,
      onSuccess: () => {
        success('Vendor invitation cancelled successfully')
      },
    })
  }

  function useRemoveVendorInfoService() {
    return useMutation({
      mutationFn: removeVendorAdmin,
      onSuccess: () => {
        success('Vendor admin removed successfully')
      },
    })
  }

  function useAcceptVendorInvitationService() {
    const navigate = useNavigate()
    return useMutation({
      mutationFn: acceptVendorInvitation,
      onSuccess: (response: any) => {
        success(response?.message || 'Vendor invitation accepted successfully')
        navigate(ROUTES.IN_APP.AUTH.LOGIN)
      },
    })
  }

  function useAddBranchService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: addBranch,
      onSuccess: (response: any) => {
        queryClient.invalidateQueries({ queryKey: ['branches'] })
        success(response?.message || 'Branch created successfully')
      },
      onError: (err: { status: number; message: string }) => {
        error(err?.message || 'Failed to delete branch. Please try again.')
      },
    })
  }

  function useDeleteBranchService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => deleteBranch(id),
      onSuccess: (response: any) => {
        queryClient.invalidateQueries({ queryKey: ['branches'] })
        success(response.data?.message || 'Branch deleted successfully')
      },
      onError: (err: { status: number; message: string }) => {
        error(err?.message || 'Failed to delete branch. Please try again.')
      },
    })
  }

  function useUpdateBusinessDetailsService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: updateBusinessDetails,
      onSuccess: (response: any) => {
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
        success(response?.message || 'Business details updated successfully')
      },
      onError: (err: { status: number; message: string }) => {
        error(err?.message || 'Failed to update business details. Please try again.')
      },
    })
  }

  function useUpdateBusinessLogoService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: updateBusinessLogo,
      onSuccess: (response: any) => {
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
        success(response?.message || 'Business logo updated successfully')
      },
      onError: (err: { status: number; message: string }) => {
        error(err?.message || 'Failed to update business logo. Please try again.')
      },
    })
  }

  function useAddPaymentDetailsService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: addPaymentDetails,
      onSuccess: (response: any, variables) => {
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
        // If branch_id is provided, invalidate branch payment details
        if (variables.branch_id) {
          queryClient.invalidateQueries({ queryKey: ['branches'] })
          queryClient.invalidateQueries({ queryKey: ['branches-by-vendor-id'] })
          queryClient.invalidateQueries({
            queryKey: ['branch-payment-details', variables.branch_id],
          })
        }
        success(response?.message || 'Payment details added successfully')
      },
      onError: (err: { status: number; message: string }) => {
        error(err?.message || 'Failed to add payment details. Please try again.')
      },
    })
  }

  function useUpdatePaymentPreferencesService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: updatePaymentPreferences,
      onSuccess: (response: any) => {
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
        success(response?.message || 'Payment preferences updated successfully')
      },
      onError: (err: { status: number; message: string }) => {
        error(err?.message || 'Failed to update payment preferences. Please try again.')
      },
    })
  }

  function useAddBranchPaymentDetailsService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: AddBranchPaymentDetailsPayload) => addBranchPaymentDetails(data),
      onSuccess: (response: any, variables) => {
        queryClient.invalidateQueries({ queryKey: ['branches'] })
        queryClient.invalidateQueries({ queryKey: ['branches-by-vendor-id'] })
        queryClient.invalidateQueries({ queryKey: ['branch-payment-details', variables.branch_id] })
        success(response?.message || 'Branch payment details added successfully')
      },
      onError: (err: { status: number; message: string }) => {
        error(err?.message || 'Failed to add branch payment details. Please try again.')
      },
    })
  }

  function useUpdateBranchPaymentDetailsService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: UpdateBranchPaymentDetailsPayload) => updateBranchPaymentDetails(data),
      onSuccess: (response: any, variables) => {
        queryClient.invalidateQueries({ queryKey: ['branches'] })
        queryClient.invalidateQueries({ queryKey: ['branches-by-vendor-id'] })
        queryClient.invalidateQueries({ queryKey: ['branch-payment-details', variables.branch_id] })
        success(response?.message || 'Branch payment details updated successfully')
      },
      onError: (err: { status: number; message: string }) => {
        error(err?.message || 'Failed to update branch payment details. Please try again.')
      },
    })
  }

  function useDeleteBranchPaymentDetailsService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (branchId: number | string) => deleteBranchPaymentDetails(branchId),
      onSuccess: (response: any, branchId) => {
        queryClient.invalidateQueries({ queryKey: ['branches'] })
        queryClient.invalidateQueries({ queryKey: ['branches-by-vendor-id'] })
        queryClient.invalidateQueries({ queryKey: ['branch-payment-details', branchId] })
        success(response?.message || 'Branch payment details deleted successfully')
      },
      onError: (err: { status: number; message: string }) => {
        error(err?.message || 'Failed to delete branch payment details. Please try again.')
      },
    })
  }

  function useUpdateRequestStatusService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: {
        id: string | number
        status: string
        rejection_reason?: string
        comments?: string
      }) => updateRequestStatus(data),
      onSuccess: (response: any, variables) => {
        success(response?.message || 'Request status updated successfully')
        queryClient.invalidateQueries({ queryKey: ['requests-vendor'] })
        queryClient.invalidateQueries({ queryKey: ['requests-corporate-super-admin-vendor'] })
        queryClient.invalidateQueries({ queryKey: ['corporate-request', variables.id] })
      },
      onError: (err: unknown) => {
        error(getRequestApiErrorMessage(err))
      },
    })
  }

  function useDeleteRequestVendorService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (id: number | string) => deleteRequestVendor(id),
      onSuccess: (response: any) => {
        success(response?.message || 'Request deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['requests-vendor'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to delete request. Please try again.')
      },
    })
  }

  function useCancelBranchManagerInvitationService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (invitationId: string | number) => cancelBranchManagerInvitation(invitationId),
      onSuccess: (response: any) => {
        success(response?.message || 'Branch manager invitation cancelled successfully')
        queryClient.invalidateQueries({ queryKey: ['branch-manager-invitations'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to cancel branch manager invitation. Please try again.')
      },
    })
  }

  function useDeleteBranchManagerInvitationService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (invitationId: string | number) => deleteBranchManagerInvitation(invitationId),
      onSuccess: (response: any) => {
        success(response?.message || 'Branch manager invitation deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['branch-manager-invitations'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to delete branch manager invitation. Please try again.')
      },
    })
  }

  function useRemoveBranchManagerService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: RemoveBranchManagerPayload) => removeBranchManager(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Branch manager removed successfully')
        queryClient.invalidateQueries({ queryKey: ['branch-manager-invitations'] })
        queryClient.invalidateQueries({ queryKey: ['branches'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to remove branch manager. Please try again.')
      },
    })
  }

  function useUpdateBranchManagerDetailsService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: {
        branch_manager_user_id: string
        email: string
        phone_number: string
        password: string
      }) => updateBranchManagerDetails(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Branch manager details updated successfully')
        queryClient.invalidateQueries({ queryKey: ['branches'] })
        queryClient.invalidateQueries({ queryKey: ['branches-by-vendor-id'] })
        queryClient.invalidateQueries({ queryKey: ['corporate-branch'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to update branch manager details. Please try again.')
      },
    })
  }

  function useUpdateBranchStatusService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: UpdateBranchStatusPayload) => updateBranchStatus(data),
      onSuccess: (response: any, variables: UpdateBranchStatusPayload) => {
        success(response?.message || 'Branch status updated successfully')
        queryClient.invalidateQueries({ queryKey: ['branches'] })
        queryClient.invalidateQueries({ queryKey: ['branch-manager-invitations'] })
        queryClient.invalidateQueries({ queryKey: ['branches-by-vendor-id'] })
        queryClient.invalidateQueries({ queryKey: ['corporate-branch', variables.branch_id] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to update branch status. Please try again.')
      },
    })
  }

  function useUpdateVendorBranchDetailsService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({
        branchId,
        data,
      }: {
        branchId: string | number
        data: UpdateBranchDetailsPayload
      }) => updateVendorBranchDetails(branchId, data),
      onSuccess: (response: any, variables) => {
        success(response?.message || 'Branch details updated successfully')
        queryClient.invalidateQueries({ queryKey: ['branches'] })
        queryClient.invalidateQueries({ queryKey: ['branches-by-vendor-id'] })
        queryClient.invalidateQueries({ queryKey: ['corporate-branch', variables.branchId] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to update branch details. Please try again.')
      },
    })
  }

  function useDeleteBranchByVendorService() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    return useMutation({
      mutationFn: (data: { branch_id: string | number }) => deleteBranchByVendor(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Branch deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['branches'] })
        queryClient.invalidateQueries({ queryKey: ['branches-by-vendor-id'] })
        navigate(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES)
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to delete branch. Please try again.')
      },
    })
  }

  function useCreateVendorPaymentService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: {
        vendor_id: string | number
        vendor_user_id: string | number
        payment_frequency: string
        branch_location: string
        branch_id: string | number
        payment_amount: number
        payment_period: string
        due_date: string
        description: string
      }) => createVendorPayment(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Vendor payment created successfully')
        queryClient.invalidateQueries({ queryKey: ['vendor-payments'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to create vendor payment. Please try again.')
      },
    })
  }

  function useUpdateVendorPaymentService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: {
        id: string | number
        payload: {
          status?: 'pending' | 'paid' | 'overdue'
          paid_date?: string
          payment_amount?: number
          description?: string
          due_date?: string
          payment_period?: string
        }
      }) => updateVendorPayment(data.id, data.payload),
      onSuccess: (response: any, variables) => {
        success(response?.message || 'Vendor payment updated successfully')
        queryClient.invalidateQueries({ queryKey: ['vendor-payments'] })
        queryClient.invalidateQueries({ queryKey: ['vendor-payment', variables.id] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to update vendor payment. Please try again.')
      },
    })
  }

  return {
    useCreateVendorService,
    useVendorInviteService,
    useCancelVendorInvitationService,
    useRemoveVendorInfoService,
    useAddBranchService,
    useDeleteBranchService,
    useAcceptVendorInvitationService,
    useCreateExperienceService,
    useUpdateCardService,
    useDeleteCardService,
    useUpdateBusinessDetailsService,
    useUpdateBusinessLogoService,
    useAddPaymentDetailsService,
    useAddBranchPaymentDetailsService,
    useUpdateBranchPaymentDetailsService,
    useDeleteBranchPaymentDetailsService,
    useUpdateRequestStatusService,
    useDeleteRequestVendorService,
    useUpdatePaymentPreferencesService,
    useCancelBranchManagerInvitationService,
    useDeleteBranchManagerInvitationService,
    useRemoveBranchManagerService,
    useUpdateBranchManagerDetailsService,
    useUpdateBranchStatusService,
    useUpdateVendorBranchDetailsService,
    useDeleteBranchByVendorService,
    useCreateVendorPaymentService,
    useUpdateVendorPaymentService,
  }
}

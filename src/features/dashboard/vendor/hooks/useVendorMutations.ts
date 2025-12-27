import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  acceptVendorInvitation,
  addBranch,
  cancelVendorInvitation,
  createVendor,
  deleteBranch,
  removeVendorAdmin,
  VendorInvite,
  createExperience,
  updateBusinessDetails,
  updateBusinessLogo,
  addPaymentDetails,
  updateCard,
  deleteCard,
} from '../services'
import { useToast } from '@/hooks'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'

export function useVendorMutations() {
  const { success, error } = useToast()

  function useCreateExperienceService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: createExperience,
      onSuccess: (response: any) => {
        success(response?.message || 'Experience created successfully')
        queryClient.invalidateQueries({ queryKey: ['cards-by-vendor-id'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to create experience. Please try again.')
      },
    })
  }

  function useUpdateCardService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: updateCard,
      onSuccess: (response: any) => {
        success(response?.message || 'Experience updated successfully')
        queryClient.invalidateQueries({ queryKey: ['cards-by-vendor-id'] })
        queryClient.invalidateQueries({ queryKey: ['card-by-id'] })
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
      onSuccess: (response: any) => {
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
        success(response?.message || 'Payment details added successfully')
      },
      onError: (err: { status: number; message: string }) => {
        error(err?.message || 'Failed to add payment details. Please try again.')
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
  }
}

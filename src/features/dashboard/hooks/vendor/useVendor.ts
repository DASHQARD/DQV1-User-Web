import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getVendorManagerDetails,
  getAllVendors,
  getVendorsDetails,
  createVendor,
  VendorInvite,
  acceptVendorInvitation,
  getVendorInvitations,
  cancelVendorInvitation,
  getAllVendorsManagement,
  getVendorInfoById,
  removeVendorAdmin,
  getAllVendorAdmins,
} from '../../services/vendor'
import { useToast } from '@/hooks'

export function useVendor(id: string) {
  const toast = useToast()

  function useVendorManagerDetailsService() {
    return useQuery({
      queryKey: ['vendor-manager-details'],
      queryFn: () => getVendorManagerDetails(id),
    })
  }

  function useGetVendorsDetailsService() {
    return useQuery({
      queryKey: ['vendors-details'],
      queryFn: getVendorsDetails,
      enabled: false,
    })
  }

  function useGetAllVendorsDetailsService() {
    return useQuery({
      queryKey: ['all-vendors-details'],
      queryFn: getAllVendors,
      enabled: false,
    })
  }

  // Vendor Management Services

  function useCreateVendorService() {
    return useMutation({
      mutationFn: createVendor,
      onSuccess: () => {
        toast.success('Vendor created successfully')
      },
    })
  }

  function useVendorInviteService() {
    return useMutation({
      mutationFn: VendorInvite,
      onSuccess: () => {
        toast.success('Vendor invited successfully')
      },
    })
  }

  function useAcceptVendorInvitationService() {
    return useMutation({
      mutationFn: acceptVendorInvitation,
      onSuccess: () => {
        toast.success('Vendor invitation accepted successfully')
      },
    })
  }

  function useGetAllVendorInvitationsService() {
    return useQuery({
      queryKey: ['vendor-invitations'],
      queryFn: getVendorInvitations,
    })
  }

  function useCancelVendorInvitationService() {
    return useMutation({
      mutationFn: cancelVendorInvitation,
      onSuccess: () => {
        toast.success('Vendor invitation cancelled successfully')
      },
    })
  }

  function useGetAllVendorsManagementService() {
    return useQuery({
      queryKey: ['all-vendors-management'],
      queryFn: getAllVendorsManagement,
    })
  }

  function useGetVendorInfoByIdService() {
    return useQuery({
      queryKey: ['vendor-info-by-id'],
      queryFn: () => getVendorInfoById(id),
    })
  }

  function useRemoveVendorInfoService() {
    return useMutation({
      mutationFn: removeVendorAdmin,
      onSuccess: () => {
        toast.success('Vendor admin removed successfully')
      },
    })
  }

  function useGetAllVendorAdminsService() {
    return useQuery({
      queryKey: ['vendor-admins'],
      queryFn: getAllVendorAdmins,
    })
  }

  return {
    useVendorManagerDetailsService,
    useGetVendorsDetailsService,
    useGetAllVendorsDetailsService,
    useCreateVendorService,
    useVendorInviteService,
    useAcceptVendorInvitationService,
    useGetAllVendorInvitationsService,
    useCancelVendorInvitationService,
    useGetAllVendorsManagementService,
    useGetVendorInfoByIdService,
    useRemoveVendorInfoService,
    useGetAllVendorAdminsService,
  }
}

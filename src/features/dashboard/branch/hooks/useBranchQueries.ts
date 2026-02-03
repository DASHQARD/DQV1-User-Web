import { useQuery } from '@tanstack/react-query'
import {
  getBranchExperiences,
  getBranchRedemptions,
  getSingleBranchExperience,
  getBranchInfo,
} from '../services'
import { useAuthStore } from '@/stores'

export function branchQueries() {
  function useIsBranchUser() {
    const user = useAuthStore((s) => s.user)
    const userType = (user as { user_type?: string } | null)?.user_type
    return userType === 'branch'
  }

  function useGetBranchExperiencesService(params?: Record<string, any>) {
    const isBranch = useIsBranchUser()
    return useQuery({
      queryKey: ['branch-experiences', params],
      queryFn: () => getBranchExperiences(params),
      enabled: isBranch,
    })
  }

  function useGetSingleBranchExperienceService(id: string) {
    const isBranch = useIsBranchUser()
    return useQuery({
      queryKey: ['single-branch-experience', id],
      queryFn: () => getSingleBranchExperience(id),
      enabled: isBranch,
    })
  }

  function useGetBranchRedemptionsService() {
    const isBranch = useIsBranchUser()
    return useQuery({
      queryKey: ['branch-redemptions'],
      queryFn: () => getBranchRedemptions(),
      enabled: isBranch,
    })
  }

  function useGetBranchInfoService() {
    const isBranch = useIsBranchUser()
    return useQuery({
      queryKey: ['branch-info'],
      queryFn: () => getBranchInfo(),
      enabled: isBranch,
    })
  }

  return {
    useGetBranchExperiencesService,
    useGetSingleBranchExperienceService,
    useGetBranchRedemptionsService,
    useGetBranchInfoService,
  }
}

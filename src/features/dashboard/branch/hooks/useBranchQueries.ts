import { useQuery } from '@tanstack/react-query'
import {
  getBranchExperiences,
  getBranchRedemptions,
  getSingleBranchExperience,
  getBranchInfo,
} from '../services'
import { useUserProfile } from '@/hooks'

export function branchQueries() {
  function useGetBranchExperiencesService(params?: Record<string, any>) {
    const { useGetUserProfileService } = useUserProfile()
    const { data: userProfileData } = useGetUserProfileService()
    const isBranch = userProfileData?.user_type === 'branch'
    return useQuery({
      queryKey: ['branch-experiences', params],
      queryFn: () => getBranchExperiences(params),
      enabled: isBranch,
    })
  }

  function useGetSingleBranchExperienceService(id: string) {
    const { useGetUserProfileService } = useUserProfile()
    const { data: userProfileData } = useGetUserProfileService()
    const isBranch = userProfileData?.user_type === 'branch'
    return useQuery({
      queryKey: ['single-branch-experience', id],
      queryFn: () => getSingleBranchExperience(id),
      enabled: isBranch,
    })
  }

  function useGetBranchRedemptionsService() {
    const { useGetUserProfileService } = useUserProfile()
    const { data: userProfileData } = useGetUserProfileService()
    const isBranch = userProfileData?.user_type === 'branch'
    return useQuery({
      queryKey: ['branch-redemptions'],
      queryFn: () => getBranchRedemptions(),
      enabled: isBranch,
    })
  }

  function useGetBranchInfoService() {
    const { useGetUserProfileService } = useUserProfile()
    const { data: userProfileData } = useGetUserProfileService()
    const isBranch = userProfileData?.user_type === 'branch'
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

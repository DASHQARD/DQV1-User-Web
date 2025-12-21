import { useQuery } from '@tanstack/react-query'
import { getCorporate, getCorporateById, getAuditLogs } from '../services'

export function corporate() {
  function useGetCorporateService() {
    return useQuery({
      queryKey: ['corporate'],
      queryFn: getCorporate,
    })
  }

  function useGetAuditLogsService() {
    return useQuery({
      queryKey: ['audit-logs'],
      queryFn: getAuditLogs,
      enabled: false,
    })
  }

  function useGetCorporateByIdService(id: string) {
    return useQuery({
      queryKey: ['corporate', id],
      queryFn: () => getCorporateById(id),
      enabled: !!id,
    })
  }

  return {
    useGetCorporateService,
    useGetCorporateByIdService,
    useGetAuditLogsService,
  }
}

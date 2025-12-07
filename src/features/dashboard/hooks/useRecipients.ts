import { useQuery } from '@tanstack/react-query'
import { userRecipient } from '../../website/services'

export function useRecipients() {
  function useUserRecipientService() {
    return useQuery({
      queryKey: ['user-recipients'],
      queryFn: userRecipient,
    })
  }

  return {
    useUserRecipientService,
  }
}

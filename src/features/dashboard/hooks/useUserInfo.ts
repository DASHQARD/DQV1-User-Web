import { useMemo } from 'react'
import { useAuthStore } from '@/stores'

export function useUserInfo() {
  const { user } = useAuthStore()

  const userInfo = useMemo(() => {
    const userData = user as any
    return {
      name: userData?.fullname || userData?.name || 'User',
      phone: userData?.phonenumber || userData?.phone || '',
      email: userData?.email || '',
    }
  }, [user])

  return userInfo
}

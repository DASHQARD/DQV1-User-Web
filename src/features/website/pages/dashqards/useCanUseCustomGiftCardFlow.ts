import { useAuthStore } from '@/stores'

/** True when user may use custom DashPro / DashGo flows (logged-in or guest OTP). */
export function useCanUseCustomGiftCardFlow(): boolean {
  return useAuthStore((s) => s.isAuthenticated)
}

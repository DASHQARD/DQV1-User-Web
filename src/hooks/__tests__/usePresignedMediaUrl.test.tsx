import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePresignedMediaUrl } from '../usePresignedMediaUrl'

vi.mock('@/utils/constants', () => ({
  ENV_VARS: { API_BASE_URL: 'https://api.example.com/api/v1' },
}))

describe('usePresignedMediaUrl', () => {
  it('returns null when file key is empty', () => {
    const { result } = renderHook(() => usePresignedMediaUrl(null))
    expect(result.current.url).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('uses absolute URLs as-is', () => {
    const { result } = renderHook(() =>
      usePresignedMediaUrl('https://example.com/avatar.jpg'),
    )
    expect(result.current.url).toBe('https://example.com/avatar.jpg')
  })

  it('resolves storage keys to uploads URLs', () => {
    const { result } = renderHook(() => usePresignedMediaUrl('1779330705116-key.png'))
    expect(result.current.url).toBe('https://api.example.com/uploads/1779330705116-key.png')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePresignedMediaUrl } from '../usePresignedMediaUrl'

const mockFetchPresignedURL = vi.fn()

vi.mock('../useUploadFiles', () => ({
  usePresignedURL: () => ({ mutateAsync: mockFetchPresignedURL }),
}))

describe('usePresignedMediaUrl', () => {
  beforeEach(() => {
    mockFetchPresignedURL.mockReset()
  })

  it('returns null when file key is empty', () => {
    const { result } = renderHook(() => usePresignedMediaUrl(null))
    expect(result.current.url).toBeNull()
    expect(mockFetchPresignedURL).not.toHaveBeenCalled()
  })

  it('uses absolute URLs without calling presigned API', () => {
    const { result } = renderHook(() =>
      usePresignedMediaUrl('https://example.com/avatar.jpg'),
    )
    expect(result.current.url).toBe('https://example.com/avatar.jpg')
    expect(mockFetchPresignedURL).not.toHaveBeenCalled()
  })

  it('fetches presigned URL for storage keys', async () => {
    mockFetchPresignedURL.mockResolvedValue({
      data: { signed_url: 'https://example.com/signed.jpg' },
    })
    const { result } = renderHook(() => usePresignedMediaUrl('1779330705116-key.png'))

    await waitFor(() => {
      expect(result.current.url).toBe('https://example.com/signed.jpg')
    })
    expect(mockFetchPresignedURL).toHaveBeenCalledWith('1779330705116-key.png')
  })
})

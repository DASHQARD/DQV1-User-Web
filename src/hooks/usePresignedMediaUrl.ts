import { useEffect, useState } from 'react'
import { usePresignedURL } from './useUploadFiles'
import { isAbsoluteMediaUrl, resolveSignedUrlFromResponse } from '@/utils/resolveSignedUrl'

/** Resolves a storage file key to a browser-loadable URL via POST /file/generate/signed-url. */
export function usePresignedMediaUrl(fileKey: string | null | undefined) {
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const [url, setUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!fileKey) {
      setUrl(null)
      setIsLoading(false)
      return
    }

    if (isAbsoluteMediaUrl(fileKey)) {
      setUrl(fileKey)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    const load = async () => {
      try {
        const response = await fetchPresignedURL(fileKey)
        if (!cancelled) {
          setUrl(resolveSignedUrlFromResponse(response))
        }
      } catch (error) {
        console.error('Failed to fetch presigned URL', error)
        if (!cancelled) setUrl(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [fileKey, fetchPresignedURL])

  return { url, isLoading }
}

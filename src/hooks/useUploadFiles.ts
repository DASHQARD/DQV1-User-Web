import { uploadFiles, getPresignedURL } from '@/services'
import { useMutation } from '@tanstack/react-query'

function useUploadFiles() {
  return useMutation({
    mutationFn: uploadFiles,
    onSuccess: (response: { file_name: string; file_key: string }[]) => {
      return response
    },
    onError: (error: { status: number; message: string }) => {
      return error
    },
  })
}

function usePresignedURL() {
  return useMutation({
    mutationFn: getPresignedURL,
    onSuccess: (response: string) => {
      return response
    },
    onError: (error: { status: number; message: string }) => {
      return error
    },
  })
}
export { useUploadFiles, usePresignedURL }

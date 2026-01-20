import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkAssignRecipients } from '@/features/dashboard/services/recipients'
import { useToast } from '@/hooks'

export function useBulkUploadRecipient() {
  const queryClient = useQueryClient()
  const toast = useToast()

  const bulkUploadMutation = useMutation({
    mutationFn: bulkAssignRecipients,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-recipients'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to upload recipients. Please try again.')
    },
  })

  const exampleCSV = `name,email,phone,message
John Doe,john.doe@example.com,+1234567890,Happy Birthday!
Jane Smith,jane.smith@example.com,+0987654321,Thank you for your service
Bob Johnson,bob.johnson@example.com,+1122334455,`

  const downloadExample = () => {
    const blob = new Blob([exampleCSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'recipients-example.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    bulkUploadMutation,
    downloadExample,
  }
}

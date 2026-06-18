import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Text } from '@/components'
import { ROUTES } from '@/utils/constants'

/** Legacy notifications route — approvals now live in the unified Requests inbox. */
export default function Notifications() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(ROUTES.IN_APP.DASHBOARD.CORPORATE.REQUESTS, { replace: true })
  }, [navigate])

  return (
    <div className="py-10">
      <Text variant="p" className="text-gray-600">
        Redirecting to Requests…
      </Text>
    </div>
  )
}

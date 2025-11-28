import { Icon } from '@/libs'
import { Modal, Loader } from '@/components'
import { useCustomerDetails } from '../../hooks/useCustomerDetails'
import { cn } from '@/libs'

interface CustomerDetailsModalProps {
  customerId: number | null
  isOpen: boolean
  onClose: () => void
}

export function CustomerDetailsModal({ customerId, isOpen, onClose }: CustomerDetailsModalProps) {
  const { data, isLoading, error } = useCustomerDetails(customerId)

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={(open) => !open && onClose()}
      title="Customer Details"
      position="side"
      panelClass="max-w-md md:w-2xl w-full"
    >
      <div className="px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Icon icon="bi:exclamation-triangle" className="text-4xl text-red-500 mb-4" />
            <p className="text-gray-700 font-medium">Failed to load customer details</p>
            <p className="text-sm text-gray-500 mt-2">Please try again later</p>
          </div>
        ) : data?.data ? (
          <div className="space-y-0 pb-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-base font-bold text-gray-900 mb-5">Basic Information</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">ID</label>
                  <p className="text-base font-normal text-gray-900">#{data.data.id}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-base font-normal text-gray-900">{data.data.email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-base font-normal text-gray-900">
                    {data.data.fullname || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                  <p className="text-base font-normal text-gray-900">
                    {data.data.phonenumber || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Status</label>
                  <div>
                    <span
                      className={cn(
                        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                        {
                          'bg-yellow-100 text-yellow-800': data.data.status === 'pending',
                          'bg-green-100 text-green-800':
                            data.data.status === 'verified' || data.data.status === 'active',
                          'bg-red-100 text-red-800': data.data.status === 'suspended',
                          'bg-gray-100 text-gray-800': data.data.status === 'inactive',
                        },
                      )}
                    >
                      {data.data.status.charAt(0).toUpperCase() + data.data.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-base font-normal text-gray-900">
                    {new Date(data.data.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="block text-sm font-medium text-gray-600">Updated At</label>
                  <p className="text-base font-normal text-gray-900">
                    {new Date(data.data.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional fields if they exist */}
            {Object.keys(data.data).some(
              (key) =>
                ![
                  'id',
                  'email',
                  'phonenumber',
                  'status',
                  'fullname',
                  'created_at',
                  'updated_at',
                ].includes(key),
            ) && (
              <div className="pt-6">
                <h3 className="text-base font-bold text-gray-900 mb-5">Additional Information</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  {Object.entries(data.data)
                    .filter(
                      ([key]) =>
                        ![
                          'id',
                          'email',
                          'phonenumber',
                          'status',
                          'fullname',
                          'created_at',
                          'updated_at',
                        ].includes(key),
                    )
                    .map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-600">
                          {key
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())
                            .replace('Dob', 'Date of Birth')
                            .replace('Id ', 'ID ')}
                        </label>
                        <p className="text-base font-normal text-gray-900">
                          {value !== null && value !== undefined ? String(value) : 'N/A'}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-700">No customer details available</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

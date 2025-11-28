import { Icon } from '@/libs'
import { Modal, Loader } from '@/components'
import { useVendorDetails } from '../../hooks/useVendorDetails'
import { cn } from '@/libs'

interface VendorDetailsModalProps {
  vendorId: number | null
  isOpen: boolean
  onClose: () => void
}

export function VendorDetailsModal({ vendorId, isOpen, onClose }: VendorDetailsModalProps) {
  const { data, isLoading, error } = useVendorDetails(vendorId)

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={(open) => !open && onClose()}
      title="Vendor Details"
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
            <p className="text-gray-700 font-medium">Failed to load vendor details</p>
            <p className="text-sm text-gray-500 mt-2">Please try again later</p>
          </div>
        ) : data ? (
          <div className="space-y-0 pb-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-base font-bold text-gray-900 mb-5">Basic Information</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">ID</label>
                  <p className="text-base font-normal text-gray-900">#{data.id}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-base font-normal text-gray-900">{data.email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                  <p className="text-base font-normal text-gray-900">{data.phonenumber || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Status</label>
                  <div>
                    <span
                      className={cn(
                        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                        {
                          'bg-yellow-100 text-yellow-800': data.status === 'pending',
                          'bg-green-100 text-green-800':
                            data.status === 'approved' ||
                            data.status === 'active' ||
                            data.status === 'verified',
                          'bg-red-100 text-red-800': data.status === 'rejected',
                          'bg-gray-100 text-gray-800': data.status === 'inactive',
                        },
                      )}
                    >
                      {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Branch Name</label>
                  <p className="text-base font-normal text-gray-900">
                    {data.branches?.[0]?.branch_name || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-base font-normal text-gray-900">
                    {new Date(data.created_at).toLocaleDateString('en-US', {
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
                    {new Date(data.updated_at).toLocaleDateString('en-US', {
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
            {Object.keys(data).some(
              (key) =>
                ![
                  'id',
                  'email',
                  'phonenumber',
                  'status',
                  'branch_name',
                  'created_at',
                  'updated_at',
                  'vendor',
                ].includes(key),
            ) && (
              <div className="pt-6">
                <h3 className="text-base font-bold text-gray-900 mb-5">Additional Information</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  {Object.entries(data)
                    .filter(
                      ([key]) =>
                        ![
                          'id',
                          'email',
                          'phonenumber',
                          'status',
                          'branch_name',
                          'created_at',
                          'updated_at',
                          'vendor',
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
            <p className="text-gray-700">No vendor details available</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

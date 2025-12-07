import { Icon } from '@/libs'
import { Modal, Loader } from '@/components'
import { useVendorDetails } from '../../hooks/useVendorDetails'
import { cn } from '@/libs'

interface VendorDetailsModalProps {
  vendorId: number | null
  isOpen: boolean
  onClose: () => void
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="border-b border-gray-200 pb-6">
    <h3 className="text-base font-bold text-gray-900 mb-5">{title}</h3>
    {children}
  </div>
)

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-600">{label}</label>
    <p className="text-base font-normal text-gray-900">{value}</p>
  </div>
)

export function VendorDetailsModal({ vendorId, isOpen, onClose }: VendorDetailsModalProps) {
  const { data, isLoading, error } = useVendorDetails(vendorId ? String(vendorId) : '')

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

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
          <div className="space-y-6 pb-6 max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* Basic Information */}
            <Section title="Basic Information">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <Field label="GVID" value={`${data.vendor_details.gvid}`} />
                <Field label="Full Name" value={data.fullname || 'N/A'} />
                <Field label="Email" value={data.email || 'N/A'} />
                <Field label="Phone Number" value={data.phonenumber || 'N/A'} />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Status</label>
                  <span
                    className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                      {
                        'bg-yellow-100 text-yellow-800': data.status === 'pending',
                        'bg-green-100 text-green-800': ['approved', 'active', 'verified'].includes(
                          data.status,
                        ),
                        'bg-red-100 text-red-800': data.status === 'rejected',
                        'bg-gray-100 text-gray-800': data.status === 'inactive',
                      },
                    )}
                  >
                    {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                  </span>
                </div>

                <Field label="User Type" value={data.user_type?.replace(/_/g, ' ') || 'N/A'} />
                <Field label="Street Address" value={data.street_address || 'N/A'} />

                <Field
                  label="Date of Birth"
                  value={
                    data.dob
                      ? new Date(data.dob).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'
                  }
                />

                <Field label="ID Type" value={data.id_type || 'N/A'} />
                <Field label="ID Number" value={data.id_number || 'N/A'} />
                <Field label="Email Verified" value={data.email_verified ? 'Yes' : 'No'} />
                <Field
                  label="Default Payment"
                  value={data.default_payment_option?.replace(/_/g, ' ') || 'N/A'}
                />
                <Field
                  label="Onboarding Stage"
                  value={data.onboarding_stage?.replace(/_/g, ' ') || 'N/A'}
                />
                <Field label="Created At" value={formatDate(data.created_at)} />
                <Field label="Updated At" value={formatDate(data.updated_at)} />
              </div>
            </Section>

            {/* Vendor Details */}
            {data.vendor_details && (
              <Section title="Vendor Information">
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <Field label="Vendor Code" value={data.vendor_details.code || 'N/A'} />
                  <Field label="GVID" value={data.vendor_details.gvid || 'N/A'} />
                  <Field label="Country" value={data.vendor_details.country || 'N/A'} />
                </div>
              </Section>
            )}

            {/* Business Details */}
            {data.business_details && (
              <Section title="Business Information">
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <Field label="Business Name" value={data.business_details.name || 'N/A'} />
                  <Field label="Business Type" value={data.business_details.type || 'N/A'} />
                  <Field label="Business Email" value={data.business_details.email || 'N/A'} />
                  <Field label="Business Phone" value={data.business_details.phone || 'N/A'} />
                  <Field
                    label="Business Address"
                    value={data.business_details.street_address || 'N/A'}
                  />
                  <Field
                    label="Digital Address"
                    value={data.business_details.digital_address || 'N/A'}
                  />
                  <Field
                    label="Registration Number"
                    value={data.business_details.registration_number || 'N/A'}
                  />
                </div>
              </Section>
            )}

            {/* ID Images */}
            {data.id_images?.length > 0 && (
              <Section title="ID Documents">
                <div className="grid grid-cols-1 gap-4">
                  {data.id_images.map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon icon="bi:file-earmark-image" className="text-2xl text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{image.file_name}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded on{' '}
                            {new Date(image.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <a
                        href={image.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Business Documents */}
            {data.business_documents?.length > 0 && (
              <Section title="Business Documents">
                <div className="grid grid-cols-1 gap-4">
                  {data.business_documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          icon={
                            doc.type === 'logo' ? 'bi:file-earmark-image' : 'bi:file-earmark-text'
                          }
                          className="text-2xl text-gray-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {doc.type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-500">{doc.file_name}</p>
                          {doc.business_industry && (
                            <p className="text-xs text-gray-500 mt-1">
                              Industry: {doc.business_industry}
                            </p>
                          )}
                        </div>
                      </div>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Mobile Money Accounts */}
            {data.momo_accounts?.length > 0 && (
              <Section title="Mobile Money Accounts">
                <div className="grid grid-cols-1 gap-4">
                  {data.momo_accounts.map((account) => (
                    <div key={account.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon icon="bi:phone" className="text-2xl text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 uppercase">
                              {account.provider}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {account.momo_number || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Added on{' '}
                              {new Date(account.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {data.default_payment_option === 'mobile_money' && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                              Default
                            </span>
                          )}
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Bank Accounts */}
            {data.bank_accounts?.length > 0 && (
              <Section title="Bank Accounts">
                <div className="grid grid-cols-1 gap-4">
                  {data.bank_accounts.map((account) => (
                    <div key={account.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon icon="bi:bank" className="text-2xl text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {account.bank_name || 'N/A'}
                            </p>
                            {account.account_name && (
                              <p className="text-sm text-gray-700 mt-1">{account.account_name}</p>
                            )}
                            <p className="text-sm text-gray-700 mt-1">
                              {account.account_number || 'N/A'}
                            </p>
                            {account.created_at && (
                              <p className="text-xs text-gray-500 mt-1">
                                Added on{' '}
                                {new Date(account.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        {data.default_payment_option === 'bank' && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Branches */}
            {data.branches?.length > 0 && (
              <Section title={`Branches (${data.branches.length})`}>
                <div className="space-y-4">
                  {data.branches.map((branch) => (
                    <div key={branch.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-bold text-gray-900">{branch.branch_name}</p>
                            <span
                              className={cn(
                                'text-xs px-2 py-0.5 rounded-full font-medium',
                                branch.branch_type === 'main'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800',
                              )}
                            >
                              {branch.branch_type === 'main' ? 'Main' : 'Sub'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Code: {branch.branch_code} | ID: {branch.full_branch_id}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <Field label="Location" value={branch.branch_location} />
                        <Field label="Manager" value={branch.branch_manager_name} />
                        <Field label="Manager Email" value={branch.branch_manager_email} />

                        {branch.parent_branch_id && (
                          <Field label="Parent Branch" value={`ID: ${branch.parent_branch_id}`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
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

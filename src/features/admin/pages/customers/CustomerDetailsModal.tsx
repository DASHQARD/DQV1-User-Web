import { Icon } from '@/libs'
import { Modal, Loader } from '@/components'
import { useCustomerDetails } from '../../hooks/useCustomerDetails'
import { cn } from '@/libs'

interface CustomerDetailsModalProps {
  customerId: number | null
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

export function CustomerDetailsModal({ customerId, isOpen, onClose }: CustomerDetailsModalProps) {
  const { data, isLoading, error } = useCustomerDetails(customerId)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const customer = data?.data

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={(open) => {
        if (!open) onClose()
      }}
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
        ) : customer ? (
          <div className="space-y-6 pb-6 max-h-[calc(100vh-120px)] overflow-y-auto">
            <Section title="Basic Information">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <Field label="Customer ID" value={`${customer.user_id}`} />
                <Field label="Full Name" value={customer.fullname || 'N/A'} />
                <Field label="Email" value={customer.email || 'N/A'} />
                <Field label="Phone Number" value={customer.phonenumber || 'N/A'} />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Status</label>
                  <span
                    className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                      {
                        'bg-yellow-100 text-yellow-800': customer.status === 'pending',
                        'bg-green-100 text-green-800': ['verified', 'active', 'approved'].includes(
                          customer.status,
                        ),
                        'bg-red-100 text-red-800': customer.status === 'suspended',
                        'bg-gray-100 text-gray-800': customer.status === 'inactive',
                      },
                    )}
                  >
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </span>
                </div>

                <Field
                  label="User Type"
                  value={
                    customer.user_type
                      ? customer.user_type.charAt(0).toUpperCase() + customer.user_type.slice(1)
                      : 'N/A'
                  }
                />

                <Field label="Street Address" value={customer.street_address || 'N/A'} />

                <Field
                  label="Date of Birth"
                  value={
                    customer.dob
                      ? new Date(customer.dob).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'
                  }
                />

                <Field label="ID Type" value={customer.id_type || 'N/A'} />
                <Field label="ID Number" value={customer.id_number || 'N/A'} />
                <Field label="Email Verified" value={customer.email_verified ? 'Yes' : 'No'} />

                <Field
                  label="Default Payment"
                  value={customer.default_payment_option?.replace(/_/g, ' ') || 'N/A'}
                />

                <Field
                  label="Onboarding Stage"
                  value={customer.onboarding_stage?.replace(/_/g, ' ') || 'N/A'}
                />

                <Field label="Created At" value={formatDate(customer.created_at)} />
                <Field label="Updated At" value={formatDate(customer.updated_at)} />
              </div>
            </Section>

            {customer.business_details && (
              <Section title="Business Information">
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <Field label="Business Name" value={customer.business_details.name || 'N/A'} />
                  <Field label="Business Type" value={customer.business_details.type || 'N/A'} />
                  <Field label="Business Email" value={customer.business_details.email || 'N/A'} />
                  <Field label="Business Phone" value={customer.business_details.phone || 'N/A'} />
                  <Field
                    label="Business Address"
                    value={customer.business_details.street_address || 'N/A'}
                  />
                  <Field
                    label="Digital Address"
                    value={customer.business_details.digital_address || 'N/A'}
                  />
                  <Field
                    label="Registration Number"
                    value={customer.business_details.registration_number || 'N/A'}
                  />
                </div>
              </Section>
            )}

            {customer.id_images?.length > 0 && (
              <Section title="ID Documents">
                <div className="grid grid-cols-1 gap-4">
                  {customer.id_images.map((image: any) => (
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

            {customer.business_documents?.length > 0 && (
              <Section title="Business Documents">
                <div className="grid grid-cols-1 gap-4">
                  {customer.business_documents.map((doc: any) => (
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
                            {doc.type?.replace(/_/g, ' ') || 'Document'}
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

            {customer.bank_accounts?.length > 0 && (
              <Section title="Bank Accounts">
                <div className="grid grid-cols-1 gap-4">
                  {customer.bank_accounts.map((account: any) => (
                    <div key={account.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon icon="bi:bank" className="text-2xl text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {account.bank_name || 'N/A'}
                            </p>
                            {account.account_holder_name && (
                              <p className="text-sm text-gray-700 mt-1">
                                {account.account_holder_name}
                              </p>
                            )}
                            <p className="text-sm text-gray-700 mt-1">
                              {account.account_number || 'N/A'}
                            </p>
                            {account.bank_branch && (
                              <p className="text-xs text-gray-500 mt-1">
                                Branch: {account.bank_branch}
                              </p>
                            )}
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

                        {customer.default_payment_option === 'bank' && (
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

            {customer.momo_accounts?.length > 0 && (
              <Section title="Mobile Money Accounts">
                <div className="grid grid-cols-1 gap-4">
                  {customer.momo_accounts.map((account: any) => (
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
                          {customer.default_payment_option === 'mobile_money' && (
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

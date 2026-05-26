export type RequestApprovalStatus = 'approved' | 'rejected' | 'pending'

export type UpdateRequestStatusPayload = {
  id: string | number
  status: RequestApprovalStatus
  rejection_reason?: string
  comments?: string
}

export type RequestApproverLevel = 'vendor_admin' | 'corporate_admin' | 'admin'

export type RequestApprovalContext = 'vendor' | 'corporate' | 'corporate-vendor-scoped'

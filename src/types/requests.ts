export type RequestApprovalStatus = 'approved' | 'rejected' | 'pending'

export type UpdateRequestStatusPayload = {
  id: string | number
  status: RequestApprovalStatus
  rejection_reason?: string
  comments?: string
}

export type RequestApproverLevel = 'vendor_admin' | 'corporate_admin' | 'admin'

export type RequestApprovalContext = 'vendor' | 'corporate' | 'corporate-vendor-scoped'

export type RequestInboxRole = 'vendor' | 'corporate' | 'corporate-vendor-scoped'

export type ApprovalChainItem = {
  level: RequestApproverLevel | string
  approver_user_id?: string | null
  approver_user_type?: string | null
  approver_name?: string | null
  status: RequestApprovalStatus | string
  reviewed_at?: string | null
  comments?: string | null
}

/** Shape returned by GET /requests/* list and detail endpoints (subset used in UI). */
export type RequestEntity = {
  id?: string | number
  request_id?: string
  type?: string
  module?: string
  user_id?: string
  user_type?: string
  name?: string
  description?: string
  status?: string
  access?: string
  entity_id?: string | number
  request_data?: Record<string, unknown>
  approval_chain?: ApprovalChainItem[]
  current_approver_level?: string
  initiated_by_user_id?: string
  initiated_by_user_type?: string
  rejection_reason?: string | null
  reviewed_by?: string
  reviewed_at?: string
  card_details?: Record<string, unknown>
  entity_details?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

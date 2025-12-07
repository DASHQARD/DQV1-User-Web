export const VENDORS_QUERY_KEY = {
  all: ['vendors'] as const,
  list: (filters: {
    page: number
    limit: number
    search?: string
    status?: string
    vendor_id?: string
    branch_type?: string
    is_single_branch?: string
    parent_branch_id?: string
    card_type?: string
    card_id?: string
    date_from?: string
    date_to?: string
    min_price?: string
    max_price?: string
  }) => [...VENDORS_QUERY_KEY.all, 'list', filters],
}

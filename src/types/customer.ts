export type Customer = {
  id: number
  email: string
  phonenumber: string | null
  status: string
  fullname?: string | null
  created_at: string
  updated_at: string
  [key: string]: any
}

export type CustomersListResponse = {
  status: string
  statusCode: number
  message: string
  data: Customer[]
  pagination: {
    limit: number
    hasNextPage: boolean
    next: string | null
  }
  url: string
}

export type CustomersQueryParams = {
  limit?: number
  status?: string
  search?: string
  after?: string
}

export type CustomerDetailsResponse = {
  status: string
  statusCode: number
  message: string
  data: Customer & {
    [key: string]: any
  }
}

export type UpdateCustomerStatusPayload = {
  user_id: string
  status: string
}

export type UpdateCustomerStatusResponse = {
  status: string
  statusCode: number
  message: string
  data?: any
}

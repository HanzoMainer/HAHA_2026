export interface Pagination {
  page: number
  pageSize: number
  total: number
}

export interface ApiResponse<T> {
  data: T
  pagination?: Pagination
  error?: string
}

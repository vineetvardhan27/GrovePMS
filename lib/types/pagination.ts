export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number | null;
  totalPages: number | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

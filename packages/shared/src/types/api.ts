/**
 * Standard API Response wrapper for single item or operation results.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedData<T = unknown> {
  items: T[];
  pagination: PaginationInfo;
}

/**
 * Standard API Response wrapper for paginated collections.
 */
export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: PaginatedData<T>;
  timestamp: string;
}

/**
 * Structured API Error detail.
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown> | Array<unknown>;
  stack?: string;
}

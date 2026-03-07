/**
 * API response envelope and error types.
 * Mirrors @studyplug/core api-models/api-envelope.ts without Zod dependency.
 */

export interface ApiMeta {
  requestId: string;
  generatedAt: string;
  seed?: number;
  apiVersion: "v1";
  cacheHit: boolean;
  generationTimeMs?: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
  pagination?: Pagination;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
}

/** RFC 7807 Problem Details */
export interface ApiErrorBody {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: ValidationErrorDetail[];
  retryAfter?: number;
}

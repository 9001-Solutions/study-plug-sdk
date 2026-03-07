import type { HttpClient } from "../http.js";
import type { ApiResponse } from "../types/envelope.js";
import type {
  StandardSummary,
  StandardDetail,
  StandardsListParams,
} from "../types/catalog.js";

export class StandardsResource {
  constructor(private readonly http: HttpClient) {}

  /** Browse/search standards with pagination. */
  async list(
    params?: StandardsListParams,
  ): Promise<ApiResponse<{ standards: StandardSummary[] }>> {
    return this.http.get(
      "/api/v1/standards",
      params as Record<string, unknown>,
    );
  }

  /** Get a standard by code with mapped skills. */
  async get(
    code: string,
  ): Promise<ApiResponse<{ standard: StandardDetail }>> {
    return this.http.get(`/api/v1/standards/${encodeURIComponent(code)}`);
  }
}

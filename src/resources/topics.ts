import type { HttpClient } from "../http.js";
import type { ApiResponse } from "../types/envelope.js";
import type { TopicSummary, TopicsListParams } from "../types/catalog.js";

export class TopicsResource {
  constructor(private readonly http: HttpClient) {}

  /** List/filter topics. */
  async list(
    params?: TopicsListParams,
  ): Promise<ApiResponse<{ topics: TopicSummary[] }>> {
    return this.http.get("/api/v1/topics", params as Record<string, unknown>);
  }
}

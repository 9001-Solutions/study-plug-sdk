import type { HttpClient } from "../http.js";
import type {
  GenerateParams,
  SingleGenerateParams,
  GenerateResponse,
  SingleGenerateResponse,
} from "../types/generate.js";

export class GenerateResource {
  constructor(private readonly http: HttpClient) {}

  /** Generate a batch of content items. */
  async batch(params: GenerateParams): Promise<GenerateResponse> {
    return this.http.post("/api/v1/generate", params);
  }

  /** Generate a single content item. */
  async single(params: SingleGenerateParams): Promise<SingleGenerateResponse> {
    return this.http.post("/api/v1/generate/single", params);
  }
}

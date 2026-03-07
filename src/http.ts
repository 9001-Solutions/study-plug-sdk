/**
 * HTTP transport layer — native fetch with retries, timeout, and error mapping.
 */

import type { StudyPlugOptions } from "./types/options.js";
import type { ApiErrorBody } from "./types/envelope.js";
import {
  StudyPlugError,
  AuthenticationError,
  RateLimitError,
  NotFoundError,
  ValidationError,
} from "./errors.js";

const DEFAULT_BASE_URL = "https://api.studyplug.org";
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_RETRIES = 2;

export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly apiKey?: string;
  private readonly fetchFn: typeof globalThis.fetch;

  constructor(options: StudyPlugOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.apiKey = options.apiKey;
    this.fetchFn = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  async get<T>(path: string, query?: Record<string, unknown>): Promise<T> {
    const url = this.buildUrl(path, query);
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  private buildUrl(
    path: string,
    query?: Record<string, unknown>,
  ): string {
    const url = new URL(path, this.baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async request<T>(
    url: string,
    init: RequestInit,
    attempt = 0,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(init.headers as Record<string, string>),
    };
    if (this.apiKey) {
      headers["X-StudyPlug-Key"] = this.apiKey;
    }

    try {
      const response = await this.fetchFn(url, {
        ...init,
        headers,
        signal: controller.signal,
      });

      if (response.ok) {
        return (await response.json()) as T;
      }

      // Parse error body
      let errorBody: ApiErrorBody;
      try {
        errorBody = (await response.json()) as ApiErrorBody;
      } catch {
        errorBody = {
          type: "https://api.studyplug.org/errors/unknown",
          title: response.statusText || "Request Failed",
          status: response.status,
          detail: `HTTP ${response.status}`,
          instance: url,
        };
      }

      // Retry on 429 with Retry-After
      if (response.status === 429 && attempt < this.maxRetries) {
        const retryAfter = parseRetryAfter(response, errorBody);
        await sleep(retryAfter * 1000);
        return this.request<T>(url, init, attempt + 1);
      }

      throw toStudyPlugError(errorBody);
    } catch (err) {
      if (err instanceof StudyPlugError) throw err;
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new StudyPlugError({
          type: "https://api.studyplug.org/errors/timeout",
          title: "Request Timeout",
          status: 0,
          detail: `Request timed out after ${this.timeout}ms`,
          instance: url,
        });
      }
      throw new StudyPlugError({
        type: "https://api.studyplug.org/errors/network",
        title: "Network Error",
        status: 0,
        detail: err instanceof Error ? err.message : "Unknown network error",
        instance: url,
      });
    } finally {
      clearTimeout(timer);
    }
  }
}

function toStudyPlugError(body: ApiErrorBody): StudyPlugError {
  switch (body.status) {
    case 401:
      return new AuthenticationError(body);
    case 404:
      return new NotFoundError(body);
    case 422:
      return new ValidationError(body);
    case 429:
      return new RateLimitError(body);
    default:
      return new StudyPlugError(body);
  }
}

function parseRetryAfter(response: Response, body: ApiErrorBody): number {
  const header = response.headers.get("Retry-After");
  if (header) {
    const seconds = parseInt(header, 10);
    if (!isNaN(seconds)) return Math.min(seconds, 60);
  }
  return body.retryAfter ?? 1;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

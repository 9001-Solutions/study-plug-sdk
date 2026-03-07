/**
 * Configuration options for the StudyPlug SDK client.
 */
export interface StudyPlugOptions {
  /** API key for authenticated requests. Sets the X-StudyPlug-Key header. */
  apiKey?: string;

  /** Base URL of the StudyPlug API. Defaults to https://api.studyplug.org */
  baseUrl?: string;

  /** Request timeout in milliseconds. Defaults to 30000 (30s). */
  timeout?: number;

  /** Maximum number of retries on 429 responses. Defaults to 2. */
  maxRetries?: number;

  /** Custom fetch implementation for testing or custom environments. */
  fetch?: typeof globalThis.fetch;
}

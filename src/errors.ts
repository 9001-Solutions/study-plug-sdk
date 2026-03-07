/**
 * SDK error classes wrapping RFC 7807 Problem Details.
 */

import type { ApiErrorBody, ValidationErrorDetail } from "./types/envelope.js";

export class StudyPlugError extends Error {
  readonly status: number;
  readonly raw: ApiErrorBody;

  constructor(body: ApiErrorBody) {
    super(body.detail);
    this.name = "StudyPlugError";
    this.status = body.status;
    this.raw = body;
  }
}

export class AuthenticationError extends StudyPlugError {
  constructor(body: ApiErrorBody) {
    super(body);
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends StudyPlugError {
  readonly retryAfter: number;

  constructor(body: ApiErrorBody) {
    super(body);
    this.name = "RateLimitError";
    this.retryAfter = body.retryAfter ?? 60;
  }
}

export class NotFoundError extends StudyPlugError {
  constructor(body: ApiErrorBody) {
    super(body);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends StudyPlugError {
  readonly fieldErrors: ValidationErrorDetail[];

  constructor(body: ApiErrorBody) {
    super(body);
    this.name = "ValidationError";
    this.fieldErrors = body.errors ?? [];
  }
}

// Type guards for clean catch blocks
export function isStudyPlugError(err: unknown): err is StudyPlugError {
  return err instanceof StudyPlugError;
}

export function isAuthenticationError(err: unknown): err is AuthenticationError {
  return err instanceof AuthenticationError;
}

export function isRateLimitError(err: unknown): err is RateLimitError {
  return err instanceof RateLimitError;
}

export function isNotFoundError(err: unknown): err is NotFoundError {
  return err instanceof NotFoundError;
}

export function isValidationError(err: unknown): err is ValidationError {
  return err instanceof ValidationError;
}

/**
 * Types for the /generate endpoints.
 */

import type { ContentItem } from "./content-item.js";
import type { ApiMeta } from "./envelope.js";

// =============================================================================
// REQUEST PARAMS
// =============================================================================

export interface GenerateParams {
  /** Single skill slug */
  skill?: string;
  /** Multiple skill slugs */
  skills?: string[];
  /** Single standard code */
  standard?: string;
  /** Multiple standard codes */
  standards?: string[];
  /** Grade slug filter */
  grade?: string;
  /** Subject slug filter */
  subject?: string;
  /** Number of items to generate (1-50, default 10) */
  count?: number;
  /** Seed for deterministic output */
  seed?: number;
}

export interface SingleGenerateParams {
  /** Skill slug (required) */
  skill: string;
  /** Grade slug filter */
  grade?: string;
  /** Seed for deterministic output */
  seed?: number;
}

// =============================================================================
// RESPONSE DATA
// =============================================================================

export interface AnswerKeyEntry {
  itemId: string;
  answer: string;
  explanation?: string;
}

export interface GenerateData {
  items: ContentItem[];
  answerKey: AnswerKeyEntry[];
}

export interface GenerateResponse {
  data: GenerateData;
  meta: ApiMeta;
}

export interface SingleGenerateData {
  item: ContentItem;
  answer: AnswerKeyEntry;
}

export interface SingleGenerateResponse {
  data: SingleGenerateData;
  meta: ApiMeta;
}

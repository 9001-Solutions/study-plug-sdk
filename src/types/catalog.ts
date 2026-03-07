/**
 * Catalog types for grades, subjects, topics, skills, and standards.
 * Mirrors @studyplug/core api-models/catalog.ts without Zod dependency.
 */

import type { StandardReference } from "./content-item.js";

// =============================================================================
// GRADE
// =============================================================================

export interface GradeSummary {
  slug: string;
  name: string;
  order: number;
  subjectCount?: number;
  skillCount?: number;
}

export interface GradeDetail {
  slug: string;
  name: string;
  order: number;
  subjects: SubjectSummary[];
}

// =============================================================================
// SUBJECT
// =============================================================================

export interface SubjectSummary {
  slug: string;
  name: string;
  description?: string;
  topicCount?: number;
  skillCount?: number;
  gradeCount?: number;
}

export interface SubjectDetail {
  slug: string;
  name: string;
  description?: string;
  topics: TopicInSubject[];
}

export interface TopicInSubject {
  slug: string;
  name: string;
  description?: string;
  skillCount: number;
  grades: string[];
}

// =============================================================================
// TOPIC
// =============================================================================

export interface TopicSummary {
  slug: string;
  name: string;
  description?: string;
  subject: { slug: string; name: string };
  skillCount: number;
  grades: string[];
}

// =============================================================================
// SKILL
// =============================================================================

export interface SkillSummary {
  slug: string;
  name: string;
  description?: string;
  grade: { slug: string; name: string; order: number };
  subject: { slug: string; name: string };
  topic: { slug: string; name: string };
  standards?: StandardReference[];
}

export interface SkillDetail {
  skill: SkillSummary;
  availableGrades: Array<{ slug: string; name: string; order: number }>;
}

// =============================================================================
// STANDARD
// =============================================================================

export interface StandardSummary {
  code: string;
  framework: string;
  label?: string;
  description?: string;
  skillCount: number;
}

export interface StandardDetail {
  code: string;
  framework: string;
  label?: string;
  description?: string;
  skills: Array<{
    slug: string;
    name: string;
    grade: { slug: string; name: string; order: number };
    subject: { slug: string; name: string };
    topic: { slug: string; name: string };
  }>;
}

// =============================================================================
// QUERY PARAMS
// =============================================================================

export interface SkillsListParams {
  grade?: string;
  subject?: string;
  topic?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface TopicsListParams {
  subject?: string;
  grade?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface StandardsListParams {
  framework?: string;
  grade?: number;
  q?: string;
  page?: number;
  pageSize?: number;
}

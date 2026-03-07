/**
 * StudyPlug — Main SDK client.
 *
 * @example
 * ```ts
 * const sp = new StudyPlug({ apiKey: "sk-..." });
 *
 * // Generate content
 * const batch = await sp.generate({ skill: "add-within-10", count: 5 });
 * const single = await sp.generate.single({ skill: "add-within-10" });
 *
 * // Browse catalog
 * const grades = await sp.grades.list();
 * const skill = await sp.skills.get("add-within-10");
 * ```
 */

import type { StudyPlugOptions } from "./types/options.js";
import type {
  GenerateParams,
  SingleGenerateParams,
  GenerateResponse,
  SingleGenerateResponse,
} from "./types/generate.js";
import { HttpClient } from "./http.js";
import { GradesResource } from "./resources/grades.js";
import { SubjectsResource } from "./resources/subjects.js";
import { TopicsResource } from "./resources/topics.js";
import { SkillsResource } from "./resources/skills.js";
import { StandardsResource } from "./resources/standards.js";
import { GenerateResource } from "./resources/generate.js";

/** Callable generate function with .single() method. */
export interface GenerateFn {
  (params: GenerateParams): Promise<GenerateResponse>;
  single(params: SingleGenerateParams): Promise<SingleGenerateResponse>;
}

export class StudyPlug {
  readonly grades: GradesResource;
  readonly subjects: SubjectsResource;
  readonly topics: TopicsResource;
  readonly skills: SkillsResource;
  readonly standards: StandardsResource;
  readonly generate: GenerateFn;

  private readonly http: HttpClient;

  constructor(options: StudyPlugOptions = {}) {
    this.http = new HttpClient(options);

    this.grades = new GradesResource(this.http);
    this.subjects = new SubjectsResource(this.http);
    this.topics = new TopicsResource(this.http);
    this.skills = new SkillsResource(this.http);
    this.standards = new StandardsResource(this.http);

    const generateResource = new GenerateResource(this.http);

    // Build the callable generate function with .single() property
    const generateFn = ((params: GenerateParams) =>
      generateResource.batch(params)) as GenerateFn;
    generateFn.single = (params: SingleGenerateParams) =>
      generateResource.single(params);

    this.generate = generateFn;
  }

  /** Health check — GET /api/v1/health */
  async health(): Promise<{ status: string; timestamp: string; uptime: number }> {
    return this.http.get("/api/v1/health");
  }
}

/**
 * @studyplug/sdk — TypeScript SDK for the StudyPlug API
 *
 * @example
 * ```ts
 * import { StudyPlug } from "@studyplug/sdk";
 *
 * const sp = new StudyPlug();
 * const { data } = await sp.generate({ skill: "add-within-10", count: 5 });
 * console.log(data.items);
 * ```
 */

export { StudyPlug } from "./client.js";
export type { GenerateFn } from "./client.js";

export {
  StudyPlugError,
  AuthenticationError,
  RateLimitError,
  NotFoundError,
  ValidationError,
  isStudyPlugError,
  isAuthenticationError,
  isRateLimitError,
  isNotFoundError,
  isValidationError,
} from "./errors.js";

export type {
  // Options
  StudyPlugOptions,
  // Envelope
  ApiMeta,
  Pagination,
  ApiResponse,
  ValidationErrorDetail,
  ApiErrorBody,
  // Content
  FractionValue,
  ArithmeticContent,
  MultipleChoiceContent,
  FillBlankContent,
  TrueFalseContent,
  ShortAnswerContent,
  PassageContent,
  MatchingContent,
  OrderingContent,
  DiagramContent,
  WordPuzzleContent,
  PictureCountingContent,
  PictureArithmeticContent,
  DataTableContent,
  SpellingActivityContent,
  WordBankContent,
  CategorySortingContent,
  PhonicsWordListContent,
  TracingActivityContent,
  ContentBody,
  ContentItemType,
  DifficultyDescriptor,
  AnswerDescriptor,
  StandardReference,
  RenderHints,
  ContentItem,
  // Catalog
  GradeSummary,
  GradeDetail,
  SubjectSummary,
  SubjectDetail,
  TopicInSubject,
  TopicSummary,
  SkillSummary,
  SkillDetail,
  StandardSummary,
  StandardDetail,
  SkillsListParams,
  TopicsListParams,
  StandardsListParams,
  // Generate
  AnswerKeyEntry,
  GenerateParams,
  SingleGenerateParams,
  GenerateData,
  GenerateResponse,
  SingleGenerateData,
  SingleGenerateResponse,
} from "./types/index.js";

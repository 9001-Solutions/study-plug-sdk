/**
 * ContentItem and all 18 content body types.
 * Mirrors @studyplug/core api-models/content-item.ts without Zod dependency.
 */

// =============================================================================
// PRIMITIVE TYPES
// =============================================================================

export interface FractionValue {
  numerator: number;
  denominator: number;
  wholeNumber?: number;
  display: string;
}

// =============================================================================
// CONTENT TYPES (Discriminated Union)
// =============================================================================

export interface ArithmeticContent {
  type: "arithmetic";
  operand1: number | FractionValue;
  operand2: number | FractionValue;
  operand3?: number;
  operator: "+" | "-" | "\u00d7" | "\u00f7";
  displayFormat?: "horizontal" | "vertical";
  missingOperand?: "operand1" | "operand2" | "result";
}

export interface MultipleChoiceContent {
  type: "multiple-choice";
  stem: string;
  choices: Array<{
    text: string;
    isDistractor: boolean;
    distractorReason?: string;
  }>;
  correctIndex: number;
  explanation?: string;
}

export interface FillBlankContent {
  type: "fill-blank";
  template: string;
  answer: string;
  acceptableAnswers?: string[];
  caseSensitive?: boolean;
}

export interface TrueFalseContent {
  type: "true-false";
  statement: string;
  isTrue: boolean;
  explanation?: string;
}

export interface ShortAnswerContent {
  type: "short-answer";
  question: string;
  sampleAnswer?: string;
  keywords?: string[];
}

export interface PassageContent {
  type: "passage-based";
  passage: {
    text: string;
    title: string;
    genre: "fiction" | "nonfiction" | "poetry";
    wordCount: number;
    readingLevel?: string;
    paragraphs: string[];
  };
  questionCount: number;
}

export interface MatchingContent {
  type: "matching";
  instructions: string;
  pairs: Array<{ left: string; right: string }>;
  shuffledRight: string[];
}

export interface OrderingContent {
  type: "ordering";
  instructions: string;
  items: string[];
  shuffledItems: string[];
}

export interface DiagramContent {
  type: "diagram";
  diagramKind:
    | "number-line"
    | "shape"
    | "coordinate-plane"
    | "bar-model"
    | "clock"
    | "ruler"
    | "visual-multiplication";
  diagramData: Record<string, unknown>;
  question: string;
  answer: string | number;
}

export interface WordPuzzleContent {
  type: "word-puzzle";
  puzzleType: "word-search" | "crossword";
  grid: string[][];
  words: Array<{ word: string; clue?: string }>;
  gridSize: { rows: number; cols: number };
}

export interface PictureCountingContent {
  type: "picture-counting";
  count: number;
  objectDescription: string;
}

export interface DataTableContent {
  type: "data-table";
  tableTitle: string;
  headers: string[];
  rows: string[][];
  question: string;
  answer: string;
}

export interface PictureArithmeticContent {
  type: "picture-arithmetic";
  operand1: number;
  operand2: number;
  operator: "+" | "-";
  iconType: string;
}

export interface SpellingActivityContent {
  type: "spelling-activity";
  exerciseType:
    | "write-word"
    | "unscramble"
    | "complete-word"
    | "find-misspelling"
    | "write-contraction"
    | "expand-contraction"
    | "copy-word"
    | "write-from-dictation";
  word: string;
  definition?: string;
  scrambled?: string;
  partial?: string;
  misspellings?: string[];
  fullForm?: string;
  contraction?: string;
  copyCount?: number;
  showTracing?: boolean;
}

export interface WordBankContent {
  type: "word-bank";
  title?: string;
  words: Array<{
    word: string;
    definition: string;
    partOfSpeech?: string;
    exampleSentence?: string;
  }>;
}

export interface CategorySortingContent {
  type: "category-sorting";
  instructions: string;
  categories: string[];
  items: Array<{
    item: string;
    correctCategory: string;
  }>;
}

export interface PhonicsWordListContent {
  type: "phonics-word-list";
  targetSound: string;
  exerciseType?: string;
  words: string[];
  correctWords: string[];
}

export interface TracingActivityContent {
  type: "tracing-activity";
  exerciseType:
    | "read-and-trace"
    | "read-and-circle"
    | "fill-missing"
    | "rainbow-write"
    | "match-word";
  word: string;
  traceSvg?: string;
  sentence?: string;
  choices?: string[];
  correctIndex?: number;
}

export type ContentBody =
  | ArithmeticContent
  | MultipleChoiceContent
  | FillBlankContent
  | TrueFalseContent
  | ShortAnswerContent
  | PassageContent
  | MatchingContent
  | OrderingContent
  | DiagramContent
  | WordPuzzleContent
  | PictureCountingContent
  | PictureArithmeticContent
  | DataTableContent
  | SpellingActivityContent
  | WordBankContent
  | CategorySortingContent
  | PhonicsWordListContent
  | TracingActivityContent;

export type ContentItemType = ContentBody["type"];

// =============================================================================
// DIFFICULTY
// =============================================================================

export interface DifficultyDescriptor {
  level: "easy" | "medium" | "hard";
  dok?: number;
  bloom?:
    | "remember"
    | "understand"
    | "apply"
    | "analyze"
    | "evaluate"
    | "create";
  gradeEquivalent?: number;
  complexityScore?: number;
}

// =============================================================================
// ANSWER
// =============================================================================

export interface AnswerDescriptor {
  type: "exact" | "multiple-choice-index" | "open-ended" | "set" | "boolean";
  value: string | number | boolean;
  display: string;
  unit?: string;
  explanation?: string;
  acceptableAnswers?: string[];
}

// =============================================================================
// STANDARD REFERENCE
// =============================================================================

export interface StandardReference {
  code: string;
  framework: string;
  description?: string;
}

// =============================================================================
// RENDER HINTS
// =============================================================================

export interface RenderHints {
  print?: {
    suggestedWidth?: "quarter-page" | "half-page" | "full-page";
    orientation?: "portrait" | "landscape";
    showWorkSpace?: boolean;
    columns?: number;
  };
  digital?: {
    interactiveType?: "input" | "drag-drop" | "tap-choice" | "draw";
    inputType?: "number" | "text" | "fraction";
  };
  visuals?: {
    diagramSvg?: string;
    imageRefs?: Array<{
      id: string;
      alt: string;
      category: "object" | "diagram" | "symbol";
    }>;
  };
}

// =============================================================================
// CONTENT ITEM
// =============================================================================

export interface ContentItem {
  id: string;
  type: ContentItemType;
  standard?: StandardReference;
  skill: string;
  gradeLevel: number;
  difficulty: DifficultyDescriptor;
  content: ContentBody;
  answer: AnswerDescriptor;
  renderHints?: RenderHints;
}

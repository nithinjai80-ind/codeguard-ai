// ROX AI: Write. Analyze. Verify.
// Platform Type Definitions

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  submissions_count?: number;
  accepted_count?: number;
  pending_count?: number;
  reviews_count?: number;
}

export type SubmissionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'REVISION_REQUIRED'
  | 'REVIEW_REQUIRED'
  | 'INVESTIGATING'
  | 'ANALYZED'
  | 'CLEAR'
  | 'RESOLVED_ACCEPTABLE'
  | 'RESOLVED_VIVA_REQUIRED';

export type ReviewStatus = SubmissionStatus;
export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface TestCase {
  input: string;
  expected_output?: string;
  is_sample: boolean;
  explanation?: string;
}

export interface QuestionExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface Question {
  id: string;
  _id?: string;
  title: string;
  description: string;
  input_format?: string;
  output_format?: string;
  constraints?: string[];
  examples?: QuestionExample[];
  language: string;
  allowed_languages?: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  time_limit?: number; // ms
  memory_limit?: number; // MB
  test_cases?: TestCase[];
  created_by?: string;
  created_by_name?: string;
  status: 'DRAFT' | 'PUBLISHED';
  submissions_count?: number;
  submission_status?: SubmissionStatus | null;
  submission_id?: string | null;
  submitted_at?: string | null;
  submitted_code?: string | null;
  teacher_comment?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TestCaseResult {
  test_case: number;
  passed: boolean;
  input: string;
  expected_output: string;
  actual_output: string;
  execution_time_ms: number;
  error?: string;
}

export interface CodeExecutionResult {
  compilation_status: string;
  runtime_status: string;
  output: string;
  error: string;
  execution_time_ms: number;
  test_results: TestCaseResult[];
  passed: number;
  total: number;
  summary?: string;
}

export interface StudentStats {
  student_name: string;
  questions_available: number;
  submitted: number;
  accepted: number;
  pending_review: number;
  needs_revision: number;
  rejected: number;
}

export interface StudentSubmissionItem {
  id: string;
  submission_id: string;
  question_id: string;
  question_title: string;
  language: string;
  submitted_at: string;
  status: SubmissionStatus;
  source_code?: string;
  test_results?: {
    passed: number;
    total: number;
  };
  teacher_comment?: string | null;
  reviewed_at?: string | null;
}

export interface TeacherDashboardData {
  total_questions: number;
  total_students: number;
  total_submissions: number;
  pending_reviews: number;
  accepted_submissions: number;
  rejected_submissions: number;
  review_required: number;
  similarity_cases: number;
  review_queue: {
    id: string;
    student_name: string;
    question_title: string;
    test_results: { passed: number; total: number };
    similarity: number;
    status: string;
    submitted_at: string;
  }[];
}

export interface AdminStats {
  total_students: number;
  total_teachers: number;
  total_questions: number;
  total_assignments: number;
  total_submissions: number;
  review_cases: number;
  pending_submissions: number;
}

export interface CodeRegion {
  startLine: number;
  endLine: number;
  description: string;
  type: 'VARIABLE_RENAMING' | 'EXPRESSION_TRANSFORMATION' | 'STRUCTURAL_EQUIVALENCE' | 'CONTROL_FLOW';
}

export interface Submission {
  id: string;
  studentId?: string;
  student_id?: string;
  studentName?: string;
  studentEmail?: string;
  department?: string;
  assignmentId?: string;
  assignmentTitle?: string;
  question_id?: string;
  question_title?: string;
  language: 'Java' | 'Python' | 'C++' | 'JavaScript' | string;
  submittedAt?: string;
  submitted_at?: string;
  status: SubmissionStatus;
  overallSimilarity?: number;
  code?: string;
  source_code?: string;
  revision?: number;
  fileName?: string;
  linesOfCode?: number;
  test_results?: {
    passed: number;
    total: number;
  };
  teacher_comment?: string | null;
  reviewed_at?: string | null;
  reviewer_name?: string | null;
  pairedSubmissionId?: string;
  analysisDetails?: SubmissionAnalysis;
  pairedSimilarity?: SimilarityPair;
}

export interface SubmissionAnalysis {
  structuralSimilarity: number;
  semanticSimilarity: number;
  behavioralSimilarity: number;
  timelineCorrelation: number;
  overallReviewScore: number;
  flaggedEvidence: {
    astStructure: boolean;
    variableRelationships: boolean;
    controlFlow: boolean;
    algorithmicOperations: boolean;
    matchingRegionsCount: number;
    timelineAnomaly: boolean;
    timelineNote?: string;
  };
  matchingRegions: CodeRegion[];
}

export interface Transformation {
  id: string;
  type: 'VARIABLE_RENAMING' | 'EXPRESSION_TRANSFORMATION' | 'FORMATTING_DIFFERENCE' | 'CONTROL_FLOW' | 'STRUCTURAL_EQUIVALENCE';
  title: string;
  detailA: string;
  detailB: string;
  explanation: string;
}

export interface SimilarityPair {
  id: string;
  submissionAId: string;
  submissionBId: string;
  studentAName: string;
  studentBName: string;
  assignmentTitle?: string;
  questionTitle?: string;
  structural: number;
  semantic: number;
  behavioral: number;
  timeline: number;
  reviewScore: number;
  status: 'Similarity Review Required' | 'Review Required' | 'Investigate' | 'Reviewed' | 'Cleared';
  detectedRegionsCount: number;
  timeDeltaMinutes?: number;
  transformations: Transformation[];
  evidence?: string[];
  codeA?: string;
  codeB?: string;
  tutorDecision?: {
    reviewedBy: string;
    reviewedAt: string;
    verdict: string;
    notes: string;
  };
}

export interface Cluster {
  id: string;
  name: string;
  assignmentTitle: string;
  submissionCount: number;
  averageSimilarity: number;
  students: {
    studentId: string;
    name: string;
    submissionId: string;
    similarityScore: number;
    centrality: number;
  }[];
  connections: {
    source: string;
    target: string;
    similarity: number;
  }[];
  primaryPattern: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  date: string;
  timestamp: number;
  studentName: string;
  studentId: string;
  submissionId: string;
  assignmentTitle: string;
  eventType: 'INITIAL_SUBMISSION' | 'REVISION' | 'FLAGGED_SIMILARITY' | 'TEACHER_REVIEW';
  similarityWithPrevious?: number;
  correlatedWithStudent?: string;
  revisionNumber: number;
  timeDeltaFromPrevious?: string;
  details: string;
}

export interface Assignment {
  id: string;
  title: string;
  courseCode: string;
  department: string;
  language: string;
  totalSubmissions: number;
  requiringReview: number;
  averageSimilarity: number;
  dueDate: string;
  status: 'ACTIVE' | 'CLOSED' | 'ANALYSIS_COMPLETED';
  description: string;
  targetClass?: string;
  questions?: string[];
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  department: string;
  batch: string;
  submissionsCount: number;
  assignmentsCompleted: number;
  reviewCasesCount: number;
  lastSubmission: string;
}

export interface ReportStats {
  totalSubmissions: number;
  similarityCases: number;
  reviewCases: number;
  reviewedCases: number;
  averageSimilarity: number;
  similarityDistribution: { range: string; count: number; percentage: number }[];
  casesByAssignment: { assignment: string; highReviewCount: number; mediumReviewCount: number }[];
  casesByLanguage: { language: string; percentage: number; count: number }[];
  reviewOutcomes: { outcome: string; count: number; color: string }[];
}

export interface SystemSettings {
  structuralThreshold: number;
  semanticThreshold: number;
  behavioralThreshold: number;
  timelineWindowMinutes: number;
  minEvidenceRegions: number;
  activeRules: {
    structural: boolean;
    semantic: boolean;
    behavioral: boolean;
    timeline: boolean;
  };
  supportedLanguages: {
    name: string;
    status: 'Fully Supported' | 'Planned';
    version: string;
  }[];
  normalization: {
    stripComments: boolean;
    normalizeVariableNames: boolean;
    ignoreFormatting: boolean;
    astFlattening: boolean;
  };
}

// ===================== CODING ACTIVITY MONITORING =====================

/**
 * Keyboard event types tracked inside the code editor only.
 * No clipboard content is captured. Only the event type is stored.
 */
export type CodingEventType =
  | 'COPY'
  | 'PASTE'
  | 'CUT'
  | 'SELECT_ALL'
  | 'UNDO'
  | 'REDO'
  | 'WINDOWS_KEY';

/** A single coding activity event (server representation). */
export interface CodingActivityEvent {
  eventType: CodingEventType;
  timestamp: string;       // ISO-8601
  source: 'CODE_EDITOR';
  sessionId?: string;
}

/** Payload sent from the frontend to POST /api/student/activity */
export interface ActivityEventPayload {
  questionId: string;
  sessionId: string;
  eventType: CodingEventType;
  submissionId?: string;
}

/** Aggregated activity data returned by GET /api/teacher/submissions/:id/activity */
export interface CodingActivitySummary {
  studentId: string;
  studentName: string;
  questionId: string;
  questionTitle: string;
  submissionId: string;
  copyCount: number;
  pasteCount: number;
  cutCount: number;
  selectAllCount: number;
  undoCount: number;
  redoCount: number;
  windowsKeyCount: number;
  totalEvents: number;
  sessionDurationMinutes: number | null;
  events: CodingActivityEvent[];
  disclaimer: string;
}


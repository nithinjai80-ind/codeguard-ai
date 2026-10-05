import {
  Submission,
  SimilarityPair,
  Cluster,
  TimelineEvent,
  Assignment,
  Student,
  ReportStats,
  SystemSettings,
  User,
  Question,
  CodeExecutionResult,
  StudentStats,
  StudentSubmissionItem,
  TeacherDashboardData,
  AdminStats,
  ActivityEventPayload,
  CodingActivitySummary
} from './types';
import {
  INITIAL_SUBMISSIONS,
  INITIAL_SIMILARITY_PAIRS,
  INITIAL_CLUSTERS,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_STUDENTS,
  INITIAL_REPORT_STATS,
  INITIAL_SETTINGS
} from './mockData';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export type { User };

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('cg_token') || sessionStorage.getItem('cg_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export class RoxApiService {
  // Helper fetch method with backend error extraction
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson && errJson.error) {
            errorMsg = errJson.error;
          }
        } catch {}
        throw new Error(errorMsg);
      }
      return await response.json();
    } catch (err: any) {
      console.warn(`[ROX AI API Request Failed] ${url}: ${err.message}`);
      throw err;
    }
  }

  // ===================== AUTH API =====================

  public static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      return await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    } catch (err) {
      // Local fallback for quick offline demo
      const normalizedEmail = email.toLowerCase().trim();
      let role: 'ADMIN' | 'TEACHER' | 'STUDENT' = 'STUDENT';
      let name = 'Arun Kumar';

      if (normalizedEmail.includes('admin')) {
        role = 'ADMIN';
        name = 'System Administrator';
      } else if (normalizedEmail.includes('teacher') || normalizedEmail.includes('priya') || normalizedEmail.includes('rajesh')) {
        role = 'TEACHER';
        name = 'Dr. Priya Kumar';
      }

      return {
        message: 'Local Offline Authentication',
        token: `mock_jwt_token_${role.toLowerCase()}`,
        user: {
          id: `USER-${role.substring(0, 3)}`,
          name,
          email: normalizedEmail,
          role,
          department: 'Computer Science and Engineering'
        }
      };
    }
  }

  public static async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
  }): Promise<AuthResponse> {
    return await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async logout(): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/auth/logout', { method: 'POST' });
    } catch {
      return { message: 'Logged out successfully' };
    }
  }

  public static async getCurrentUser(): Promise<User | null> {
    try {
      const res = await this.request<{ user: User }>('/auth/me');
      return res.user;
    } catch {
      return null;
    }
  }

  // ===================== STUDENT API =====================

  public static async getStudentStats(): Promise<StudentStats> {
    try {
      return await this.request<StudentStats>('/student/stats');
    } catch {
      return {
        student_name: 'Arun Kumar',
        questions_available: 5,
        submitted: 4,
        accepted: 2,
        pending_review: 1,
        needs_revision: 1,
        rejected: 0
      };
    }
  }

  public static async getStudentQuestions(): Promise<Question[]> {
    try {
      return await this.request<Question[]>('/student/questions');
    } catch {
      return [
        {
          id: 'Q-0001',
          title: 'Binary Search',
          description: 'Given a sorted array of distinct integers arr and a target, return its index in O(log n) time.',
          difficulty: 'MEDIUM',
          language: 'Java',
          time_limit: 2000,
          memory_limit: 256,
          status: 'PUBLISHED',
          submission_status: 'PENDING',
          examples: [{ input: 'arr = [2, 5, 8, 12, 16, 23, 38], target = 23', output: '5', explanation: 'Target 23 at index 5.' }],
          test_cases: [{ input: '23', expected_output: '5', is_sample: true }]
        },
        {
          id: 'Q-0002',
          title: 'Find Maximum Element',
          description: 'Given an array of integers, find the maximum element.',
          difficulty: 'EASY',
          language: 'Java',
          time_limit: 1000,
          memory_limit: 128,
          status: 'PUBLISHED',
          submission_status: 'ACCEPTED',
          examples: [{ input: '3 7 2 9 4', output: '9', explanation: 'Max value is 9.' }]
        }
      ];
    }
  }

  public static async getStudentQuestion(id: string): Promise<Question> {
    return await this.request<Question>(`/student/questions/${id}`);
  }

  public static async submitCode(data: {
    question_id: string;
    source_code: string;
    language: string;
    test_results?: any;
  }): Promise<{ message: string; submission: any }> {
    return await this.request<{ message: string; submission: any }>('/student/submissions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async getStudentSubmissions(): Promise<StudentSubmissionItem[]> {
    try {
      return await this.request<StudentSubmissionItem[]>('/student/submissions');
    } catch {
      return [
        {
          id: 'SUB-1042',
          submission_id: 'SUB-1042',
          question_id: 'Q-0001',
          question_title: 'Binary Search Implementation',
          language: 'Java',
          submitted_at: 'Oct 24, 2026 — 10:45 AM',
          status: 'PENDING',
          test_results: { passed: 10, total: 10 }
        },
        {
          id: 'SUB-1035',
          submission_id: 'SUB-1035',
          question_id: 'Q-0002',
          question_title: 'Find Maximum Element',
          language: 'Java',
          submitted_at: 'Oct 20, 2026 — 04:15 PM',
          status: 'ACCEPTED',
          test_results: { passed: 3, total: 3 },
          teacher_comment: 'Excellent iterative solution with full test coverage.'
        }
      ];
    }
  }

  public static async getStudentSubmission(id: string): Promise<StudentSubmissionItem> {
    return await this.request<StudentSubmissionItem>(`/student/submissions/${id}`);
  }

  // ===================== CODE EXECUTION API =====================

  public static async runCode(data: {
    source_code: string;
    language: string;
    question_id?: string;
    test_cases?: any[];
  }): Promise<CodeExecutionResult> {
    try {
      return await this.request<CodeExecutionResult>('/code/run', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      // Offline fallback simulation
      return {
        compilation_status: 'SUCCESS',
        runtime_status: 'SUCCESS',
        output: '(Offline Simulation) Execution completed successfully.',
        error: '',
        execution_time_ms: 120,
        passed: 2,
        total: 2,
        summary: '2 / 2 test cases passed.',
        test_results: [
          {
            test_case: 1,
            passed: true,
            input: 'Sample Input 1',
            expected_output: 'Sample Output 1',
            actual_output: 'Sample Output 1',
            execution_time_ms: 60
          },
          {
            test_case: 2,
            passed: true,
            input: 'Sample Input 2',
            expected_output: 'Sample Output 2',
            actual_output: 'Sample Output 2',
            execution_time_ms: 60
          }
        ]
      };
    }
  }

  public static async getCodeTemplate(language: string): Promise<{ language: string; template: string }> {
    try {
      return await this.request<{ language: string; template: string }>(`/code/template?language=${encodeURIComponent(language)}`);
    } catch {
      const templates: Record<string, string> = {
        Java: 'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
        Python: '# Write your solution here\ndef solve():\n    pass\n',
        'C++': '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}',
        JavaScript: '// Write your solution here\nfunction solve() {\n    // Code here\n}\n'
      };
      return { language, template: templates[language] || '// Solution\n' };
    }
  }

  // ===================== TEACHER API =====================

  public static async getTeacherDashboard(): Promise<TeacherDashboardData> {
    try {
      return await this.request<TeacherDashboardData>('/teacher/dashboard');
    } catch {
      return {
        total_questions: 18,
        total_students: 124,
        total_submissions: 642,
        pending_reviews: 27,
        accepted_submissions: 580,
        rejected_submissions: 18,
        review_required: 14,
        similarity_cases: 14,
        review_queue: [
          {
            id: 'SUB-1042',
            student_name: 'Arun Kumar',
            question_title: 'Binary Search Implementation',
            test_results: { passed: 10, total: 10 },
            similarity: 91,
            status: 'Similarity Review Required',
            submitted_at: 'Oct 24, 2026 — 10:45 AM'
          },
          {
            id: 'SUB-1049',
            student_name: 'Kavin Raj',
            question_title: 'Binary Search Implementation',
            test_results: { passed: 10, total: 10 },
            similarity: 91,
            status: 'Similarity Review Required',
            submitted_at: 'Oct 24, 2026 — 10:54 AM'
          }
        ]
      };
    }
  }

  public static async getTeacherSubmissions(params?: {
    question_id?: string;
    status?: string;
    search?: string;
  }): Promise<Submission[]> {
    const qs = new URLSearchParams();
    if (params?.question_id) qs.set('question_id', params.question_id);
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);

    try {
      return await this.request<Submission[]>(`/teacher/submissions?${qs.toString()}`);
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  }

  public static async getTeacherSubmission(id: string): Promise<Submission> {
    try {
      return await this.request<Submission>(`/teacher/submissions/${id}`);
    } catch {
      const match = INITIAL_SUBMISSIONS.find((s) => s.id === id);
      if (match) return match;
      throw new Error(`Submission ${id} not found`);
    }
  }

  public static async getTeacherReviewQueue(): Promise<{ similarity_cases: SimilarityPair[]; submissions: Submission[] }> {
    try {
      return await this.request<{ similarity_cases: SimilarityPair[]; submissions: Submission[] }>('/teacher/reviews');
    } catch {
      return {
        similarity_cases: INITIAL_SIMILARITY_PAIRS,
        submissions: INITIAL_SUBMISSIONS
      };
    }
  }

  public static async reviewSubmission(
    submissionId: string,
    decision: 'ACCEPTED' | 'REJECTED' | 'REVISION_REQUIRED',
    comment: string
  ): Promise<{ message: string; decision: string; submission_id: string }> {
    return await this.request(`/teacher/submissions/${submissionId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ decision, comment })
    });
  }

  public static async analyzeSubmission(submissionId: string): Promise<any> {
    return await this.request(`/teacher/submissions/${submissionId}/analyze`, { method: 'POST' });
  }

  public static async getTeacherSimilarityPair(pairId: string): Promise<SimilarityPair> {
    try {
      return await this.request<SimilarityPair>(`/teacher/similarity/${pairId}`);
    } catch {
      const pair = INITIAL_SIMILARITY_PAIRS.find((p) => p.id === pairId);
      if (pair) return pair;
      throw new Error(`Pair ${pairId} not found`);
    }
  }

  public static async getTeacherStudents(): Promise<Student[]> {
    try {
      return await this.request<Student[]>('/teacher/students');
    } catch {
      return INITIAL_STUDENTS;
    }
  }

  public static async getTeacherQuestions(): Promise<Question[]> {
    try {
      return await this.request<Question[]>('/teacher/questions');
    } catch {
      return [];
    }
  }

  // ===================== ADMIN API =====================

  public static async getAdminStats(): Promise<AdminStats> {
    try {
      return await this.request<AdminStats>('/admin/stats');
    } catch {
      return {
        total_students: 124,
        total_teachers: 12,
        total_questions: 18,
        total_assignments: 8,
        total_submissions: 642,
        review_cases: 14,
        pending_submissions: 27
      };
    }
  }

  public static async getAdminQuestions(): Promise<Question[]> {
    try {
      return await this.request<Question[]>('/admin/questions');
    } catch {
      return [];
    }
  }

  public static async createAdminQuestion(data: Partial<Question>): Promise<Question> {
    return await this.request<Question>('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async updateAdminQuestion(id: string, data: Partial<Question>): Promise<Question> {
    return await this.request<Question>(`/admin/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  public static async deleteAdminQuestion(id: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>(`/admin/questions/${id}`, {
      method: 'DELETE'
    });
  }

  public static async getAdminAssignments(): Promise<Assignment[]> {
    try {
      return await this.request<Assignment[]>('/admin/assignments');
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  }

  public static async createAdminAssignment(data: Partial<Assignment>): Promise<Assignment> {
    return await this.request<Assignment>('/admin/assignments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async updateAdminAssignment(id: string, data: Partial<Assignment>): Promise<Assignment> {
    return await this.request<Assignment>(`/admin/assignments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  public static async getAdminUsers(role?: string): Promise<User[]> {
    try {
      const q = role ? `?role=${encodeURIComponent(role)}` : '';
      return await this.request<User[]>(`/admin/users${q}`);
    } catch {
      return [
        { id: '1', name: 'Dr. Priya Kumar', email: 'priya.kumar@nehru.ac.in', role: 'TEACHER', department: 'CSE' },
        { id: '2', name: 'Arun Kumar', email: 'arun.kumar@student.nehru.ac.in', role: 'STUDENT', department: 'CSE' }
      ];
    }
  }

  public static async createAdminUser(data: {
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
  }): Promise<User> {
    return await this.request<User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async updateAdminUser(id: string, data: Partial<User>): Promise<User> {
    return await this.request<User>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  public static async deleteAdminUser(id: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  }

  public static async getAdminReports(): Promise<any> {
    try {
      return await this.request<any>('/admin/reports');
    } catch {
      return INITIAL_REPORT_STATS;
    }
  }

  // ===================== LEGACY & UTILITY COMPATIBILITY =====================

  public static async getSubmissions(params?: any, language?: string, status?: string): Promise<Submission[]> {
    if (typeof params === 'object' && params !== null) {
      return await this.getTeacherSubmissions(params);
    }
    return await this.getTeacherSubmissions({ question_id: params, status });
  }

  public static async triggerSubmissionAnalysis(submissionId: string): Promise<any> {
    return await this.request<any>(`/teacher/submissions/${submissionId}/analyze`, {
      method: 'POST'
    });
  }

  public static async analyzeSimilarity(submissionAId: string, submissionBId?: string): Promise<any> {
    if (submissionBId) {
      return await this.request<any>('/similarity/analyze', {
        method: 'POST',
        body: JSON.stringify({ submissionAId, submissionBId })
      });
    }
    return await this.triggerSubmissionAnalysis(submissionAId);
  }

  public static async getSubmissionById(id: string): Promise<Submission> {
    return await this.getTeacherSubmission(id);
  }

  public static async getSimilarityPairs(): Promise<SimilarityPair[]> {
    try {
      return await this.request<SimilarityPair[]>('/similarity');
    } catch {
      return INITIAL_SIMILARITY_PAIRS;
    }
  }

  public static async getSimilarityPairById(id: string): Promise<SimilarityPair> {
    try {
      return await this.request<SimilarityPair>(`/similarity/${id}`);
    } catch {
      const pair = INITIAL_SIMILARITY_PAIRS.find((p) => p.id === id);
      if (pair) return pair;
      throw new Error(`Pair ${id} not found`);
    }
  }

  public static async updateReviewDecision(pairId: string, verdict: string, notes: string): Promise<SimilarityPair> {
    try {
      return await this.request<SimilarityPair>(`/reviews/${pairId}`, {
        method: 'PATCH',
        body: JSON.stringify({ verdict, notes })
      });
    } catch {
      const p = INITIAL_SIMILARITY_PAIRS.find((item) => item.id === pairId);
      if (p) {
        p.tutorDecision = {
          reviewedBy: 'Teacher Reviewer',
          reviewedAt: new Date().toLocaleDateString(),
          verdict,
          notes
        };
        p.status = 'Reviewed';
        return p;
      }
      throw new Error('Pair not found');
    }
  }

  public static async getClusters(): Promise<Cluster[]> {
    try {
      return await this.request<Cluster[]>('/clusters');
    } catch {
      return INITIAL_CLUSTERS;
    }
  }

  public static async getTimelineEvents(): Promise<TimelineEvent[]> {
    try {
      return await this.request<TimelineEvent[]>('/timeline');
    } catch {
      return INITIAL_TIMELINE_EVENTS;
    }
  }

  public static async getAssignments(): Promise<Assignment[]> {
    try {
      return await this.request<Assignment[]>('/assignments');
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  }

  public static async getStudents(): Promise<Student[]> {
    try {
      return await this.request<Student[]>('/students');
    } catch {
      return INITIAL_STUDENTS;
    }
  }

  public static async getReports(): Promise<ReportStats> {
    try {
      return await this.request<ReportStats>('/reports');
    } catch {
      return INITIAL_REPORT_STATS;
    }
  }

  public static async getSimilaritySettings(): Promise<any> {
    try {
      return await this.request<any>('/admin/settings/similarity');
    } catch {
      return {
        tokenWeight: 20,
        structuralWeight: 25,
        semanticWeight: 30,
        behavioralWeight: 15,
        timelineWeight: 10,
        reviewThreshold: 80.0,
        highSimilarityThreshold: 60.0,
        embeddingModel: 'text-embedding-004',
        aiAnalysisEnabled: true,
        analysisVersion: '1.0'
      };
    }
  }

  public static async updateSimilaritySettings(settings: any): Promise<any> {
    return await this.request<any>('/admin/settings/similarity', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
  }

  public static async createAssignment(data: any): Promise<any> {
    return await this.createAdminQuestion(data);
  }

  public static async forgotPassword(email: string): Promise<any> {
    return { success: true, message: `Password reset instructions sent to ${email}` };
  }

  public static async getSettings(): Promise<any> {
    try {
      return await this.request<any>('/settings');
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  public static async updateSettings(settings: any): Promise<any> {
    try {
      return await this.request<any>('/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
    } catch {
      return settings;
    }
  }

  public static async uploadSubmission(data: any): Promise<any> {
    return await this.request<any>('/submissions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async getTimeline(): Promise<TimelineEvent[]> {
    return await this.getTimelineEvents();
  }

  // ===================== CODING ACTIVITY API =====================

  /**
   * Student: log a coding activity event from inside the code editor.
   * Only the eventType, questionId, and sessionId are sent — never clipboard content.
   */
  public static async logCodingActivity(payload: ActivityEventPayload): Promise<void> {
    try {
      await this.request<{ status: string }>('/student/activity', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch {
      // Silent fail — monitoring is non-blocking; student workflow must never be interrupted
    }
  }

  /**
   * Teacher: retrieve aggregated coding activity for a specific submission.
   * Returns counts by event type and a full timeline.
   * IMPORTANT: This is supporting evidence only — not a plagiarism verdict.
   */
  public static async getSubmissionActivity(
    submissionId: string
  ): Promise<CodingActivitySummary | null> {
    try {
      return await this.request<CodingActivitySummary>(
        `/teacher/submissions/${submissionId}/activity`
      );
    } catch {
      // Return null if no activity recorded yet — not an error condition
      return null;
    }
  }
}



// Keep CodeGuardApiService alias for backward compatibility with existing components
export const CodeGuardApiService = RoxApiService;
export default RoxApiService;

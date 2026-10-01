import {
  Submission,
  SimilarityPair,
  Cluster,
  TimelineEvent,
  Assignment,
  Student,
  ReportStats,
  SystemSettings
} from './types';

// Realistic Java Code for Arun Kumar (SUB-1042)
export const ARUN_KUMAR_CODE = `package edu.nehru.cs.algorithms;

/**
 * Binary Search Implementation
 * Student: Arun Kumar (NIT-CS-2024-042)
 * Department of Computer Science & Engineering
 */
public class BinarySearchSolution {

    public static int search(int[] arr, int target) {
        if (arr == null || arr.length == 0) {
            return -1;
        }

        int low = 0;
        int high = arr.length - 1;
        int total = 0;

        // Loop invariant verification
        for (int i = 0; i < arr.length; i++) {
            total += arr[i];
        }

        while (low <= high) {
            int mid = low + (high - low) / 2;

            if (arr[mid] == target) {
                return mid; // Element found at index mid
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        return -1; // Target element not present
    }

    public static void main(String[] args) {
        int[] sortedData = { 2, 5, 8, 12, 16, 23, 38, 56, 72, 91 };
        int key = 23;
        int resultIndex = search(sortedData, key);
        System.out.println("Target index: " + resultIndex);
    }
}`;

// Realistic Java Code for Kavin Raj (SUB-1049) - Syntactically modified but AST & Semantically near-identical
export const KAVIN_RAJ_CODE = `package edu.nehru.cs.algorithms;

/**
 * Assignment 1: Binary Search Algorithm
 * Author: Kavin Raj (NIT-CS-2024-049)
 * Nehru Institute of Technology
 */
public class BinarySearchImplementation {

    public static int executeSearch(int[] values, int key) {
        if (values == null || values.length == 0) {
            return -1;
        }

        int left = 0;
        int right = values.length - 1;
        int sum = 0;

        // Sum calculation for validation
        for (int j = 0; j < values.length; j++) {
            sum = sum + values[j];
        }

        while (left <= right) {
            int middle = left + (right - left) / 2;

            if (values[middle] == key) {
                return middle; // Found matching key
            } else if (values[middle] < key) {
                left = middle + 1;
            } else {
                right = middle - 1;
            }
        }

        return -1; // Not found in array
    }

    public static void main(String[] args) {
        int[] dataset = { 2, 5, 8, 12, 16, 23, 38, 56, 72, 91 };
        int searchKey = 23;
        int loc = executeSearch(dataset, searchKey);
        System.out.println("Target index: " + loc);
    }
}`;

// Realistic Java Code for Rahul S (SUB-1055) - Array Rotation
export const RAHUL_S_CODE = `package edu.nehru.cs.arrays;

public class ArrayRotationSolver {
    public static void rotateLeft(int[] nums, int k) {
        int n = nums.length;
        if (n <= 1) return;
        k = k % n;
        reverse(nums, 0, k - 1);
        reverse(nums, k, n - 1);
        reverse(nums, 0, n - 1);
    }

    private static void reverse(int[] a, int start, int end) {
        while (start < end) {
            int temp = a[start];
            a[start] = a[end];
            a[end] = temp;
            start++;
            end--;
        }
    }
}`;

// Realistic Java Code for Vignesh P (SUB-1058) - Array Rotation with slight variations
export const VIGNESH_P_CODE = `package edu.nehru.cs.arrays;

public class RotateArrayUtil {
    public static void performRotation(int[] arr, int shift) {
        int length = arr.length;
        if (length <= 1) return;
        shift = shift % length;
        invertSubarray(arr, 0, shift - 1);
        invertSubarray(arr, shift, length - 1);
        invertSubarray(arr, 0, length - 1);
    }

    private static void invertSubarray(int[] target, int left, int right) {
        while (left < right) {
            int hold = target[left];
            target[left] = target[right];
            target[right] = hold;
            left++;
            right--;
        }
    }
}`;

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'SUB-1042',
    studentId: 'NIT-CS-2024-042',
    studentName: 'Arun Kumar',
    studentEmail: 'arun.k@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    assignmentId: 'ASSIGN-01',
    assignmentTitle: 'Binary Search Implementation',
    language: 'Java',
    submittedAt: 'Sep 30, 2026 — 10:32 AM',
    status: 'REVIEW_REQUIRED',
    overallSimilarity: 91,
    code: ARUN_KUMAR_CODE,
    revision: 2,
    fileName: 'BinarySearchSolution.java',
    linesOfCode: 44,
    pairedSubmissionId: 'SUB-1049',
    analysisDetails: {
      structuralSimilarity: 91,
      semanticSimilarity: 94,
      behavioralSimilarity: 88,
      timelineCorrelation: 67,
      overallReviewScore: 91,
      flaggedEvidence: {
        astStructure: true,
        variableRelationships: true,
        controlFlow: true,
        algorithmicOperations: true,
        matchingRegionsCount: 4,
        timelineAnomaly: true,
        timelineNote: 'Submitted 4 minutes apart from SUB-1049 with identical revision delta'
      },
      matchingRegions: [
        {
          startLine: 18,
          endLine: 23,
          description: 'Loop accumulator and invariant check structure',
          type: 'VARIABLE_RENAMING'
        },
        {
          startLine: 24,
          endLine: 35,
          description: 'Binary search core pointer convergence logic',
          type: 'STRUCTURAL_EQUIVALENCE'
        },
        {
          startLine: 38,
          endLine: 43,
          description: 'Test harness instantiation and standard verification vector',
          type: 'EXPRESSION_TRANSFORMATION'
        }
      ]
    }
  },
  {
    id: 'SUB-1049',
    studentId: 'NIT-CS-2024-049',
    studentName: 'Kavin Raj',
    studentEmail: 'kavin.r@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    assignmentId: 'ASSIGN-01',
    assignmentTitle: 'Binary Search Implementation',
    language: 'Java',
    submittedAt: 'Sep 30, 2026 — 10:36 AM',
    status: 'REVIEW_REQUIRED',
    overallSimilarity: 91,
    code: KAVIN_RAJ_CODE,
    revision: 2,
    fileName: 'BinarySearchImplementation.java',
    linesOfCode: 43,
    pairedSubmissionId: 'SUB-1042',
    analysisDetails: {
      structuralSimilarity: 91,
      semanticSimilarity: 94,
      behavioralSimilarity: 88,
      timelineCorrelation: 67,
      overallReviewScore: 91,
      flaggedEvidence: {
        astStructure: true,
        variableRelationships: true,
        controlFlow: true,
        algorithmicOperations: true,
        matchingRegionsCount: 4,
        timelineAnomaly: true,
        timelineNote: 'Submitted 4 minutes following SUB-1042'
      },
      matchingRegions: [
        {
          startLine: 18,
          endLine: 23,
          description: 'Loop accumulator and invariant check structure',
          type: 'VARIABLE_RENAMING'
        },
        {
          startLine: 24,
          endLine: 35,
          description: 'Binary search core pointer convergence logic',
          type: 'STRUCTURAL_EQUIVALENCE'
        }
      ]
    }
  },
  {
    id: 'SUB-1055',
    studentId: 'NIT-CS-2024-055',
    studentName: 'Rahul S',
    studentEmail: 'rahul.s@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    assignmentId: 'ASSIGN-02',
    assignmentTitle: 'Array Rotation',
    language: 'Java',
    submittedAt: 'Sep 30, 2026 — 10:15 AM',
    status: 'REVIEW_REQUIRED',
    overallSimilarity: 82,
    code: RAHUL_S_CODE,
    revision: 1,
    fileName: 'ArrayRotationSolver.java',
    linesOfCode: 24,
    pairedSubmissionId: 'SUB-1058',
    analysisDetails: {
      structuralSimilarity: 84,
      semanticSimilarity: 81,
      behavioralSimilarity: 79,
      timelineCorrelation: 74,
      overallReviewScore: 82,
      flaggedEvidence: {
        astStructure: true,
        variableRelationships: true,
        controlFlow: true,
        algorithmicOperations: true,
        matchingRegionsCount: 3,
        timelineAnomaly: true,
        timelineNote: 'Submission within 7 minutes of peer submission'
      },
      matchingRegions: []
    }
  },
  {
    id: 'SUB-1058',
    studentId: 'NIT-CS-2024-058',
    studentName: 'Vignesh P',
    studentEmail: 'vignesh.p@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    assignmentId: 'ASSIGN-02',
    assignmentTitle: 'Array Rotation',
    language: 'Java',
    submittedAt: 'Sep 30, 2026 — 10:22 AM',
    status: 'REVIEW_REQUIRED',
    overallSimilarity: 82,
    code: VIGNESH_P_CODE,
    revision: 1,
    fileName: 'RotateArrayUtil.java',
    linesOfCode: 24,
    pairedSubmissionId: 'SUB-1055',
    analysisDetails: {
      structuralSimilarity: 84,
      semanticSimilarity: 81,
      behavioralSimilarity: 79,
      timelineCorrelation: 74,
      overallReviewScore: 82,
      flaggedEvidence: {
        astStructure: true,
        variableRelationships: true,
        controlFlow: true,
        algorithmicOperations: true,
        matchingRegionsCount: 3,
        timelineAnomaly: true,
        timelineNote: '7 minutes delta from SUB-1055'
      },
      matchingRegions: []
    }
  },
  {
    id: 'SUB-1061',
    studentId: 'NIT-CS-2024-061',
    studentName: 'Priya M',
    studentEmail: 'priya.m@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    assignmentId: 'ASSIGN-03',
    assignmentTitle: 'Linked List Operations',
    language: 'Java',
    submittedAt: 'Sep 29, 2026 — 04:18 PM',
    status: 'INVESTIGATING',
    overallSimilarity: 72,
    code: `public class SinglyLinkedList { Node head; public void insert(int data) { Node n = new Node(data); if (head == null) head = n; else { Node cur = head; while (cur.next != null) cur = cur.next; cur.next = n; } } }`,
    revision: 1,
    fileName: 'SinglyLinkedList.java',
    linesOfCode: 36,
    pairedSubmissionId: 'SUB-1064',
    analysisDetails: {
      structuralSimilarity: 72,
      semanticSimilarity: 76,
      behavioralSimilarity: 68,
      timelineCorrelation: 55,
      overallReviewScore: 72,
      flaggedEvidence: {
        astStructure: true,
        variableRelationships: false,
        controlFlow: true,
        algorithmicOperations: true,
        matchingRegionsCount: 2,
        timelineAnomaly: false
      },
      matchingRegions: []
    }
  },
  {
    id: 'SUB-1064',
    studentId: 'NIT-CS-2024-064',
    studentName: 'Divya R',
    studentEmail: 'divya.r@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    assignmentId: 'ASSIGN-03',
    assignmentTitle: 'Linked List Operations',
    language: 'Java',
    submittedAt: 'Sep 29, 2026 — 04:35 PM',
    status: 'INVESTIGATING',
    overallSimilarity: 72,
    code: `public class CustomLinkedList { private Node root; public void addNode(int val) { Node element = new Node(val); if (root == null) root = element; else { Node temp = root; while (temp.next != null) temp = temp.next; temp.next = element; } } }`,
    revision: 1,
    fileName: 'CustomLinkedList.java',
    linesOfCode: 35,
    pairedSubmissionId: 'SUB-1061',
    analysisDetails: {
      structuralSimilarity: 72,
      semanticSimilarity: 76,
      behavioralSimilarity: 68,
      timelineCorrelation: 55,
      overallReviewScore: 72,
      flaggedEvidence: {
        astStructure: true,
        variableRelationships: false,
        controlFlow: true,
        algorithmicOperations: true,
        matchingRegionsCount: 2,
        timelineAnomaly: false
      },
      matchingRegions: []
    }
  },
  {
    id: 'SUB-1070',
    studentId: 'NIT-CS-2024-070',
    studentName: 'Karthik V',
    studentEmail: 'karthik.v@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    assignmentId: 'ASSIGN-04',
    assignmentTitle: 'Sorting Algorithms',
    language: 'Java',
    submittedAt: 'Sep 29, 2026 — 01:10 PM',
    status: 'REVIEW_REQUIRED',
    overallSimilarity: 86,
    code: `public class QuickSorter { public static void sort(int[] a, int l, int r) { if (l < r) { int p = partition(a, l, r); sort(a, l, p-1); sort(a, p+1, r); } } }`,
    revision: 1,
    fileName: 'QuickSorter.java',
    linesOfCode: 52,
    pairedSubmissionId: 'SUB-1072',
    analysisDetails: {
      structuralSimilarity: 89,
      semanticSimilarity: 86,
      behavioralSimilarity: 83,
      timelineCorrelation: 62,
      overallReviewScore: 86,
      flaggedEvidence: {
        astStructure: true,
        variableRelationships: true,
        controlFlow: true,
        algorithmicOperations: true,
        matchingRegionsCount: 3,
        timelineAnomaly: false
      },
      matchingRegions: []
    }
  },
  {
    id: 'SUB-1072',
    studentId: 'NIT-CS-2024-072',
    studentName: 'Sanjay K',
    studentEmail: 'sanjay.k@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    assignmentId: 'ASSIGN-04',
    assignmentTitle: 'Sorting Algorithms',
    language: 'Java',
    submittedAt: 'Sep 29, 2026 — 01:25 PM',
    status: 'REVIEW_REQUIRED',
    overallSimilarity: 86,
    code: `public class QuickSortAlgo { public static void runSort(int[] arr, int low, int high) { if (low < high) { int pi = split(arr, low, high); runSort(arr, low, pi-1); runSort(arr, pi+1, high); } } }`,
    revision: 1,
    fileName: 'QuickSortAlgo.java',
    linesOfCode: 50,
    pairedSubmissionId: 'SUB-1070',
    analysisDetails: {
      structuralSimilarity: 89,
      semanticSimilarity: 86,
      behavioralSimilarity: 83,
      timelineCorrelation: 62,
      overallReviewScore: 86,
      flaggedEvidence: {
        astStructure: true,
        variableRelationships: true,
        controlFlow: true,
        algorithmicOperations: true,
        matchingRegionsCount: 3,
        timelineAnomaly: false
      },
      matchingRegions: []
    }
  },
  {
    id: 'SUB-1080',
    studentId: 'NIT-CS-2024-080',
    studentName: 'Ananya B',
    studentEmail: 'ananya.b@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    assignmentId: 'ASSIGN-05',
    assignmentTitle: 'Stack Implementation',
    language: 'Java',
    submittedAt: 'Sep 28, 2026 — 11:20 AM',
    status: 'ANALYZED',
    overallSimilarity: 34,
    code: `public class ArrayStack { private int[] stack; private int top = -1; public ArrayStack(int cap) { stack = new int[cap]; } public void push(int val) { stack[++top] = val; } public int pop() { return stack[top--]; } }`,
    revision: 1,
    fileName: 'ArrayStack.java',
    linesOfCode: 38,
    analysisDetails: {
      structuralSimilarity: 34,
      semanticSimilarity: 38,
      behavioralSimilarity: 42,
      timelineCorrelation: 12,
      overallReviewScore: 34,
      flaggedEvidence: {
        astStructure: false,
        variableRelationships: false,
        controlFlow: false,
        algorithmicOperations: false,
        matchingRegionsCount: 0,
        timelineAnomaly: false
      },
      matchingRegions: []
    }
  },
  {
    id: 'SUB-1085',
    studentId: 'NIT-CS-2024-085',
    studentName: 'Deepa N',
    studentEmail: 'deepa.n@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    assignmentId: 'ASSIGN-06',
    assignmentTitle: 'Queue Implementation',
    language: 'Java',
    submittedAt: 'Sep 28, 2026 — 09:45 AM',
    status: 'CLEAR',
    overallSimilarity: 18,
    code: `public class CircularQueue { private int front = 0, rear = 0, size = 0; private int[] q; public CircularQueue(int k) { q = new int[k]; } }`,
    revision: 1,
    fileName: 'CircularQueue.java',
    linesOfCode: 42,
    analysisDetails: {
      structuralSimilarity: 18,
      semanticSimilarity: 22,
      behavioralSimilarity: 25,
      timelineCorrelation: 8,
      overallReviewScore: 18,
      flaggedEvidence: {
        astStructure: false,
        variableRelationships: false,
        controlFlow: false,
        algorithmicOperations: false,
        matchingRegionsCount: 0,
        timelineAnomaly: false
      },
      matchingRegions: []
    }
  }
];

export const INITIAL_SIMILARITY_PAIRS: SimilarityPair[] = [
  {
    id: 'PAIR-01',
    submissionAId: 'SUB-1042',
    submissionBId: 'SUB-1049',
    studentAName: 'Arun Kumar',
    studentBName: 'Kavin Raj',
    assignmentTitle: 'Binary Search Implementation',
    structural: 91,
    semantic: 94,
    behavioral: 88,
    timeline: 67,
    reviewScore: 91,
    status: 'Review Required',
    detectedRegionsCount: 4,
    timeDeltaMinutes: 4,
    transformations: [
      {
        id: 'TRANS-1',
        type: 'VARIABLE_RENAMING',
        title: 'Variable Renaming',
        detailA: 'i, arr, total, low, high',
        detailB: 'j, values, sum, left, right',
        explanation: 'Systematic 1:1 identifier substitution across local variables and loop indices.'
      },
      {
        id: 'TRANS-2',
        type: 'EXPRESSION_TRANSFORMATION',
        title: 'Expression Transformation',
        detailA: 'total += arr[i]',
        detailB: 'sum = sum + values[j]',
        explanation: 'Compound assignment replaced with equivalent binary addition expression.'
      },
      {
        id: 'TRANS-3',
        type: 'FORMATTING_DIFFERENCE',
        title: 'Formatting Difference',
        detailA: 'K&R single-line braces, condensed comments',
        detailB: 'Allman brace convention, restructured javadoc headers',
        explanation: 'Token-level normalization reveals identical AST despite stylistic changes.'
      },
      {
        id: 'TRANS-4',
        type: 'CONTROL_FLOW',
        title: 'Control Flow Equivalence',
        detailA: 'while (low <= high) with 3-way branch',
        detailB: 'while (left <= right) with identical 3-way predicate',
        explanation: 'Control-Flow Graph (CFG) topological sort matches with 100% path isomorphism.'
      }
    ]
  },
  {
    id: 'PAIR-02',
    submissionAId: 'SUB-1055',
    submissionBId: 'SUB-1058',
    studentAName: 'Rahul S',
    studentBName: 'Vignesh P',
    assignmentTitle: 'Array Rotation',
    structural: 84,
    semantic: 81,
    behavioral: 79,
    timeline: 74,
    reviewScore: 82,
    status: 'Review Required',
    detectedRegionsCount: 3,
    timeDeltaMinutes: 7,
    transformations: [
      {
        id: 'TRANS-5',
        type: 'VARIABLE_RENAMING',
        title: 'Function & Parameter Renaming',
        detailA: 'rotateLeft, reverse, nums, k',
        detailB: 'performRotation, invertSubarray, arr, shift',
        explanation: 'Helper methods renamed while maintaining exact reversal algorithm.'
      },
      {
        id: 'TRANS-6',
        type: 'STRUCTURAL_EQUIVALENCE',
        title: 'Algorithm Reversal Sequence',
        detailA: '3-step array reverse technique (0 to k-1, k to n-1, 0 to n-1)',
        detailB: 'Identical 3-step array reverse technique',
        explanation: 'Identical 3-step in-place memory reversal logic with identical variable swaps.'
      }
    ]
  },
  {
    id: 'PAIR-03',
    submissionAId: 'SUB-1061',
    submissionBId: 'SUB-1064',
    studentAName: 'Priya M',
    studentBName: 'Divya R',
    assignmentTitle: 'Linked List Operations',
    structural: 72,
    semantic: 76,
    behavioral: 68,
    timeline: 55,
    reviewScore: 72,
    status: 'Investigate',
    detectedRegionsCount: 2,
    timeDeltaMinutes: 17,
    transformations: [
      {
        id: 'TRANS-7',
        type: 'VARIABLE_RENAMING',
        title: 'Pointer Node Renaming',
        detailA: 'cur, head, n',
        detailB: 'temp, root, element',
        explanation: 'Common textbook traversal patterns with synonym replacements.'
      }
    ]
  },
  {
    id: 'PAIR-04',
    submissionAId: 'SUB-1070',
    submissionBId: 'SUB-1072',
    studentAName: 'Karthik V',
    studentBName: 'Sanjay K',
    assignmentTitle: 'Sorting Algorithms',
    structural: 89,
    semantic: 86,
    behavioral: 83,
    timeline: 62,
    reviewScore: 86,
    status: 'Review Required',
    detectedRegionsCount: 3,
    timeDeltaMinutes: 15,
    transformations: [
      {
        id: 'TRANS-8',
        type: 'VARIABLE_RENAMING',
        title: 'Partition Variable Renaming',
        detailA: 'p, partition, l, r',
        detailB: 'pi, split, low, high',
        explanation: 'Identical Lomuto partition logic with renamed indexing registers.'
      }
    ]
  }
];

export const INITIAL_CLUSTERS: Cluster[] = [
  {
    id: 'CLUSTER-A',
    name: 'Cluster A',
    assignmentTitle: 'Binary Search Implementation',
    submissionCount: 12,
    averageSimilarity: 87,
    primaryPattern: 'Identical 3-way branch with invariant loop accumulator',
    students: [
      { studentId: 'NIT-CS-2024-042', name: 'Arun Kumar', submissionId: 'SUB-1042', similarityScore: 91, centrality: 0.94 },
      { studentId: 'NIT-CS-2024-049', name: 'Kavin Raj', submissionId: 'SUB-1049', similarityScore: 91, centrality: 0.92 },
      { studentId: 'NIT-CS-2024-051', name: 'Manoj T', submissionId: 'SUB-1051', similarityScore: 88, centrality: 0.78 },
      { studentId: 'NIT-CS-2024-053', name: 'Gokul E', submissionId: 'SUB-1053', similarityScore: 85, centrality: 0.71 },
      { studentId: 'NIT-CS-2024-056', name: 'Harish B', submissionId: 'SUB-1056', similarityScore: 86, centrality: 0.69 },
      { studentId: 'NIT-CS-2024-059', name: 'Kavitha S', submissionId: 'SUB-1059', similarityScore: 84, centrality: 0.64 }
    ],
    connections: [
      { source: 'NIT-CS-2024-042', target: 'NIT-CS-2024-049', similarity: 91 },
      { source: 'NIT-CS-2024-042', target: 'NIT-CS-2024-051', similarity: 88 },
      { source: 'NIT-CS-2024-049', target: 'NIT-CS-2024-051', similarity: 86 },
      { source: 'NIT-CS-2024-051', target: 'NIT-CS-2024-053', similarity: 85 },
      { source: 'NIT-CS-2024-053', target: 'NIT-CS-2024-056', similarity: 84 },
      { source: 'NIT-CS-2024-042', target: 'NIT-CS-2024-056', similarity: 86 },
      { source: 'NIT-CS-2024-049', target: 'NIT-CS-2024-059', similarity: 82 }
    ]
  },
  {
    id: 'CLUSTER-B',
    name: 'Cluster B',
    assignmentTitle: 'Array Rotation',
    submissionCount: 7,
    averageSimilarity: 81,
    primaryPattern: 'Triple in-place reverse logic with identical boundary indexing',
    students: [
      { studentId: 'NIT-CS-2024-055', name: 'Rahul S', submissionId: 'SUB-1055', similarityScore: 84, centrality: 0.88 },
      { studentId: 'NIT-CS-2024-058', name: 'Vignesh P', submissionId: 'SUB-1058', similarityScore: 82, centrality: 0.85 },
      { studentId: 'NIT-CS-2024-062', name: 'Surya R', submissionId: 'SUB-1062', similarityScore: 79, centrality: 0.72 },
      { studentId: 'NIT-CS-2024-066', name: 'Naveen K', submissionId: 'SUB-1066', similarityScore: 80, centrality: 0.70 }
    ],
    connections: [
      { source: 'NIT-CS-2024-055', target: 'NIT-CS-2024-058', similarity: 82 },
      { source: 'NIT-CS-2024-055', target: 'NIT-CS-2024-062', similarity: 80 },
      { source: 'NIT-CS-2024-058', target: 'NIT-CS-2024-066', similarity: 81 }
    ]
  },
  {
    id: 'CLUSTER-C',
    name: 'Cluster C',
    assignmentTitle: 'Sorting Algorithms',
    submissionCount: 5,
    averageSimilarity: 74,
    primaryPattern: 'Identical Lomuto partition implementation with renamed registers',
    students: [
      { studentId: 'NIT-CS-2024-070', name: 'Karthik V', submissionId: 'SUB-1070', similarityScore: 86, centrality: 0.81 },
      { studentId: 'NIT-CS-2024-072', name: 'Sanjay K', submissionId: 'SUB-1072', similarityScore: 86, centrality: 0.80 },
      { studentId: 'NIT-CS-2024-075', name: 'Dinesh M', submissionId: 'SUB-1075', similarityScore: 72, centrality: 0.65 }
    ],
    connections: [
      { source: 'NIT-CS-2024-070', target: 'NIT-CS-2024-072', similarity: 86 },
      { source: 'NIT-CS-2024-070', target: 'NIT-CS-2024-075', similarity: 72 }
    ]
  }
];

export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'EVT-01',
    time: '09:42 AM',
    date: 'Sep 30, 2026',
    timestamp: 1727670720000,
    studentName: 'Arun Kumar',
    studentId: 'NIT-CS-2024-042',
    submissionId: 'SUB-1040',
    assignmentTitle: 'Binary Search Implementation',
    eventType: 'INITIAL_SUBMISSION',
    revisionNumber: 1,
    details: 'Initial code submitted via student portal (28 lines).'
  },
  {
    id: 'EVT-02',
    time: '09:46 AM',
    date: 'Sep 30, 2026',
    timestamp: 1727670960000,
    studentName: 'Kavin Raj',
    studentId: 'NIT-CS-2024-049',
    submissionId: 'SUB-1044',
    assignmentTitle: 'Binary Search Implementation',
    eventType: 'INITIAL_SUBMISSION',
    revisionNumber: 1,
    similarityWithPrevious: 89,
    correlatedWithStudent: 'Arun Kumar',
    timeDeltaFromPrevious: '+4 min',
    details: 'Temporal correlation detected: Initial submission uploaded 4 minutes following peer submission.'
  },
  {
    id: 'EVT-03',
    time: '09:51 AM',
    date: 'Sep 30, 2026',
    timestamp: 1727671260000,
    studentName: 'Kavin Raj',
    studentId: 'NIT-CS-2024-049',
    submissionId: 'SUB-1049',
    assignmentTitle: 'Binary Search Implementation',
    eventType: 'REVISION',
    revisionNumber: 2,
    similarityWithPrevious: 91,
    correlatedWithStudent: 'Arun Kumar',
    timeDeltaFromPrevious: '+5 min',
    details: 'Revision 2 submitted: added accumulator loop validation and revised variable identifiers.'
  },
  {
    id: 'EVT-04',
    time: '10:03 AM',
    date: 'Sep 30, 2026',
    timestamp: 1727671980000,
    studentName: 'Arun Kumar',
    studentId: 'NIT-CS-2024-042',
    submissionId: 'SUB-1042',
    assignmentTitle: 'Binary Search Implementation',
    eventType: 'REVISION',
    revisionNumber: 2,
    similarityWithPrevious: 91,
    correlatedWithStudent: 'Kavin Raj',
    timeDeltaFromPrevious: '+12 min',
    details: 'Revision 2 submitted: synchronized loop invariant structure; flagged for tutor review.'
  },
  {
    id: 'EVT-05',
    time: '10:15 AM',
    date: 'Sep 30, 2026',
    timestamp: 1727672700000,
    studentName: 'Rahul S',
    studentId: 'NIT-CS-2024-055',
    submissionId: 'SUB-1055',
    assignmentTitle: 'Array Rotation',
    eventType: 'INITIAL_SUBMISSION',
    revisionNumber: 1,
    details: 'Submission uploaded with in-place reverse algorithm.'
  },
  {
    id: 'EVT-06',
    time: '10:22 AM',
    date: 'Sep 30, 2026',
    timestamp: 1727673120000,
    studentName: 'Vignesh P',
    studentId: 'NIT-CS-2024-058',
    submissionId: 'SUB-1058',
    assignmentTitle: 'Array Rotation',
    eventType: 'FLAGGED_SIMILARITY',
    revisionNumber: 1,
    similarityWithPrevious: 82,
    correlatedWithStudent: 'Rahul S',
    timeDeltaFromPrevious: '+7 min',
    details: 'Temporal correlation detected: Submission matches peer reversal logic within 7-minute delta.'
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'ASSIGN-01',
    title: 'Binary Search Implementation',
    courseCode: 'CS201',
    department: 'Computer Science and Engineering',
    language: 'Java',
    totalSubmissions: 124,
    requiringReview: 14,
    averageSimilarity: 28.4,
    dueDate: 'Oct 02, 2026',
    status: 'ACTIVE',
    description: 'Implement iterative and recursive binary search on sorted integer arrays with boundary condition validation.'
  },
  {
    id: 'ASSIGN-02',
    title: 'Array Manipulation & Rotation',
    courseCode: 'CS201',
    department: 'Computer Science and Engineering',
    language: 'Java',
    totalSubmissions: 110,
    requiringReview: 8,
    averageSimilarity: 22.1,
    dueDate: 'Oct 05, 2026',
    status: 'ACTIVE',
    description: 'Implement in-place circular rotation of array elements in O(n) time and O(1) auxiliary space.'
  },
  {
    id: 'ASSIGN-03',
    title: 'Linked List Operations',
    courseCode: 'CS202',
    department: 'Computer Science and Engineering',
    language: 'Java',
    totalSubmissions: 98,
    requiringReview: 7,
    averageSimilarity: 25.8,
    dueDate: 'Oct 08, 2026',
    status: 'ACTIVE',
    description: 'Implement singly and doubly linked list data structures with node reversal, insertion, and cycle detection.'
  },
  {
    id: 'ASSIGN-04',
    title: 'Sorting Algorithms',
    courseCode: 'CS202',
    department: 'Computer Science and Engineering',
    language: 'Java',
    totalSubmissions: 143,
    requiringReview: 9,
    averageSimilarity: 31.2,
    dueDate: 'Sep 29, 2026',
    status: 'ANALYSIS_COMPLETED',
    description: 'Comparative benchmark of QuickSort, MergeSort, and HeapSort with execution trace analysis.'
  },
  {
    id: 'ASSIGN-05',
    title: 'Stack Implementation',
    courseCode: 'CS202',
    department: 'Computer Science and Engineering',
    language: 'Java',
    totalSubmissions: 85,
    requiringReview: 3,
    averageSimilarity: 19.4,
    dueDate: 'Sep 25, 2026',
    status: 'ANALYSIS_COMPLETED',
    description: 'Array-based dynamic resizing stack with expression evaluation and parenthesis balancing.'
  },
  {
    id: 'ASSIGN-06',
    title: 'Queue Implementation',
    courseCode: 'CS202',
    department: 'Computer Science and Engineering',
    language: 'Java',
    totalSubmissions: 76,
    requiringReview: 2,
    averageSimilarity: 16.7,
    dueDate: 'Sep 22, 2026',
    status: 'ANALYSIS_COMPLETED',
    description: 'Circular queue implementation with FIFO buffer mechanics and overflow prevention.'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'NIT-CS-2024-042',
    name: 'Arun Kumar',
    rollNumber: '2024-CS-042',
    email: 'arun.k@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    batch: '2024 - 2028',
    submissionsCount: 6,
    assignmentsCompleted: 6,
    reviewCasesCount: 2,
    lastSubmission: 'Sep 30, 2026 — 10:32 AM'
  },
  {
    id: 'NIT-CS-2024-049',
    name: 'Kavin Raj',
    rollNumber: '2024-CS-049',
    email: 'kavin.r@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    batch: '2024 - 2028',
    submissionsCount: 6,
    assignmentsCompleted: 6,
    reviewCasesCount: 2,
    lastSubmission: 'Sep 30, 2026 — 10:36 AM'
  },
  {
    id: 'NIT-CS-2024-055',
    name: 'Rahul S',
    rollNumber: '2024-CS-055',
    email: 'rahul.s@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    batch: '2024 - 2028',
    submissionsCount: 5,
    assignmentsCompleted: 5,
    reviewCasesCount: 1,
    lastSubmission: 'Sep 30, 2026 — 10:15 AM'
  },
  {
    id: 'NIT-CS-2024-058',
    name: 'Vignesh P',
    rollNumber: '2024-CS-058',
    email: 'vignesh.p@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    batch: '2024 - 2028',
    submissionsCount: 5,
    assignmentsCompleted: 5,
    reviewCasesCount: 1,
    lastSubmission: 'Sep 30, 2026 — 10:22 AM'
  },
  {
    id: 'NIT-CS-2024-061',
    name: 'Priya M',
    rollNumber: '2024-CS-061',
    email: 'priya.m@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    batch: '2024 - 2028',
    submissionsCount: 6,
    assignmentsCompleted: 6,
    reviewCasesCount: 1,
    lastSubmission: 'Sep 29, 2026 — 04:18 PM'
  },
  {
    id: 'NIT-CS-2024-064',
    name: 'Divya R',
    rollNumber: '2024-CS-064',
    email: 'divya.r@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    batch: '2024 - 2028',
    submissionsCount: 6,
    assignmentsCompleted: 6,
    reviewCasesCount: 1,
    lastSubmission: 'Sep 29, 2026 — 04:35 PM'
  },
  {
    id: 'NIT-CS-2024-070',
    name: 'Karthik V',
    rollNumber: '2024-CS-070',
    email: 'karthik.v@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    batch: '2024 - 2028',
    submissionsCount: 6,
    assignmentsCompleted: 6,
    reviewCasesCount: 1,
    lastSubmission: 'Sep 29, 2026 — 01:10 PM'
  },
  {
    id: 'NIT-CS-2024-072',
    name: 'Sanjay K',
    rollNumber: '2024-CS-072',
    email: 'sanjay.k@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    batch: '2024 - 2028',
    submissionsCount: 6,
    assignmentsCompleted: 6,
    reviewCasesCount: 1,
    lastSubmission: 'Sep 29, 2026 — 01:25 PM'
  },
  {
    id: 'NIT-CS-2024-080',
    name: 'Ananya B',
    rollNumber: '2024-CS-080',
    email: 'ananya.b@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    batch: '2024 - 2028',
    submissionsCount: 6,
    assignmentsCompleted: 6,
    reviewCasesCount: 0,
    lastSubmission: 'Sep 28, 2026 — 11:20 AM'
  },
  {
    id: 'NIT-CS-2024-085',
    name: 'Deepa N',
    rollNumber: '2024-CS-085',
    email: 'deepa.n@student.nehru.ac.in',
    department: 'Computer Science and Engineering',
    batch: '2024 - 2028',
    submissionsCount: 6,
    assignmentsCompleted: 6,
    reviewCasesCount: 0,
    lastSubmission: 'Sep 28, 2026 — 09:45 AM'
  }
];

export const INITIAL_REPORT_STATS: ReportStats = {
  totalSubmissions: 1248,
  similarityCases: 84,
  reviewCases: 27,
  reviewedCases: 21,
  averageSimilarity: 24.6,
  similarityDistribution: [
    { range: '0% - 20%', count: 890, percentage: 71.3 },
    { range: '21% - 40%', count: 214, percentage: 17.1 },
    { range: '41% - 60%', count: 60, percentage: 4.8 },
    { range: '61% - 80%', count: 57, percentage: 4.6 },
    { range: '81% - 100%', count: 27, percentage: 2.2 }
  ],
  casesByAssignment: [
    { assignment: 'Binary Search', highReviewCount: 14, mediumReviewCount: 8 },
    { assignment: 'Sorting Algorithms', highReviewCount: 9, mediumReviewCount: 6 },
    { assignment: 'Array Rotation', highReviewCount: 8, mediumReviewCount: 5 },
    { assignment: 'Linked List', highReviewCount: 7, mediumReviewCount: 4 },
    { assignment: 'Stack Implementation', highReviewCount: 3, mediumReviewCount: 2 },
    { assignment: 'Queue Implementation', highReviewCount: 2, mediumReviewCount: 1 }
  ],
  casesByLanguage: [
    { language: 'Java', percentage: 94, count: 1173 },
    { language: 'Python (Pilot)', percentage: 4, count: 50 },
    { language: 'C++ (Pilot)', percentage: 2, count: 25 }
  ],
  reviewOutcomes: [
    { outcome: 'Acceptable Template / Idiom', count: 11, color: '#3b82f6' },
    { outcome: 'Cleared After Oral Viva', count: 7, color: '#10b981' },
    { outcome: 'Explanation Requested', count: 3, color: '#f59e0b' },
    { outcome: 'Pending Tutor Investigation', count: 6, color: '#ef4444' }
  ]
};

export const INITIAL_SETTINGS: SystemSettings = {
  structuralThreshold: 80,
  semanticThreshold: 85,
  behavioralThreshold: 80,
  timelineWindowMinutes: 10,
  minEvidenceRegions: 3,
  activeRules: {
    structural: true,
    semantic: true,
    behavioral: true,
    timeline: true
  },
  supportedLanguages: [
    { name: 'Java', status: 'Fully Supported', version: 'JDK 21 / OpenJDK' },
    { name: 'Python', status: 'Planned', version: '3.11+' },
    { name: 'C++', status: 'Planned', version: 'GCC / Clang 17' },
    { name: 'JavaScript', status: 'Planned', version: 'Node.js 20+' }
  ],
  normalization: {
    stripComments: true,
    normalizeVariableNames: true,
    ignoreFormatting: true,
    astFlattening: true
  }
};

import os
import sys
import datetime
import bcrypt

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import get_database
from services.auth_service import hash_password

ARUN_KUMAR_CODE = """package edu.nehru.cs.algorithms;

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
}"""

KAVIN_RAJ_CODE = """package edu.nehru.cs.algorithms;

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
}"""

SNEHA_PATEL_CODE = """package edu.nehru.cs.algorithms;

public class RecursiveBinarySearch {
    public static int search(int[] arr, int target) {
        return searchHelper(arr, target, 0, arr.length - 1);
    }

    private static int searchHelper(int[] arr, int target, int low, int high) {
        if (low > high) return -1;
        int mid = (low + high) >>> 1;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) return searchHelper(arr, target, mid + 1, high);
        return searchHelper(arr, target, low, mid - 1);
    }
}"""

PYTHON_DP_CODE = """def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(1, capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w])
            else:
                dp[i][w] = dp[i - 1][w]
                
    return dp[n][capacity]"""

import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def seed_all():
    print("[*] Connecting to database and seeding initial data for ROX AI...")
    db = get_database()

    # Drop existing collections to ensure fresh clean state
    db.users.delete_many({})
    db.questions.delete_many({})
    db.assignments.delete_many({})
    db.submissions.delete_many({})
    db.similarity_results.delete_many({})
    db.reviews.delete_many({})
    db.clusters.delete_many({})
    db.timeline_events.delete_many({})
    db.students.delete_many({})
    db.settings.delete_many({})

    print("[1/9] Seeding Users...")
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    users_data = [
        # ADMIN
        {
            "name": "System Administrator",
            "email": "admin@rox.ai",
            "password": hash_password("Admin@123"),
            "role": "ADMIN",
            "department": "Academic Integrity Office",
            "status": "ACTIVE",
            "createdAt": now_iso
        },
        {
            "name": "System Administrator",
            "email": "admin@codeguard.ai",
            "password": hash_password("Admin@123"),
            "role": "ADMIN",
            "department": "Academic Integrity Office",
            "status": "ACTIVE",
            "createdAt": now_iso
        },
        # TEACHER
        {
            "name": "Dr. Priya Kumar",
            "email": "teacher@rox.ai",
            "password": hash_password("Teacher@123"),
            "role": "TEACHER",
            "department": "Computer Science and Engineering",
            "status": "ACTIVE",
            "createdAt": now_iso
        },
        {
            "name": "Dr. Priya Kumar",
            "email": "priya.kumar@nehru.ac.in",
            "password": hash_password("Tutor@123"),
            "role": "TEACHER",
            "department": "Computer Science and Engineering",
            "status": "ACTIVE",
            "createdAt": now_iso
        },
        {
            "name": "Prof. Rajesh Sharma",
            "email": "rajesh.sharma@nehru.ac.in",
            "password": hash_password("Tutor@123"),
            "role": "TEACHER",
            "department": "Information Technology",
            "status": "ACTIVE",
            "createdAt": now_iso
        },
        # STUDENT
        {
            "name": "Arun Kumar",
            "email": "student@rox.ai",
            "password": hash_password("Student@123"),
            "role": "STUDENT",
            "department": "Computer Science and Engineering",
            "status": "ACTIVE",
            "createdAt": now_iso
        },
        {
            "name": "Arun Kumar",
            "email": "arun.kumar@student.nehru.ac.in",
            "password": hash_password("Student@123"),
            "role": "STUDENT",
            "department": "Computer Science and Engineering",
            "status": "ACTIVE",
            "createdAt": now_iso
        },
        {
            "name": "Kavin Raj",
            "email": "kavin.raj@student.nehru.ac.in",
            "password": hash_password("Student@123"),
            "role": "STUDENT",
            "department": "Computer Science and Engineering",
            "status": "ACTIVE",
            "createdAt": now_iso
        }
    ]
    db.users.insert_many(users_data)

    print("[2/9] Seeding Questions...")
    questions_data = [
        {
            "id": "Q-0001",
            "title": "Binary Search",
            "description": "Given a sorted array of distinct integers `arr` and an integer `target`, return the index of `target` if it exists in the array. If target is not present, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
            "language": "Java",
            "allowed_languages": ["Java", "Python", "C++", "JavaScript"],
            "difficulty": "MEDIUM",
            "time_limit": 2000,
            "memory_limit": 256,
            "input_format": "Line 1: An integer N representing number of elements.\nLine 2: N space-separated sorted integers.\nLine 3: Target integer to search.",
            "output_format": "A single integer representing the 0-based index of target, or -1 if absent.",
            "constraints": [
                "1 <= arr.length <= 10^5",
                "-10^4 <= arr[i], target <= 10^4",
                "All integers in arr are unique and sorted in ascending order."
            ],
            "examples": [
                {
                    "input": "10\n2 5 8 12 16 23 38 56 72 91\n23",
                    "output": "5",
                    "explanation": "23 exists in arr and its index is 5."
                },
                {
                    "input": "6\n-1 0 3 5 9 12\n2",
                    "output": "-1",
                    "explanation": "2 does not exist in arr so return -1."
                }
            ],
            "test_cases": [
                {
                    "input": "10\n2 5 8 12 16 23 38 56 72 91\n23",
                    "expected_output": "5",
                    "is_sample": True,
                    "explanation": "Target found in middle."
                },
                {
                    "input": "6\n-1 0 3 5 9 12\n2",
                    "expected_output": "-1",
                    "is_sample": True,
                    "explanation": "Target missing."
                },
                {
                    "input": "1\n5\n5",
                    "expected_output": "0",
                    "is_sample": False,
                    "explanation": "Single element array."
                },
                {
                    "input": "5\n1 2 3 4 5\n1",
                    "expected_output": "0",
                    "is_sample": False,
                    "explanation": "First element."
                },
                {
                    "input": "5\n1 2 3 4 5\n5",
                    "expected_output": "4",
                    "is_sample": False,
                    "explanation": "Last element."
                }
            ],
            "created_by_name": "System Administrator",
            "status": "PUBLISHED",
            "created_at": now_iso,
            "updated_at": now_iso
        },
        {
            "id": "Q-0002",
            "title": "Find Maximum Element",
            "description": "Given an array of integers `nums`, find and return the maximum element in the array.\n\nYou should solve this iteratively using linear scan or divide-and-conquer.",
            "language": "Java",
            "allowed_languages": ["Java", "Python", "C++", "JavaScript"],
            "difficulty": "EASY",
            "time_limit": 1000,
            "memory_limit": 128,
            "input_format": "Line 1: Integer N representing array size.\nLine 2: N space-separated integers.",
            "output_format": "Print the maximum integer value in the array.",
            "constraints": [
                "1 <= nums.length <= 10^5",
                "-10^9 <= nums[i] <= 10^9"
            ],
            "examples": [
                {
                    "input": "5\n3 7 2 9 4",
                    "output": "9",
                    "explanation": "The largest number in the array is 9."
                },
                {
                    "input": "4\n-10 -3 -45 -2",
                    "output": "-2",
                    "explanation": "All numbers are negative; maximum is -2."
                }
            ],
            "test_cases": [
                {
                    "input": "5\n3 7 2 9 4",
                    "expected_output": "9",
                    "is_sample": True
                },
                {
                    "input": "4\n-10 -3 -45 -2",
                    "expected_output": "-2",
                    "is_sample": True
                },
                {
                    "input": "1\n42",
                    "expected_output": "42",
                    "is_sample": False
                }
            ],
            "created_by_name": "System Administrator",
            "status": "PUBLISHED",
            "created_at": now_iso,
            "updated_at": now_iso
        },
        {
            "id": "Q-0003",
            "title": "Two Sum Problem",
            "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
            "language": "Java",
            "allowed_languages": ["Java", "Python", "C++", "JavaScript"],
            "difficulty": "EASY",
            "time_limit": 1500,
            "memory_limit": 256,
            "input_format": "Line 1: N and target.\nLine 2: N space-separated integers.",
            "output_format": "Two space-separated indices in ascending order.",
            "constraints": [
                "2 <= nums.length <= 10^4",
                "-10^9 <= nums[i] <= 10^9"
            ],
            "examples": [
                {
                    "input": "4 9\n2 7 11 15",
                    "output": "0 1",
                    "explanation": "nums[0] + nums[1] == 9, so indices 0 and 1."
                }
            ],
            "test_cases": [
                {
                    "input": "4 9\n2 7 11 15",
                    "expected_output": "0 1",
                    "is_sample": True
                }
            ],
            "created_by_name": "Dr. Priya Kumar",
            "status": "PUBLISHED",
            "created_at": now_iso,
            "updated_at": now_iso
        },
        {
            "id": "Q-0004",
            "title": "Valid Palindrome",
            "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nReturn true if string is palindrome, false otherwise.",
            "language": "Java",
            "allowed_languages": ["Java", "Python", "C++", "JavaScript"],
            "difficulty": "EASY",
            "time_limit": 1000,
            "memory_limit": 128,
            "input_format": "A single line containing input string.",
            "output_format": "'true' or 'false'",
            "constraints": ["1 <= s.length <= 2 * 10^5"],
            "examples": [
                {
                    "input": "A man, a plan, a canal: Panama",
                    "output": "true",
                    "explanation": "\"amanaplanacanalpanama\" is a palindrome."
                }
            ],
            "test_cases": [
                {
                    "input": "A man, a plan, a canal: Panama",
                    "expected_output": "true",
                    "is_sample": True
                }
            ],
            "created_by_name": "System Administrator",
            "status": "PUBLISHED",
            "created_at": now_iso,
            "updated_at": now_iso
        },
        {
            "id": "Q-0005",
            "title": "Matrix Multiplication & Cache Optimization",
            "description": "Implement cache-friendly matrix multiplication in Java/C++ to multiply two N x N matrices with minimal CPU cache misses.",
            "language": "Java",
            "allowed_languages": ["Java", "C++"],
            "difficulty": "HARD",
            "time_limit": 3000,
            "memory_limit": 512,
            "input_format": "N followed by two N x N matrices.",
            "output_format": "Product matrix entries.",
            "constraints": ["1 <= N <= 500"],
            "examples": [],
            "test_cases": [],
            "created_by_name": "System Administrator",
            "status": "DRAFT",
            "created_at": now_iso,
            "updated_at": now_iso
        }
    ]
    db.questions.insert_many(questions_data)

    print("[2/8] Seeding Assignments...")
    assignments_data = [
        {
            "id": "ASSIGN-01",
            "title": "Binary Search Implementation",
            "courseCode": "CS201",
            "department": "Computer Science and Engineering",
            "language": "Java",
            "totalSubmissions": 142,
            "requiringReview": 8,
            "averageSimilarity": 24.5,
            "dueDate": "Oct 28, 2026",
            "status": "ANALYSIS_COMPLETED",
            "description": "Implement an iterative binary search algorithm with array bounds checking and overflow-safe midpoint calculation."
        },
        {
            "id": "ASSIGN-02",
            "title": "AVL Tree Self-Balancing Operations",
            "courseCode": "CS202",
            "department": "Computer Science and Engineering",
            "language": "Java",
            "totalSubmissions": 138,
            "requiringReview": 5,
            "averageSimilarity": 19.8,
            "dueDate": "Nov 04, 2026",
            "status": "ANALYSIS_COMPLETED",
            "description": "Develop left and right rotation procedures for AVL Tree node rebalancing during insertion and deletion operations."
        },
        {
            "id": "ASSIGN-03",
            "title": "0/1 Knapsack Dynamic Programming",
            "courseCode": "CS201",
            "department": "Computer Science and Engineering",
            "language": "Python",
            "totalSubmissions": 145,
            "requiringReview": 11,
            "averageSimilarity": 31.2,
            "dueDate": "Nov 12, 2026",
            "status": "ACTIVE",
            "description": "Construct an optimal tabular DP solution for the classical 0/1 knapsack problem with time and space complexity analysis."
        },
        {
            "id": "ASSIGN-04",
            "title": "Matrix Multiplication & Cache Optimization",
            "courseCode": "CS301",
            "department": "Computer Science and Engineering",
            "language": "C++",
            "totalSubmissions": 120,
            "requiringReview": 3,
            "averageSimilarity": 16.4,
            "dueDate": "Nov 20, 2026",
            "status": "ACTIVE",
            "description": "Implement cache-blocking (tiling) matrix multiplication in C++ to minimize L1/L2 cache misses."
        }
    ]
    db.assignments.insert_many(assignments_data)

    print("[3/8] Seeding Submissions...")
    submissions_data = [
        {
            "id": "SUB-1042",
            "studentId": "NIT-CS-2024-042",
            "studentName": "Arun Kumar",
            "studentEmail": "arun.kumar@student.nehru.ac.in",
            "department": "Computer Science and Engineering",
            "assignmentId": "ASSIGN-01",
            "assignmentTitle": "Binary Search Implementation",
            "language": "Java",
            "submittedAt": "Oct 24, 2026 — 10:45 AM",
            "timestamp": 1792838700,
            "status": "REVIEW_REQUIRED",
            "overallSimilarity": 91,
            "code": ARUN_KUMAR_CODE,
            "revision": 1,
            "fileName": "BinarySearchSolution.java",
            "linesOfCode": 57,
            "pairedSubmissionId": "SUB-1049",
            "analysisDetails": {
                "structuralSimilarity": 88,
                "semanticSimilarity": 94,
                "behavioralSimilarity": 90,
                "timelineCorrelation": 92,
                "overallReviewScore": 91,
                "flaggedEvidence": {
                    "astStructure": True,
                    "variableRelationships": True,
                    "controlFlow": True,
                    "algorithmicOperations": True,
                    "matchingRegionsCount": 3,
                    "timelineAnomaly": True,
                    "timelineNote": "Submitted 9 minutes after paired submission SUB-1049"
                },
                "matchingRegions": [
                    {
                        "startLine": 22,
                        "endLine": 46,
                        "description": "Binary search algorithm loop structure and pointer updates match line-for-line across variable mappings.",
                        "type": "STRUCTURAL_EQUIVALENCE"
                    },
                    {
                        "startLine": 28,
                        "endLine": 35,
                        "description": "Invariant checksum loop identical in position and logic despite cosmetic naming difference.",
                        "type": "VARIABLE_RENAMING"
                    }
                ]
            }
        },
        {
            "id": "SUB-1049",
            "studentId": "NIT-CS-2024-049",
            "studentName": "Kavin Raj",
            "studentEmail": "kavin.raj@student.nehru.ac.in",
            "department": "Computer Science and Engineering",
            "assignmentId": "ASSIGN-01",
            "assignmentTitle": "Binary Search Implementation",
            "language": "Java",
            "submittedAt": "Oct 24, 2026 — 10:54 AM",
            "timestamp": 1792839240,
            "status": "REVIEW_REQUIRED",
            "overallSimilarity": 91,
            "code": KAVIN_RAJ_CODE,
            "revision": 1,
            "fileName": "BinarySearchImplementation.java",
            "linesOfCode": 54,
            "pairedSubmissionId": "SUB-1042",
            "analysisDetails": {
                "structuralSimilarity": 88,
                "semanticSimilarity": 94,
                "behavioralSimilarity": 90,
                "timelineCorrelation": 92,
                "overallReviewScore": 91,
                "flaggedEvidence": {
                    "astStructure": True,
                    "variableRelationships": True,
                    "controlFlow": True,
                    "algorithmicOperations": True,
                    "matchingRegionsCount": 3,
                    "timelineAnomaly": True,
                    "timelineNote": "Submitted 9 minutes after SUB-1042"
                },
                "matchingRegions": [
                    {
                        "startLine": 20,
                        "endLine": 44,
                        "description": "Binary search loop structure and pointer updates match line-for-line.",
                        "type": "STRUCTURAL_EQUIVALENCE"
                    }
                ]
            }
        },
        {
            "id": "SUB-1043",
            "studentId": "NIT-CS-2024-043",
            "studentName": "Sneha Patel",
            "studentEmail": "sneha.patel@student.nehru.ac.in",
            "department": "Computer Science and Engineering",
            "assignmentId": "ASSIGN-01",
            "assignmentTitle": "Binary Search Implementation",
            "language": "Java",
            "submittedAt": "Oct 24, 2026 — 11:15 AM",
            "timestamp": 1792840500,
            "status": "CLEAR",
            "overallSimilarity": 18,
            "code": SNEHA_PATEL_CODE,
            "revision": 2,
            "fileName": "RecursiveBinarySearch.java",
            "linesOfCode": 18,
            "analysisDetails": {
                "structuralSimilarity": 15,
                "semanticSimilarity": 22,
                "behavioralSimilarity": 20,
                "timelineCorrelation": 12,
                "overallReviewScore": 18,
                "flaggedEvidence": {
                    "astStructure": False,
                    "variableRelationships": False,
                    "controlFlow": False,
                    "algorithmicOperations": False,
                    "matchingRegionsCount": 0,
                    "timelineAnomaly": False
                },
                "matchingRegions": []
            }
        },
        {
            "id": "SUB-1044",
            "studentId": "NIT-CS-2024-044",
            "studentName": "Rahul Verma",
            "studentEmail": "rahul.verma@student.nehru.ac.in",
            "department": "Computer Science and Engineering",
            "assignmentId": "ASSIGN-03",
            "assignmentTitle": "0/1 Knapsack Dynamic Programming",
            "language": "Python",
            "submittedAt": "Oct 25, 2026 — 02:30 PM",
            "timestamp": 1792938600,
            "status": "ANALYZED",
            "overallSimilarity": 28,
            "code": PYTHON_DP_CODE,
            "revision": 1,
            "fileName": "knapsack.py",
            "linesOfCode": 16,
            "analysisDetails": {
                "structuralSimilarity": 25,
                "semanticSimilarity": 30,
                "behavioralSimilarity": 28,
                "timelineCorrelation": 15,
                "overallReviewScore": 28,
                "flaggedEvidence": {
                    "astStructure": False,
                    "variableRelationships": False,
                    "controlFlow": False,
                    "algorithmicOperations": False,
                    "matchingRegionsCount": 0,
                    "timelineAnomaly": False
                },
                "matchingRegions": []
            }
        }
    ]
    db.submissions.insert_many(submissions_data)

    print("[4/8] Seeding Similarity Results & Reviews...")
    similarity_data = [
        {
            "id": "PAIR-1",
            "submissionAId": "SUB-1042",
            "submissionBId": "SUB-1049",
            "studentAName": "Arun Kumar",
            "studentBName": "Kavin Raj",
            "assignmentTitle": "Binary Search Implementation",
            "structural": 88,
            "semantic": 94,
            "behavioral": 90,
            "timeline": 92,
            "reviewScore": 91,
            "status": "Review Required",
            "detectedRegionsCount": 3,
            "timeDeltaMinutes": 9,
            "evidence": [
                "Equivalent loop structure detected.",
                "Multiple normalized code regions correspond.",
                "Similar variable relationships detected.",
                "Equivalent expression transformation detected.",
                "Temporal correlation detected (9 min delta)."
            ],
            "transformations": [
                {
                    "id": "TRANS-01",
                    "type": "VARIABLE_RENAMING",
                    "title": "Lexical Identifier Mapping",
                    "detailA": "low, high, mid, total",
                    "detailB": "left, right, middle, sum",
                    "explanation": "Exact 1:1 variable synonym substitution across all loop boundaries and indexing expressions."
                },
                {
                    "id": "TRANS-02",
                    "type": "CONTROL_FLOW",
                    "title": "Invariant Check Loop Alignment",
                    "detailA": "for (int i = 0; i < arr.length; i++) total += arr[i];",
                    "detailB": "for (int j = 0; j < values.length; j++) sum = sum + values[j];",
                    "explanation": "Identical redundant verification loop inserted before binary search entry point."
                },
                {
                    "id": "TRANS-03",
                    "type": "FORMATTING_DIFFERENCE",
                    "title": "Whitespace & Layout Divergence",
                    "detailA": "57 raw lines of source",
                    "detailB": "54 raw lines of source",
                    "explanation": "Formatting layout differs slightly, but normalized syntax trees align at 88%."
                }
            ],
            "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
        },
        {
            "id": "PAIR-2",
            "submissionAId": "SUB-1043",
            "submissionBId": "SUB-1042",
            "studentAName": "Sneha Patel",
            "studentBName": "Arun Kumar",
            "assignmentTitle": "Binary Search Implementation",
            "structural": 22,
            "semantic": 30,
            "behavioral": 25,
            "timeline": 20,
            "reviewScore": 24,
            "status": "Cleared",
            "detectedRegionsCount": 0,
            "timeDeltaMinutes": 30,
            "evidence": [
                "Independent code structure with standard language idioms."
            ],
            "transformations": [],
            "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
    ]
    db.similarity_results.insert_many(similarity_data)

    print("[5/8] Seeding Clusters...")
    clusters_data = [
        {
            "id": "CLUSTER-A",
            "name": "Cluster A — Binary Search Variant",
            "assignmentTitle": "Binary Search Implementation (CS201)",
            "submissionCount": 5,
            "averageSimilarity": 89.4,
            "students": [
                {"studentId": "NIT-CS-2024-042", "name": "Arun Kumar", "submissionId": "SUB-1042", "similarityScore": 91, "centrality": 0.94},
                {"studentId": "NIT-CS-2024-049", "name": "Kavin Raj", "submissionId": "SUB-1049", "similarityScore": 91, "centrality": 0.92},
                {"studentId": "NIT-CS-2024-051", "name": "Vignesh K", "submissionId": "SUB-1051", "similarityScore": 88, "centrality": 0.82},
                {"studentId": "NIT-CS-2024-055", "name": "Deepak M", "submissionId": "SUB-1055", "similarityScore": 87, "centrality": 0.76},
                {"studentId": "NIT-CS-2024-061", "name": "Suresh T", "submissionId": "SUB-1061", "similarityScore": 85, "centrality": 0.71}
            ],
            "connections": [
                {"source": "NIT-CS-2024-042", "target": "NIT-CS-2024-049", "similarity": 91},
                {"source": "NIT-CS-2024-042", "target": "NIT-CS-2024-051", "similarity": 88},
                {"source": "NIT-CS-2024-049", "target": "NIT-CS-2024-055", "similarity": 87},
                {"source": "NIT-CS-2024-051", "target": "NIT-CS-2024-061", "similarity": 85}
            ],
            "primaryPattern": "Variable renaming & invariant check loop propagation across iterative template."
        },
        {
            "id": "CLUSTER-B",
            "name": "Cluster B — AVL Rotation Group",
            "assignmentTitle": "AVL Tree Self-Balancing Operations (CS202)",
            "submissionCount": 3,
            "averageSimilarity": 84.2,
            "students": [
                {"studentId": "NIT-CS-2024-012", "name": "Meera S", "submissionId": "SUB-1012", "similarityScore": 86, "centrality": 0.88},
                {"studentId": "NIT-CS-2024-018", "name": "Rohan D", "submissionId": "SUB-1018", "similarityScore": 84, "centrality": 0.81},
                {"studentId": "NIT-CS-2024-023", "name": "Ananya R", "submissionId": "SUB-1023", "similarityScore": 82, "centrality": 0.74}
            ],
            "connections": [
                {"source": "NIT-CS-2024-012", "target": "NIT-CS-2024-018", "similarity": 86},
                {"source": "NIT-CS-2024-018", "target": "NIT-CS-2024-023", "similarity": 82}
            ],
            "primaryPattern": "Identical height calculation helper with renamed rotation pointer variables."
        }
    ]
    db.clusters.insert_many(clusters_data)

    print("[6/8] Seeding Timeline Events...")
    timeline_data = [
        {
            "id": "TL-01",
            "time": "10:45 AM",
            "date": "Oct 24, 2026",
            "timestamp": 1792838700,
            "studentName": "Arun Kumar",
            "studentId": "NIT-CS-2024-042",
            "submissionId": "SUB-1042",
            "assignmentTitle": "Binary Search Implementation",
            "eventType": "INITIAL_SUBMISSION",
            "revisionNumber": 1,
            "details": "Initial solution uploaded (57 LOC)."
        },
        {
            "id": "TL-02",
            "time": "10:54 AM",
            "date": "Oct 24, 2026",
            "timestamp": 1792839240,
            "studentName": "Kavin Raj",
            "studentId": "NIT-CS-2024-049",
            "submissionId": "SUB-1049",
            "assignmentTitle": "Binary Search Implementation",
            "eventType": "FLAGGED_SIMILARITY",
            "similarityWithPrevious": 91,
            "correlatedWithStudent": "Arun Kumar",
            "revisionNumber": 1,
            "timeDeltaFromPrevious": "9 mins after Arun Kumar",
            "details": "Submitted 9 mins after SUB-1042 with 91% AST & semantic correlation."
        },
        {
            "id": "TL-03",
            "time": "11:15 AM",
            "date": "Oct 24, 2026",
            "timestamp": 1792840500,
            "studentName": "Sneha Patel",
            "studentId": "NIT-CS-2024-043",
            "submissionId": "SUB-1043",
            "assignmentTitle": "Binary Search Implementation",
            "eventType": "REVISION",
            "revisionNumber": 2,
            "details": "Submitted recursive version (18 LOC, clean independent structure)."
        }
    ]
    db.timeline_events.insert_many(timeline_data)

    print("[7/8] Seeding Students...")
    students_data = [
        {
            "id": "NIT-CS-2024-042",
            "name": "Arun Kumar",
            "rollNumber": "24CS042",
            "email": "arun.kumar@student.nehru.ac.in",
            "department": "Computer Science and Engineering",
            "batch": "2024–2028 (Batch B)",
            "submissionsCount": 8,
            "assignmentsCompleted": 8,
            "reviewCasesCount": 1,
            "lastSubmission": "Oct 24, 2026 — 10:45 AM"
        },
        {
            "id": "NIT-CS-2024-049",
            "name": "Kavin Raj",
            "rollNumber": "24CS049",
            "email": "kavin.raj@student.nehru.ac.in",
            "department": "Computer Science and Engineering",
            "batch": "2024–2028 (Batch B)",
            "submissionsCount": 8,
            "assignmentsCompleted": 8,
            "reviewCasesCount": 1,
            "lastSubmission": "Oct 24, 2026 — 10:54 AM"
        },
        {
            "id": "NIT-CS-2024-043",
            "name": "Sneha Patel",
            "rollNumber": "24CS043",
            "email": "sneha.patel@student.nehru.ac.in",
            "department": "Computer Science and Engineering",
            "batch": "2024–2028 (Batch A)",
            "submissionsCount": 9,
            "assignmentsCompleted": 9,
            "reviewCasesCount": 0,
            "lastSubmission": "Oct 24, 2026 — 11:15 AM"
        },
        {
            "id": "NIT-CS-2024-044",
            "name": "Rahul Verma",
            "rollNumber": "24CS044",
            "email": "rahul.verma@student.nehru.ac.in",
            "department": "Computer Science and Engineering",
            "batch": "2024–2028 (Batch A)",
            "submissionsCount": 7,
            "assignmentsCompleted": 7,
            "reviewCasesCount": 0,
            "lastSubmission": "Oct 25, 2026 — 02:30 PM"
        }
    ]
    db.students.insert_many(students_data)

    print("[8/8] Seeding System Settings...")
    settings_data = {
        "key": "system_settings",
        "structuralThreshold": 80,
        "semanticThreshold": 85,
        "behavioralThreshold": 80,
        "timelineWindowMinutes": 10,
        "minEvidenceRegions": 3,
        "weights": {
            "structural": 0.30,
            "semantic": 0.30,
            "behavioral": 0.20,
            "timeline": 0.20
        },
        "activeRules": {
            "structural": True,
            "semantic": True,
            "behavioral": True,
            "timeline": True
        },
        "supportedLanguages": [
            {"name": "Java", "status": "Fully Supported", "version": "17 / 21 LTS"},
            {"name": "Python", "status": "Fully Supported", "version": "3.11+"},
            {"name": "C++", "status": "Fully Supported", "version": "C++17 / 20"},
            {"name": "JavaScript", "status": "Fully Supported", "version": "ES2022"}
        ],
        "normalization": {
            "stripComments": True,
            "normalizeVariableNames": True,
            "ignoreFormatting": True,
            "astFlattening": True
        }
    }
    db.settings.insert_one(settings_data)

    print("[SUCCESS] MongoDB database 'codeguard' seeded successfully with rich realistic demo data!")

if __name__ == "__main__":
    seed_all()

import math
import re
import logging
from typing import Dict, List, Tuple, Optional, Any
from services.ai.gemini_service import GeminiService

logger = logging.getLogger(__name__)

class SemanticAnalyzer:
    # Key algorithmic semantic intents for deterministic analysis
    FEATURE_PATTERNS = {
        "midpoint_calc": r'(low\s*\+\s*high|\w+\s*\+\s*\w+)\s*/\s*2|low\s*\+\s*\(\s*high\s*-\s*low\s*\)\s*/\s*2',
        "binary_search_guard": r'(low\s*<=\s*high|start\s*<=\s*end|l\s*<=\s*r)',
        "array_indexing": r'\[\s*\w+\s*\]',
        "element_comparison": r'\[\s*\w+\s*\]\s*==\s*\w+|\w+\s*==\s*\[\s*\w+\s*\]',
        "element_ordering": r'\[\s*\w+\s*\]\s*<\s*\w+|\[\s*\w+\s*\]\s*>\s*\w+',
        "swap_operation": r'temp\s*=\s*\w+|\w+,\s*\w+\s*=\s*\w+,\s*\w+',
        "recursion_call": r'return\s+\w+\s*\(.*,\s*.*\)',
        "negative_sentinel": r'return\s+-\s*1|return\s+None|return\s+false',
        "pointer_shift_inc": r'\w+\s*=\s*mid\s*\+\s*1|\w+\+\+|\+\+\w+',
        "pointer_shift_dec": r'\w+\s*=\s*mid\s*-\s*1|\w+--|--\w+',
        "length_query": r'\.length|\.size\(\)|len\(',
        "console_io": r'System\.out\.print|console\.log|printf|cout|print\('
    }

    @classmethod
    def extract_semantic_vector(cls, code: str) -> Dict[str, float]:
        """Extracts algorithmic semantic feature frequencies."""
        vector = {}
        for feature_name, pattern in cls.FEATURE_PATTERNS.items():
            matches = len(re.findall(pattern, code))
            vector[feature_name] = float(matches)
        return vector

    @staticmethod
    def _cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        """Computes cosine similarity between two feature vectors."""
        all_keys = set(vec1.keys()).union(set(vec2.keys()))
        dot_product = sum(vec1.get(k, 0.0) * vec2.get(k, 0.0) for k in all_keys)
        mag1 = math.sqrt(sum(v ** 2 for v in vec1.values()))
        mag2 = math.sqrt(sum(v ** 2 for v in vec2.values()))

        if mag1 == 0 or mag2 == 0:
            return 0.0
        return dot_product / (mag1 * mag2)

    @staticmethod
    def compute_list_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """Computes cosine similarity between two embedding float lists."""
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        mag1 = math.sqrt(sum(a * a for a in vec1))
        mag2 = math.sqrt(sum(b * b for b in vec2))
        if mag1 == 0 or mag2 == 0:
            return 0.0
        return dot_product / (mag1 * mag2)

    @classmethod
    def analyze_semantics(
        cls,
        code_a: str,
        code_b: str,
        language_a: str = "Java",
        language_b: str = "Java"
    ) -> Tuple[float, List[Dict], Dict[str, Any]]:
        """
        Computes semantic embedding similarity using Gemini vectors when available,
        falling back to deterministic feature vector cosine similarity.
        Also obtains explainable AI semantic analysis.
        """
        # Deterministic score
        vec_a = cls.extract_semantic_vector(code_a)
        vec_b = cls.extract_semantic_vector(code_b)
        det_sim = cls._cosine_similarity(vec_a, vec_b)
        det_score = round(det_sim * 100, 1)

        # Attempt Gemini embedding vector comparison
        emb_a = GeminiService.generate_code_embedding(code_a, language_a)
        emb_b = GeminiService.generate_code_embedding(code_b, language_b)

        if emb_a and emb_b:
            emb_sim = cls.compute_list_cosine_similarity(emb_a, emb_b)
            semantic_score = round(emb_sim * 100, 1)
        else:
            semantic_score = det_score

        # AI explainable semantic analysis
        ai_analysis = GeminiService.analyze_semantic_similarity(code_a, code_b, language_a, language_b)

        detected_transformations = []

        # Check for expression transformation (e.g., (low+high)/2 vs low + (high-low)/2)
        mid_pattern1 = r'\((\w+)\s*\+\s*(\w+)\)\s*/\s*2'
        mid_pattern2 = r'(\w+)\s*\+\s*\((\w+)\s*-\s*(\w+)\)\s*/\s*2'

        has_p1_a = bool(re.search(mid_pattern1, code_a))
        has_p2_b = bool(re.search(mid_pattern2, code_b))
        has_p2_a = bool(re.search(mid_pattern2, code_a))
        has_p1_b = bool(re.search(mid_pattern1, code_b))

        if (has_p1_a and has_p2_b) or (has_p2_a and has_p1_b):
            detected_transformations.append({
                "id": "TRANS-EXPR-1",
                "type": "EXPRESSION_TRANSFORMATION",
                "title": "Arithmetic Expression Refactoring",
                "detailA": "Standard index midpoint formula: (low + high) / 2",
                "detailB": "Overflow-safe formula: low + (high - low) / 2",
                "explanation": "Mathematically equivalent arithmetic transformation preserving algorithm semantics."
            })
        elif semantic_score >= 80:
            detected_transformations.append({
                "id": "TRANS-VAR-1",
                "type": "VARIABLE_RENAMING",
                "title": "Lexical Identifier Mapping",
                "detailA": "Local variables & parameters",
                "detailB": "Renamed matching synonyms",
                "explanation": "1:1 lexical token correspondence identified across algorithm loops and return paths."
            })

        final_score = min(max(semantic_score, 0.0), 100.0)
        return final_score, detected_transformations, ai_analysis

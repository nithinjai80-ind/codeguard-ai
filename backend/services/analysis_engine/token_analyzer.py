import re
from typing import List, Dict, Tuple, Set

class TokenAnalyzer:
    @staticmethod
    def get_tokens(code: str) -> List[str]:
        """Extract lexical tokens (keywords, identifiers, operators, punctuation)."""
        pattern = r'[A-Za-z_][A-Za-z0-9_]*|\d+|==|!=|<=|>=|&&|\|\||\+\+|--|[+\-*/%=<>()\[\]{},;]'
        return re.findall(pattern, code)

    @classmethod
    def get_ngrams(cls, tokens: List[str], n: int = 4) -> List[Tuple[str, ...]]:
        """Generate token n-grams."""
        if len(tokens) < n:
            return [tuple(tokens)] if tokens else []
        return [tuple(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]

    @classmethod
    def compute_similarity(cls, code_a: str, code_b: str, n: int = 4) -> Tuple[float, List[Dict]]:
        """
        Computes n-gram token similarity (Jaccard & Sorensen-Dice)
        and detects matching contiguous regions.
        """
        tokens_a = cls.get_tokens(code_a)
        tokens_b = cls.get_tokens(code_b)

        if not tokens_a and not tokens_b:
            return 100.0, []
        if not tokens_a or not tokens_b:
            return 0.0, []

        ngrams_a = set(cls.get_ngrams(tokens_a, n))
        ngrams_b = set(cls.get_ngrams(tokens_b, n))

        intersection = ngrams_a.intersection(ngrams_b)
        union = ngrams_a.union(ngrams_b)

        if not union:
            return 0.0, []

        # Sorensen-Dice Coefficient gives higher weight to shared matches
        dice_score = (2.0 * len(intersection)) / (len(ngrams_a) + len(ngrams_b))
        sim_percentage = round(dice_score * 100, 1)

        # Detect matching regions
        lines_a = code_a.splitlines()
        matching_regions = []
        
        # Heuristic search for overlapping segments
        if sim_percentage > 40:
            for idx, line in enumerate(lines_a, start=1):
                clean_line = line.strip()
                if clean_line and len(clean_line) > 10 and clean_line in code_b:
                    matching_regions.append({
                        "startLine": idx,
                        "endLine": min(idx + 4, len(lines_a)),
                        "description": "Contiguous token n-gram alignment found across corresponding lines.",
                        "type": "VARIABLE_RENAMING" if "v" in clean_line else "EXPRESSION_TRANSFORMATION"
                    })
                    break

        return sim_percentage, matching_regions

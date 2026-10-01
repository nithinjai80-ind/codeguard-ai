import ast
import re
from typing import Tuple, List, Dict

class ASTAnalyzer:
    @staticmethod
    def _get_python_ast_features(code: str) -> List[str]:
        """Extracts node types sequence from Python AST."""
        try:
            tree = ast.parse(code)
            node_types = []
            for node in ast.walk(tree):
                node_types.append(type(node).__name__)
            return node_types
        except Exception:
            return []

    @staticmethod
    def _extract_control_flow_skeleton(code: str) -> List[str]:
        """
        Extracts language-agnostic control flow skeleton (loops, conditionals, returns, blocks)
        for Java, C++, Python, JS.
        """
        tokens = []
        lines = code.splitlines()
        for line in lines:
            trimmed = line.strip()
            # Identify control flow keywords & blocks
            if re.search(r'\b(if|else\s+if|else)\b', trimmed):
                tokens.append("BRANCH_CONDITIONAL")
            if re.search(r'\b(while|for|do)\b', trimmed):
                tokens.append("LOOP_CONSTRUCT")
            if re.search(r'\b(return)\b', trimmed):
                tokens.append("RETURN_STATEMENT")
            if re.search(r'\b(try|catch|finally|throw|except)\b', trimmed):
                tokens.append("EXCEPTION_BLOCK")
            if re.search(r'\b(function|def|class|public\s+[a-zA-Z0-9_<>]+\s+[a-zA-Z0-9_]+\s*\()\b', trimmed):
                tokens.append("FUNCTION_SIGNATURE")
            if "==" in trimmed or "!=" in trimmed or "<=" in trimmed or ">=" in trimmed:
                tokens.append("RELATIONAL_OP")
            if "+=" in trimmed or "-=" in trimmed or "*=" in trimmed or "/=" in trimmed:
                tokens.append("MUTATION_OP")

        return tokens

    @classmethod
    def analyze_structure(cls, code_a: str, code_b: str, language: str = "Java") -> Tuple[float, List[Dict]]:
        """
        Computes AST / Structural similarity and identifies structural equivalence & loop transformations.
        """
        detected_transformations = []

        # If Python, attempt native AST comparison
        if language.lower() == "python":
            ast_nodes_a = cls._get_python_ast_features(code_a)
            ast_nodes_b = cls._get_python_ast_features(code_b)
            if ast_nodes_a and ast_nodes_b:
                set_a, set_b = set(ast_nodes_a), set(ast_nodes_b)
                overlap = len(set_a.intersection(set_b)) / max(len(set_a.union(set_b)), 1)
                # Sequence LCS-like ratio
                min_len = min(len(ast_nodes_a), len(ast_nodes_b))
                matching_positions = sum(1 for i in range(min_len) if ast_nodes_a[i] == ast_nodes_b[i])
                seq_ratio = matching_positions / max(len(ast_nodes_a), len(ast_nodes_b), 1)
                score = round((overlap * 0.4 + seq_ratio * 0.6) * 100, 1)
                return score, detected_transformations

        # Language-agnostic structural skeleton analysis
        skel_a = cls._extract_control_flow_skeleton(code_a)
        skel_b = cls._extract_control_flow_skeleton(code_b)

        if not skel_a and not skel_b:
            return 85.0, detected_transformations
        if not skel_a or not skel_b:
            return 20.0, detected_transformations

        # Calculate structural node overlap
        set_a = set(skel_a)
        set_b = set(skel_b)
        intersection = set_a.intersection(set_b)
        jaccard = len(intersection) / max(len(set_a.union(set_b)), 1)

        # Count frequencies
        freq_a = {item: skel_a.count(item) for item in set_a}
        freq_b = {item: skel_b.count(item) for item in set_b}
        
        diff_sum = 0
        total_sum = 0
        for item in set_a.union(set_b):
            c_a = freq_a.get(item, 0)
            c_b = freq_b.get(item, 0)
            diff_sum += abs(c_a - c_b)
            total_sum += max(c_a, c_b)

        freq_similarity = 1.0 - (diff_sum / max(total_sum, 1))
        structural_score = round((jaccard * 0.35 + freq_similarity * 0.65) * 100, 1)

        # Detect loop / control flow transformations
        has_while_a = "while" in code_a
        has_for_b = "for" in code_b
        has_while_b = "while" in code_b
        has_for_a = "for" in code_a

        if (has_while_a and has_for_b) or (has_for_a and has_while_b):
            detected_transformations.append({
                "id": "TRANS-LOOP-1",
                "type": "CONTROL_FLOW",
                "title": "Loop Construct Variation",
                "detailA": "Iterative loop block (while)",
                "detailB": "Indexed loop block (for)",
                "explanation": "Different loop primitives used to express identical algorithmic iteration invariants."
            })

        if structural_score >= 70:
            detected_transformations.append({
                "id": "TRANS-STRUCT-1",
                "type": "STRUCTURAL_EQUIVALENCE",
                "title": "AST Branch Hierarchy Alignment",
                "detailA": "Conditional boundary tree",
                "detailB": "Matching branch predicates",
                "explanation": "AST sub-trees yield identical control-flow graph invariants across execution paths."
            })

        return min(max(structural_score, 15.0), 99.0), detected_transformations

from typing import Tuple, Dict, Any, List
from services.sandbox_service import SandboxExecutionEngine

class BehavioralAnalyzer:
    @classmethod
    def analyze_behavior(cls, code_a: str, code_b: str, language: str = "Java") -> Tuple[float, Dict[str, Any]]:
        """
        Compares behavioral signatures generated via safe sandbox contract synthesizer.
        """
        sig_a = SandboxExecutionEngine.analyze_behavioral_signature(code_a, language)
        sig_b = SandboxExecutionEngine.analyze_behavioral_signature(code_b, language)

        contract_a = sig_a["contract"]
        contract_b = sig_b["contract"]

        matches = 0
        total = 4

        if contract_a["algorithmic_complexity"] == contract_b["algorithmic_complexity"]:
            matches += 1
        if contract_a["has_conditional_branch"] == contract_b["has_conditional_branch"]:
            matches += 1
        if contract_a["has_array_traversal"] == contract_b["has_array_traversal"]:
            matches += 1
        
        # State mutation similarity
        mut_a = contract_a["state_mutations_count"]
        mut_b = contract_b["state_mutations_count"]
        diff = abs(mut_a - mut_b)
        mut_similarity = max(1.0 - (diff / max(mut_a, mut_b, 1)), 0.0)
        
        base_match_ratio = matches / total
        behavioral_score = round((base_match_ratio * 0.7 + mut_similarity * 0.3) * 100, 1)

        details = {
            "complexity_a": contract_a["algorithmic_complexity"],
            "complexity_b": contract_b["algorithmic_complexity"],
            "state_mutations_delta": diff,
            "sandbox_mode": sig_a["isolation_mode"]
        }

        return min(max(behavioral_score, 15.0), 98.0), details
